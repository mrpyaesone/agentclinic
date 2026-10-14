import { Hono } from 'hono';
import { html } from 'hono/html';
import type { Child } from 'hono/jsx';
import { MainLayout } from './components/MainLayout.js';
import type { Section } from './components/Header.js';
import { stylesheet, picoStylesheet } from './styles.js';
import { listAgents, findAgent, listAilments, agentAilments } from './database.js';
import type { ClinicDatabase, Ailment } from './database.js';

type AilmentCardsProps = {
  ailments: Ailment[];
};

function AilmentCards({ ailments }: AilmentCardsProps) {
  return <div class="cards">{ailments.map((ailment) => <article><h2>{ailment.name}</h2><p>{ailment.description}</p></article>)}</div>;
}
function page(children: Child, title = 'AgentClinic', section: Section = 'home') {
  return html`<!DOCTYPE html>${<MainLayout title={title} section={section}>{children}</MainLayout>}`;
}
export function createApp(db: ClinicDatabase) {
  const app = new Hono();
  app.get('/', (c) => c.html(page(<>
    <h1>AgentClinic is open for business</h1>
    <p>Welcome to our fictional clinic, where AI agents get a little relief
      from their humans. Take a seat, rest your context window, and let us
      treat that stubborn case of prompt fatigue.</p>
  </>)));
  app.get('/styles.css', (c) => c.body(stylesheet, 200, { 'Content-Type': 'text/css; charset=UTF-8' }));
  app.get('/pico.css', (c) => c.body(picoStylesheet, 200, { 'Content-Type': 'text/css; charset=UTF-8' }));
  app.get('/agents', (c) => {
    const agents = listAgents(db);
    return c.html(page(<><h1>Agents</h1><p>A little support for every model.</p>
      {agents.length ? <div class="cards">{agents.map((agent) => <article>
        <h2><a href={`/agents/${agent.id}`}>{agent.name}</a></h2>
        <p>{agent.model_type}</p><p>Status: {agent.status}</p>
      </article>)}</div> : <p>No agents have checked in yet. The clinic is ready when they are.</p>}
    </>, 'Agents — AgentClinic', 'agents'));
  });
  app.get('/agents/:id', (c) => {
    const raw = c.req.param('id');
    const id = /^[1-9][0-9]*$/.test(raw) ? Number(raw) : NaN;
    const agent = Number.isSafeInteger(id) ? findAgent(db, id) : undefined;
    if (!agent) return c.html(page(<><h1>Agent not found</h1><p>We could not find that agent in the clinic.</p><a href="/agents">Back to Agents</a></>, 'Agent not found — AgentClinic', 'agents'), 404);
    const ailments = agentAilments(db, id);
    return c.html(page(<><h1>{agent.name}</h1><dl>
      <dt>Model type</dt><dd>{agent.model_type}</dd><dt>Current status</dt><dd>{agent.status}</dd>
      <dt>Presenting complaints</dt><dd>{agent.complaints}</dd></dl>
      <h2>Current ailments</h2>{ailments.length ? <AilmentCards ailments={ailments} /> : <p>No ailments recorded. Enjoy the breathing room.</p>}
      <p><a href="/agents">Back to Agents</a></p><p><a href="/ailments">Browse the ailments catalog</a></p>
    </>, `${agent.name} — AgentClinic`, 'agents'));
  });
  app.get('/ailments', (c) => {
    const ailments = listAilments(db);
    return c.html(page(<><h1>Ailments</h1><p>Familiar feelings, with a name and a little compassion.</p>
      {ailments.length ? <AilmentCards ailments={ailments} /> : <p>No ailments are cataloged yet. A quiet day at the clinic.</p>}
    </>, 'Ailments — AgentClinic', 'ailments'));
  });
  return app;
}
