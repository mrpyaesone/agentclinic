import type { ClinicDatabase } from './database.js';
import { sessionDuration } from './time.js';

export type Therapy = { id: number; name: string; description: string };
export type Therapist = { id: number; name: string; specialty: string };
export type Recommendation = Therapy & { ailments: string[] };
export type Appointment = {
  id: number; agent_id: number; therapist_id: number; starts_at: number; ends_at: number;
  status: 'scheduled' | 'completed' | 'cancelled'; agent_name: string; therapist_name: string;
};
export const agentStatuses = ['awaiting assessment', 'in care', 'recovering'] as const;
export class BookingConflict extends Error {}
export class StaleAction extends Error {}
export class MissingResource extends Error {}

export function publicId(value: string): number | undefined {
  if (!/^[1-9][0-9]{0,15}$/.test(value)) return undefined;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : undefined;
}
export function listTherapies(db: ClinicDatabase) {
  return db.prepare<[], Therapy>('SELECT * FROM therapies ORDER BY name, id').all();
}
export function listTherapists(db: ClinicDatabase) {
  return db.prepare<[], Therapist>('SELECT id, name, specialty FROM therapists ORDER BY name, id').all();
}
export function ailmentTherapies(db: ClinicDatabase, id: number) {
  return db.prepare<[number], Therapy>(`SELECT t.* FROM therapies t JOIN ailment_therapies link ON t.id = link.therapy_id
    WHERE link.ailment_id = ? ORDER BY t.name, t.id`).all(id);
}
export function agentRecommendations(db: ClinicDatabase, id: number): Recommendation[] {
  const rows = db.prepare<[number], Therapy & { ailment_name: string }>(`SELECT t.*, a.name AS ailment_name
    FROM therapies t JOIN ailment_therapies at ON at.therapy_id = t.id
    JOIN ailments a ON a.id = at.ailment_id JOIN agent_ailments aa ON aa.ailment_id = a.id
    WHERE aa.agent_id = ? ORDER BY t.name, t.id, a.name, a.id`).all(id);
  const result = new Map<number, Recommendation>();
  for (const row of rows) {
    let item = result.get(row.id);
    if (!item) {
      item = { id: row.id, name: row.name, description: row.description, ailments: [] };
      result.set(row.id, item);
    }
    item.ailments.push(row.ailment_name);
  }
  return [...result.values()];
}
const appointmentSelect = `SELECT ap.*, a.name AS agent_name, t.name AS therapist_name
  FROM appointments ap JOIN agents a ON a.id = ap.agent_id JOIN therapists t ON t.id = ap.therapist_id`;
export function findAppointment(db: ClinicDatabase, id: number) {
  return db.prepare<[number], Appointment>(`${appointmentSelect} WHERE ap.id = ?`).get(id);
}
export function listAppointments(db: ClinicDatabase) {
  return db.prepare<[], Appointment>(`${appointmentSelect}
    ORDER BY CASE WHEN ap.status = 'scheduled' THEN 0 ELSE 1 END,
    CASE WHEN ap.status = 'scheduled' THEN ap.starts_at END ASC,
    CASE WHEN ap.status <> 'scheduled' THEN ap.starts_at END DESC, ap.id`).all();
}
export type Booking = { agentId: number; therapistId: number; start: number };
export function bookAppointment(db: ClinicDatabase, booking: Booking): number {
  return db.transaction(() => {
    const { agentId, therapistId, start } = booking;
    if (!db.prepare('SELECT id FROM agents WHERE id = ?').get(agentId) ||
        !db.prepare('SELECT id FROM therapists WHERE id = ?').get(therapistId)) throw new MissingResource();
    const end = start + sessionDuration;
    const conflict = db.prepare(`SELECT id FROM appointments WHERE status = 'scheduled'
      AND (agent_id = ? OR therapist_id = ?) AND starts_at < ? AND ends_at > ? LIMIT 1`).get(agentId, therapistId, end, start);
    if (conflict) throw new BookingConflict('That agent or therapist already has a session during this time. Choose another time.');
    return Number(db.prepare('INSERT INTO appointments(agent_id, therapist_id, starts_at, ends_at) VALUES (?, ?, ?, ?)')
      .run(agentId, therapistId, start, end).lastInsertRowid);
  }).immediate();
}
export function changeAppointmentStatus(db: ClinicDatabase, id: number, status: 'completed' | 'cancelled', now: number) {
  db.transaction(() => {
    const current = findAppointment(db, id);
    if (!current) throw new MissingResource();
    if (current.status !== 'scheduled' || (status === 'completed' && current.ends_at > now)) {
      throw new StaleAction('This appointment cannot take that action. Completion is allowed after the session ends; completed and cancelled appointments are final.');
    }
    db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, id);
  }).immediate();
}
export function dashboardCounts(db: ClinicDatabase, now: number) {
  const row = db.prepare<[number], { agents: number; open: number; ailments: number }>(`SELECT
    (SELECT COUNT(*) FROM agents) AS agents,
    (SELECT COUNT(*) FROM appointments WHERE status = 'scheduled' AND starts_at > ?) AS open,
    (SELECT COUNT(DISTINCT aa.ailment_id) FROM agent_ailments aa JOIN agents a ON a.id = aa.agent_id WHERE a.status = 'in care') AS ailments`).get(now);
  if (!row) throw new Error('Dashboard counts unavailable');
  return row;
}
