import type { Agent, Ailment, ClinicDatabase } from '../database.js';
import { listAgents, listAilments } from '../database.js';
import {
  agentStatuses, ailmentTherapies, dashboardCounts, listAppointments, listTherapists,
} from '../clinic.js';
import type { Appointment, Recommendation } from '../clinic.js';
import { formatBangkok } from '../time.js';

export type FormErrors = Record<string, string>;
export type ErrorSummaryProps = { errors: FormErrors; targets?: Record<string, string> };
export function ErrorSummary({ errors, targets = {} }: ErrorSummaryProps) {
  if (!Object.keys(errors).length) return null;
  return <div class="error-summary" role="alert"><h2>Please check the following</h2>
    <ul>{Object.entries(errors).map(([field, message]) => <li><a href={`#${targets[field] ?? field}`}>{message}</a></li>)}</ul>
  </div>;
}
export type AilmentCardsProps = { db: ClinicDatabase; ailments: Ailment[]; nested?: boolean };
export function AilmentCards({ db, ailments, nested = false }: AilmentCardsProps) {
  return <div class="cards">{ailments.map((ailment) => {
    const therapies = nested ? [] : ailmentTherapies(db, ailment.id);
    return <article>
    {nested ? <h3>{ailment.name}</h3> : <h2>{ailment.name}</h2>}<p>{ailment.description}</p>
    {!nested && <><h3>Recommended therapies</h3><ul>{therapies.map((therapy) => <li>{therapy.name} — {therapy.description}</li>)}</ul>
      {!therapies.length && <p>No recommendations recorded for this ailment yet.</p>}</>}
  </article>;
  })}</div>;
}
export type RecommendationsProps = { recommendations: Recommendation[] };
export function Recommendations({ recommendations }: RecommendationsProps) {
  return <><h2>Recommended therapies</h2>
    {recommendations.length ? <div class="cards">{recommendations.map((therapy) => <article><h3>{therapy.name}</h3>
      <p>{therapy.description}</p><p>For: {therapy.ailments.join(', ')}</p></article>)}</div> : <p>No therapy recommendations recorded yet.</p>}
    <p><a href="/therapies">Browse all therapies</a></p></>;
}
export type BookingValues = { therapist: string; start: string };
export type BookingFormProps = { db: ClinicDatabase; agent: Agent; values?: BookingValues; errors?: FormErrors };
export function BookingForm({ db, agent, values = { therapist: '', start: '' }, errors = {} }: BookingFormProps) {
  const therapists = listTherapists(db);
  return <><h1>Book a session for {agent.name}</h1><p>Thirty minutes of breathing room. Times are in Asia/Bangkok (UTC+07:00).</p>
    <ErrorSummary errors={errors} targets={therapists.length ? { form: 'booking-form' } : { form: 'booking-unavailable', therapist: 'booking-unavailable', start: 'booking-unavailable' }} />
    {therapists.length ? <form id="booking-form" tabindex={-1} method="post" action={`/agents/${agent.id}/appointments`}>
      <label for="therapist">Therapist</label>
      <select id="therapist" name="therapist" required aria-invalid={errors.therapist ? 'true' : undefined} aria-describedby={errors.therapist ? 'therapist-error' : undefined}>
        <option value="" selected={!values.therapist}>Choose a therapist</option>
        {therapists.map((therapist) => <option value={therapist.id} selected={values.therapist === String(therapist.id)}>{therapist.name} — {therapist.specialty}</option>)}
      </select>
      {errors.therapist && <p id="therapist-error" class="field-error">{errors.therapist}</p>}
      <label for="start">Session start in Bangkok time</label>
      <input type="datetime-local" id="start" name="start" step="60" value={values.start} required aria-invalid={errors.start ? 'true' : undefined} aria-describedby={errors.start ? 'start-help start-error' : 'start-help'} />
      <p id="start-help">Choose a future date and time. Each session lasts 30 minutes.</p>
      {errors.start && <p id="start-error" class="field-error">{errors.start}</p>}
      <button type="submit">Book appointment</button>
    </form> : <p id="booking-unavailable" tabindex={-1}>No therapists are available yet. Please check back with the clinic.</p>}
    <p><a href={`/agents/${agent.id}`}>Back to {agent.name}</a></p></>;
}
export type AppointmentDetailsProps = { appointment: Appointment };
export function AppointmentDetails({ appointment }: AppointmentDetailsProps) {
  return <dl><dt>Agent</dt><dd><a href={`/agents/${appointment.agent_id}`}>{appointment.agent_name}</a></dd>
    <dt>Therapist</dt><dd>{appointment.therapist_name}</dd><dt>Starts</dt><dd>{formatBangkok(appointment.starts_at)}</dd>
    <dt>Ends</dt><dd>{formatBangkok(appointment.ends_at)}</dd><dt>Status</dt><dd>{appointment.status}</dd></dl>;
}
export type AppointmentRecordsProps = { appointments: Appointment[]; now: number };
export function AppointmentRecords({ appointments, now }: AppointmentRecordsProps) {
  return appointments.length ? <div class="record-list">{appointments.map((appointment) => <article id={`appointment-${appointment.id}`} tabindex={-1}>
    <h3><a href={`/appointments/${appointment.id}`}>Appointment #{appointment.id}</a></h3>
    <AppointmentDetails appointment={appointment} />
    {appointment.status === 'scheduled' && <div class="actions">
      <form method="post" action={`/appointments/${appointment.id}/status`}><button type="submit" name="status" value="completed" disabled={appointment.ends_at > now} aria-label={`Complete appointment ${appointment.id}`}>Complete</button></form>
      <form method="post" action={`/appointments/${appointment.id}/status`}><button type="submit" name="status" value="cancelled" class="secondary" aria-label={`Cancel appointment ${appointment.id}`}>Cancel</button></form>
    </div>}
  </article>)}</div> : <p>No appointments in this section.</p>;
}
export type DashboardProps = { db: ClinicDatabase; now: number; errors?: FormErrors; targets?: Record<string, string> };
export function Dashboard({ db, now, errors = {}, targets = {} }: DashboardProps) {
  const counts = dashboardCounts(db, now);
  const appointments = listAppointments(db);
  const agents = listAgents(db);
  const ailments = listAilments(db);
  return <><h1>Staff dashboard</h1><p>A clear view of the clinic. Welcome, Mary.</p>
    <ErrorSummary errors={errors} targets={targets} />
    <div class="summary"><article><h2>All agents</h2><p>{counts.agents}</p></article>
      <article><h2>Future scheduled appointments</h2><p>{counts.open}</p></article>
      <article><h2>Ailments in care</h2><p>{counts.ailments}</p></article></div>
    <p>Ailments in care counts distinct ailments linked to agents whose status is in care.</p>
    <h2>Scheduled appointments</h2><AppointmentRecords appointments={appointments.filter((item) => item.status === 'scheduled')} now={now} />
    <h2>Appointment history</h2><AppointmentRecords appointments={appointments.filter((item) => item.status !== 'scheduled')} now={now} />
    <h2>Agents</h2>{agents.length ? <div class="record-list">{agents.map((agent) => <article><h3><a href={`/agents/${agent.id}`}>{agent.name}</a></h3>
      <p>{agent.model_type} — {agent.status}</p>
      <form class="status-form" method="post" action={`/agents/${agent.id}/status`}>
        <label for={`agent-status-${agent.id}`}>Status for {agent.name}</label>
        <select id={`agent-status-${agent.id}`} name="status" aria-invalid={errors.status && targets.status === `agent-status-${agent.id}` ? 'true' : undefined}
          aria-describedby={errors.status && targets.status === `agent-status-${agent.id}` ? 'status-error' : undefined}>
          {agentStatuses.map((status) => <option selected={agent.status === status}>{status}</option>)}
        </select>
        {errors.status && targets.status === `agent-status-${agent.id}` && <p class="field-error" id="status-error">{errors.status}</p>}
        <button type="submit">Update status for {agent.name}</button>
      </form></article>)}</div> : <p>No agents have checked in yet.</p>}
    <h2>Ailments</h2>{ailments.length ? <ul>{ailments.map((ailment) => <li>{ailment.name} — {ailment.description}</li>)}</ul> : <p>No ailments are cataloged yet.</p>}
    <p><a href="/ailments">Browse ailment recommendations</a></p></>;
}
