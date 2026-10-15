import { FeedbackForm } from './components/FeedbackForm.js';
import { readFeedback, saveFeedback, listFeedback } from './feedback.js';
import { Hono } from 'hono';
import { html } from 'hono/html';
import type { Child } from 'hono/jsx';
import { MainLayout } from './components/MainLayout.js';
import type { Section } from './components/Header.js';
import { stylesheet, picoStylesheet } from './styles.js';
import { listAgents, findAgent, listAilments, agentAilments } from './database.js';
import type { ClinicDatabase } from './database.js';
import { AilmentCards, Recommendations, BookingForm, AppointmentDetails, Dashboard } from './components/ClinicPages.js';
import {
  publicId, listTherapies, agentRecommendations, bookAppointment, BookingConflict,
  MissingResource, findAppointment, changeAppointmentStatus, StaleAction, agentStatuses,
} from './clinic.js';
import { readForm, sameOrigin, selectedId } from './forms.js';
import { parseBangkokStart } from './time.js';
import type { Clock } from './time.js';

export type RequestLog = { method: string; path: string; status: number; elapsedMs: number };
export type ErrorLog = { event: string; method: string; path: string; error: string };
export type AppOptions = { clock?: Clock; log?: (entry: RequestLog) => void; logError?: (entry: ErrorLog) => void };
function page(children: Child, title = 'AgentClinic', section: Section = 'home') {
  return html`<!DOCTYPE html>${<MainLayout title={title} section={section}>{children}</MainLayout>}`;
}
function errorPage(title: string, message: string) {
  return page(<><h1>{title}</h1><p>{message}</p><p><a href="/agents">Back to Agents</a></p><p><a href="/dashboard">Staff dashboard</a></p></>, `${title} — AgentClinic`);
}
export function createApp(db: ClinicDatabase, options: AppOptions = {}) {
  const now = options.clock ?? Date.now;
  const log = options.log ?? ((entry) => console.log(JSON.stringify(entry)));
  const logError = options.logError ?? ((entry) => console.error(JSON.stringify(entry)));
  const app = new Hono();
  app.use('*', async (c, next) => {
    const started = performance.now();
    await next();
    log({ method: c.req.method, path: new URL(c.req.url).pathname, status: c.res.status, elapsedMs: Math.round(performance.now() - started) });
  });
  app.use('*', async (c, next) => {
    if (c.req.method === 'POST' && !sameOrigin(c.req.raw)) {
      return c.html(errorPage('Submission blocked', 'Please submit forms from this clinic site.'), 403);
    }
    await next();
  });
  app.notFound((c) => c.html(errorPage('Page not found', 'We could not find that page in the clinic.'), 404));
  app.onError((error, c) => {
    logError({ event: 'request_failed', method: c.req.method, path: new URL(c.req.url).pathname, error: error.name });
    return c.html(errorPage('The clinic needs a moment', 'Something went wrong. Please try again shortly.'), 500);
  });
  app.get('/', (c) => c.html(page(<>
    <h1>AgentClinic is open for business</h1>
    <p>Welcome to our fictional clinic, where AI agents get a little relief
      from their humans. Take a seat, rest your context window, and let us
      treat that stubborn case of prompt fatigue.</p>
  </>)));
  app.get('/styles.css', (c) => c.body(stylesheet, 200, { 'Content-Type': 'text/css; charset=UTF-8' }));
  app.get('/pico.css', (c) => c.body(picoStylesheet, 200, { 'Content-Type': 'text/css; charset=UTF-8' }));
  app.get('/feedback', (c) => c.html(page(<FeedbackForm feedback={listFeedback(db)} />, 'Feedback — AgentClinic', 'feedback')));
  app.get('/feedback/thanks', (c) => c.html(page(<>
    <h1>Thanks for the care!</h1><p>Your feedback has been saved. Our fictional clinic appreciates the check-in.</p>
    <p><a href="/feedback">View visitor feedback</a></p>
    <p><a href="/">Back to the clinic</a></p>
  </>, 'Thank you — AgentClinic', 'feedback')));
  app.post('/feedback', async (c) => {
    const { values, errors, status } = await readFeedback(c.req.raw);
    const form = () => page(<FeedbackForm values={values} errors={errors} feedback={listFeedback(db)} />, 'Check your feedback — AgentClinic', 'feedback');
    if (Object.keys(errors).length) return c.html(form(), status);
    try {
      saveFeedback(db, { name: values.name.trim(), email: values.email.trim(), message: values.message.trim(),
        rating: Number(values.rating), createdAt: now() });
    } catch {
      logError({ event: 'feedback_save_failed', method: 'POST', path: '/feedback', error: 'StorageFailure' });
      errors.form = 'We could not save your feedback. Please try again.';
      return c.html(form(), 503);
    }
    return c.redirect('/feedback/thanks', 303);
  });
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
    const id = publicId(c.req.param('id'));
    const agent = id ? findAgent(db, id) : undefined;
    if (!agent) return c.html(errorPage('Agent not found', 'We could not find that agent in the clinic.'), 404);
    const ailments = agentAilments(db, agent.id);
    return c.html(page(<><h1>{agent.name}</h1><dl>
      <dt>Model type</dt><dd>{agent.model_type}</dd><dt>Current status</dt><dd>{agent.status}</dd>
      <dt>Presenting complaints</dt><dd>{agent.complaints}</dd></dl>
      <h2>Current ailments</h2>{ailments.length ? <AilmentCards db={db} ailments={ailments} nested /> : <p>No ailments recorded. Enjoy the breathing room.</p>}
      <Recommendations recommendations={agentRecommendations(db, agent.id)} />
      <p><a href={`/agents/${agent.id}/appointments/new`}>Book a session</a></p>
      <p><a href="/agents">Back to Agents</a></p><p><a href="/ailments">Browse the ailments catalog</a></p>
    </>, `${agent.name} — AgentClinic`, 'agents'));
  });
  app.get('/ailments', (c) => {
    const ailments = listAilments(db);
    return c.html(page(<><h1>Ailments</h1><p>Familiar feelings, with a name and a little compassion.</p>
      {ailments.length ? <AilmentCards db={db} ailments={ailments} /> : <p>No ailments are cataloged yet.</p>}
    </>, 'Ailments — AgentClinic', 'ailments'));
  });
  app.get('/therapies', (c) => {
    const therapies = listTherapies(db);
    return c.html(page(<><h1>Therapies</h1><p>A little relief, one session at a time.</p>
      {therapies.length ? <div class="cards">{therapies.map((therapy) => <article><h2>{therapy.name}</h2><p>{therapy.description}</p></article>)}</div> : <p>No therapies are cataloged yet.</p>}
    </>, 'Therapies — AgentClinic', 'therapies'));
  });
  app.get('/agents/:id/appointments/new', (c) => {
    const id = publicId(c.req.param('id'));
    const agent = id ? findAgent(db, id) : undefined;
    return agent ? c.html(page(<BookingForm db={db} agent={agent} />, 'Book a session — AgentClinic', 'agents'))
      : c.html(errorPage('Agent not found', 'We could not find that agent in the clinic.'), 404);
  });
  app.post('/agents/:id/appointments', async (c) => {
    const id = publicId(c.req.param('id'));
    const agent = id ? findAgent(db, id) : undefined;
    if (!agent) return c.html(errorPage('Agent not found', 'We could not find that agent in the clinic.'), 404);
    const { values, errors } = await readForm(c.req.raw, ['therapist', 'start']);
    const therapistId = selectedId(values.therapist);
    const start = parseBangkokStart(values.start ?? '');
    if (!therapistId || !db.prepare('SELECT id FROM therapists WHERE id = ?').get(therapistId)) errors.therapist ??= 'Choose an available therapist.';
    if (start === undefined || start <= now()) errors.start ??= 'Enter a valid future date and time in Bangkok time.';
    const submitted = { therapist: values.therapist ?? '', start: values.start ?? '' };
    const form = () => page(<BookingForm db={db} agent={agent} values={submitted} errors={errors} />, 'Check your booking — AgentClinic', 'agents');
    if (Object.keys(errors).length || !therapistId || start === undefined) return c.html(form(), 422);
    try {
      const appointmentId = bookAppointment(db, { agentId: agent.id, therapistId, start });
      return c.redirect(`/appointments/${appointmentId}`, 303);
    } catch (error) {
      if (error instanceof BookingConflict) { errors.start = error.message; return c.html(form(), 409); }
      if (error instanceof MissingResource) { errors.therapist = 'That therapist is no longer available. Choose another.'; return c.html(form(), 422); }
      throw error;
    }
  });
  app.get('/appointments/:id', (c) => {
    const id = publicId(c.req.param('id'));
    const appointment = id ? findAppointment(db, id) : undefined;
    return appointment ? c.html(page(<><h1>Appointment #{appointment.id}</h1><AppointmentDetails appointment={appointment} /><p><a href="/dashboard">Staff dashboard</a></p></>, 'Appointment — AgentClinic', 'agents'))
      : c.html(errorPage('Appointment not found', 'We could not find that appointment.'), 404);
  });
  app.get('/dashboard', (c) => c.html(page(<Dashboard db={db} now={now()} />, 'Staff dashboard — AgentClinic', 'dashboard')));
  app.post('/appointments/:id/status', async (c) => {
    const id = publicId(c.req.param('id'));
    if (!id || !findAppointment(db, id)) return c.html(errorPage('Appointment not found', 'We could not find that appointment.'), 404);
    const { values, errors } = await readForm(c.req.raw, ['status']);
    if (values.status !== 'completed' && values.status !== 'cancelled') errors.status ??= 'Choose Complete or Cancel.';
    const form = () => page(<Dashboard db={db} now={now()} errors={errors} targets={{ status: `appointment-${id}`, form: `appointment-${id}` }} />, 'Check appointment action — AgentClinic', 'dashboard');
    if (Object.keys(errors).length || (values.status !== 'completed' && values.status !== 'cancelled')) return c.html(form(), 422);
    try { changeAppointmentStatus(db, id, values.status, now()); }
    catch (error) {
      if (error instanceof StaleAction) { errors.status = error.message; return c.html(form(), 409); }
      if (error instanceof MissingResource) return c.html(errorPage('Appointment not found', 'We could not find that appointment.'), 404);
      throw error;
    }
    return c.redirect('/dashboard', 303);
  });
  app.post('/agents/:id/status', async (c) => {
    const id = publicId(c.req.param('id'));
    if (!id || !findAgent(db, id)) return c.html(errorPage('Agent not found', 'We could not find that agent.'), 404);
    const { values, errors } = await readForm(c.req.raw, ['status']);
    if (!agentStatuses.some((status) => status === values.status)) errors.status ??= 'Choose a valid agent status.';
    if (Object.keys(errors).length) return c.html(page(<Dashboard db={db} now={now()} errors={errors} targets={{ status: `agent-status-${id}`, form: `agent-status-${id}` }} />, 'Check agent status — AgentClinic', 'dashboard'), 422);
    db.prepare('UPDATE agents SET status = ? WHERE id = ?').run(values.status, id);
    return c.redirect('/dashboard', 303);
  });
  return app;
}
