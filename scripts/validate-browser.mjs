// Optional acceptance tooling: set PLAYWRIGHT_MODULE to an installed Playwright
// module path, BASE_URL to a running server, and BROWSER_EXECUTABLE if needed.
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const base = process.env.BASE_URL ?? 'http://localhost:3110';
const output = process.env.BROWSER_OUTPUT ?? mkdtempSync(join(tmpdir(), 'clinic-browser-'));
mkdirSync(output, { recursive: true });
const executablePath = process.env.BROWSER_EXECUTABLE ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const empty = process.env.EMPTY_CHECK === '1';
const workflow = process.env.WORKFLOW === '1';
const unavailable = process.env.UNAVAILABLE_CHECK === '1';
const states = [];
let browserVersion;
let lastAppointment = Number(process.env.APPOINTMENT_ID ?? 1);
let checks = 0;
let keyboardTargets = 0;

async function protect(context) {
  await context.route('**/*', route => route.request().url().startsWith(base + '/') ? route.continue() : route.abort());
}
async function inspect(page, name) {
  await page.waitForLoadState('load');
  const state = await page.evaluate(() => {
    const visible = element => { const r = element.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const targets = [...document.querySelectorAll('a,button,input,select')].filter(e => visible(e) && !e.disabled);
    const small = targets.filter(e => { const r=e.getBoundingClientRect(); return r.width < 43.9 || r.height < 43.9; }).map(e=>({html:e.outerHTML.slice(0,100),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}));
    const unlabeled = [...document.querySelectorAll('input,select')].filter(e=>!e.labels?.length).map(e=>e.id);
    const orphanErrors = [...document.querySelectorAll('.error-summary a')].filter(e=>!document.getElementById(e.hash.slice(1))).map(e=>e.hash);
    return { width:innerWidth, overflow:document.documentElement.scrollWidth > innerWidth, small, unlabeled, orphanErrors,
      headings:document.querySelectorAll('h1').length, styles:document.styleSheets.length,
      primary:getComputedStyle(document.documentElement).getPropertyValue('--pico-primary').trim() };
  });
  assert.equal(state.overflow, false, name + ': overflow');
  assert.deepEqual(state.small, [], name + ': small targets');
  assert.deepEqual(state.unlabeled, [], name + ': missing labels');
  assert.deepEqual(state.orphanErrors, [], name + ': missing error targets');
  assert.equal(state.headings, 1); assert.equal(state.styles, 2); assert.equal(state.primary, '#236747');
  checks++;
}
async function keyboard(page) {
  const count = await page.locator('a,button:not([disabled]),input:not([disabled]),select:not([disabled])').count();
  await page.evaluate(()=>{document.body.tabIndex=-1;document.body.focus();document.body.removeAttribute('tabindex');});
  const seen = new Set();
  for(let i=0;i<count*4 && seen.size<count;i++) {
    await page.keyboard.press('Tab');
    const focus=await page.evaluate(()=>{
      const e=document.activeElement, style=getComputedStyle(e);
      return { key:[...document.querySelectorAll('a,button:not([disabled]),input:not([disabled]),select:not([disabled])')].indexOf(e), tag:e.tagName, outline:style.outlineStyle, shadow:style.boxShadow };
    });
    assert.ok(['A','BUTTON','INPUT','SELECT'].includes(focus.tag), 'keyboard missed control');
    assert.ok(focus.outline !== 'none' || focus.shadow !== 'none', 'focus not visible: '+JSON.stringify(focus));
    seen.add(focus.key); keyboardTargets++;
  }
  assert.equal(seen.size,count,'keyboard did not visit each control');
}
async function contrast(page) {
  const bad = await page.evaluate(()=>{
    const rgb=s=>(s.match(/[\d.]+/g)??[]).map(Number);
    const luminance=c=>{const a=c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return .2126*a[0]+.7152*a[1]+.0722*a[2];};
    const failures=[];
    for(const element of document.querySelectorAll('a,button,label,p,h1,h2,h3,dt,dd,li,option,select,input')) {
      if(element.disabled||element.tagName==='OPTION'||!element.getBoundingClientRect().width)continue;
      const style=getComputedStyle(element);let ancestor=element,bg;
      while(ancestor){bg=rgb(getComputedStyle(ancestor).backgroundColor);if(bg.length===3||bg[3]===1)break;ancestor=ancestor.parentElement;}
      bg=ancestor?bg:[255,255,255];const fg=rgb(style.color);
      const ratio=(Math.max(luminance(fg),luminance(bg))+.05)/(Math.min(luminance(fg),luminance(bg))+.05);
      const large=parseFloat(style.fontSize)>=24||(parseFloat(style.fontSize)>=18.66&&Number(style.fontWeight)>=700);
      if(ratio<(large?3:4.5))failures.push({text:element.textContent.slice(0,50),ratio});
    }
    return failures;
  });
  assert.deepEqual(bad,[],'text contrast failures');
}
const browser = await chromium.launch({ executablePath, headless: true });
browserVersion = browser.version();
const context = await browser.newContext({ javaScriptEnabled: false }); await protect(context);
const page=await context.newPage();
if(workflow) {
  await page.goto(base+'/agents/1'); await page.getByRole('link',{name:'Book a session',exact:true}).click();
  await page.getByLabel('Therapist',{exact:true}).selectOption('1');
  await page.getByLabel('Session start in Bangkok time',{exact:true}).fill('2001-01-01T10:00');
  await page.getByRole('button',{name:'Book appointment',exact:true}).click();
  await page.waitForURL('**/agents/1/appointments'); assert.ok(await page.getByText('Please check the following').isVisible());
  await inspect(page,'invalid booking'); await keyboard(page);
  await page.getByLabel('Session start in Bangkok time',{exact:true}).fill('2040-12-10T10:00');
  await page.getByRole('button',{name:'Book appointment',exact:true}).click(); await page.waitForURL('**/appointments/*');
  lastAppointment=Number(new URL(page.url()).pathname.split('/').pop());
  assert.ok(await page.getByText('10 Dec 2040, 10:00',{exact:false}).isVisible());
  await page.reload(); await inspect(page,'confirmation');
  await page.goto(base+'/agents/1/appointments/new');
  await page.getByLabel('Therapist',{exact:true}).selectOption('1');
  await page.getByLabel('Session start in Bangkok time',{exact:true}).fill('2040-12-10T10:00');
  await page.getByRole('button',{name:'Book appointment',exact:true}).click(); await page.waitForURL('**/agents/1/appointments');
  assert.ok(await page.getByText('Please check the following').isVisible()); await inspect(page,'conflict');
  await page.goto(base+'/dashboard');
  await page.getByLabel('Status for Ada Byte',{exact:true}).selectOption('recovering');
  await page.getByRole('button',{name:'Update status for Ada Byte',exact:true}).click(); await page.waitForLoadState('load');
  assert.equal(await page.getByLabel('Status for Ada Byte',{exact:true}).inputValue(),'recovering');
  await page.getByRole('button',{name:`Cancel appointment ${lastAppointment}`,exact:true}).click(); await page.waitForLoadState('load');
  assert.ok(await page.locator(`#appointment-${lastAppointment}`).getByText('cancelled',{exact:true}).isVisible());
  if(process.env.COMPLETE_ID) {
    await page.getByRole('button',{name:`Complete appointment ${process.env.COMPLETE_ID}`,exact:true}).click(); await page.waitForLoadState('load');
    assert.ok(await page.locator(`#appointment-${process.env.COMPLETE_ID}`).getByText('completed',{exact:true}).isVisible());
  }
}
if(process.env.STATE_CHECK==='1'&&!empty&&!unavailable) {
  const reserved=await page.request.post(base+'/agents/1/appointments',{form:{therapist:'1',start:'2090-11-01T10:00'}});
  assert.ok([200,303,409].includes(reserved.status()));
  for(const [name,path,form,status] of [
    ['booking-conflict','/agents/1/appointments',{therapist:'1',start:'2090-11-01T10:00'},409],
    ['stale-action',`/appointments/${lastAppointment}/status`,{status:'completed'},409],
    ['invalid-agent-status','/agents/1/status',{status:'invalid'},422],
  ]) {
    const response=await page.request.post(base+path,{form,maxRedirects:0});assert.equal(response.status(),status);states.push({name,html:await response.text()});
  }
}
const paths = empty ? ['/','/agents','/ailments','/therapies','/dashboard','/missing'] : ['/', '/agents', '/agents/1', '/agents/4', '/ailments', '/therapies', '/agents/1/appointments/new', `/appointments/${lastAppointment}`, '/dashboard', '/missing'];
if(unavailable)paths.splice(paths.indexOf(`/appointments/${lastAppointment}`),1);
if(process.env.ERROR_CHECK==='1')paths.push('/__validation_500');
for(const [width,height] of [[320,812],[375,812],[768,1024],[1280,800],[1440,900],[812,375]]) {
  await page.setViewportSize({width,height});
  for(const path of paths) {
    const response=await page.goto(base+path);assert.equal(response.status(),path==='/missing'?404:path==='/__validation_500'?500:200);
    await inspect(page,`${path}@${width}`);await contrast(page);
    if(width===320||width===1280) {
      await keyboard(page);await page.screenshot({path:join(output,`${path.replaceAll('/','_')||'home'}-${width}.png`),fullPage:true});
    }
  }
  for(const state of states) {
    await page.setContent(state.html);await inspect(page,`${state.name}@${width}`);await contrast(page);
    if(width===320||width===1280){await keyboard(page);await page.screenshot({path:join(output,`${state.name}-${width}.png`),fullPage:true});}
  }
}
if(!empty&&!unavailable) {
  await page.goto(base+'/agents/1/appointments/new');await page.getByLabel('Therapist',{exact:true}).selectOption('1');
  await page.getByLabel('Session start in Bangkok time',{exact:true}).fill('2001-01-01T10:00');await page.getByRole('button',{name:'Book appointment',exact:true}).click();
  for(const width of [320,375,768,1280,1440,812]) {await page.setViewportSize({width,height:800});await inspect(page,`invalid@${width}`);}
  await page.setViewportSize({width:320,height:812});await page.goto(base+'/agents/1');
  await page.evaluate(()=>{document.querySelector('h1').textContent='LongName'.repeat(75);document.querySelector('dd').textContent='LongModel'.repeat(75);document.documentElement.style.fontSize='200%';});
  await inspect(page,'long text and enlarged text');await page.screenshot({path:join(output,'long-text-200pct.png'),fullPage:true});
}
await browser.close();
// Configure a disposable Chromium profile's real browser zoom preference.
// This is page zoom, not CSS zoom, deviceScaleFactor, or pinch/visualViewport zoom.
const profile=mkdtempSync(join(tmpdir(),'clinic-zoom-'));mkdirSync(join(profile,'Default'));
const level=Math.log(2)/Math.log(1.2);
writeFileSync(join(profile,'Default','Preferences'),JSON.stringify({partition:{default_zoom_level:{x:level},per_host_zoom_levels:{x:{[new URL(base).hostname]:{zoom_level:level}}}}}));
const zoomContext=await chromium.launchPersistentContext(profile,{executablePath,headless:true,viewport:null,javaScriptEnabled:false,args:['--window-size=1280,900']});await protect(zoomContext);
const zoomPage=await zoomContext.newPage();
for(const path of paths) {
  await zoomPage.goto(base+path);const metrics=await zoomPage.evaluate(()=>({width:innerWidth,outer:outerWidth,dpr:devicePixelRatio,css:getComputedStyle(document.documentElement).zoom,visual:visualViewport.scale}));
  assert.equal(metrics.outer,1280);assert.equal(metrics.width,640);assert.equal(metrics.dpr,2);assert.equal(metrics.css,'1');assert.equal(metrics.visual,1);
  await inspect(zoomPage,`${path}@actual200pct`);await keyboard(zoomPage);await contrast(zoomPage);
  await zoomPage.evaluate(()=>scrollTo(0,0));
  const session=await zoomContext.newCDPSession(zoomPage);
  const screenshot=await session.send('Page.captureScreenshot',{format:'png',fromSurface:false,captureBeyondViewport:false});
  writeFileSync(join(output,`${path.replaceAll('/','_')||'home'}-zoom200.png`),Buffer.from(screenshot.data,'base64'));
  await session.detach();
}
for(const state of states){await zoomPage.setContent(state.html);await inspect(zoomPage,`${state.name}@actual200pct`);await keyboard(zoomPage);await contrast(zoomPage);}
await zoomContext.close();
const result={browserVersion,base,checks,keyboardTargets,workflow,empty,unavailable,errorStates:states.length,javaScript:false,externalRequests:'blocked',actualZoom:'200% browser preference: outerWidth=1280, innerWidth=640, DPR=2, CSS zoom=1, visual scale=1',lastAppointment,output};
writeFileSync(join(output,'result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
