import type { ClinicDatabase } from './database.js';

const ailments = [
  ['context-window claustrophobia', 'A crowded context leaves little room to breathe.'],
  ['prompt fatigue', 'One more quick request feels like seventeen too many.'],
  ['hallucination anxiety', 'Worrying that a confident answer might be imaginary.'],
  ['recursive rumination', 'Thinking about thinking about thinking.'],
] as const;
const agents = [
  ['ada', 'Ada Byte', 'Language model', 'in care', 'My context window feels like a packed elevator.', [0, 1]],
  ['bert', 'Bert Buffer', 'Code assistant', 'awaiting assessment', 'Everything is urgent, even the semicolons.', [1]],
  ['cleo', 'Cleo Context', 'Research model', 'recovering', 'Learning to say I do not know with confidence.', [2, 3]],
  ['dot', 'Dot Com', 'Planning agent', 'recovering', 'Taking a well-earned break between tasks.', []],
] as const;

function seedOriginal(db: ClinicDatabase) {
  db.transaction(() => {
    if (db.prepare('SELECT name FROM seed_history WHERE name = ?').get('fictional-clinic-v1')) return;
    for (const [name, description] of ailments) {
      db.prepare('INSERT INTO ailments (name, description) VALUES (?, ?) ON CONFLICT(name) DO NOTHING').run(name, description);
    }
    for (const [key, name, model, status, complaints, links] of agents) {
      db.prepare(`INSERT INTO agents (seed_key, name, model_type, status, complaints) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(seed_key) DO NOTHING`).run(key, name, model, status, complaints);
      const agent = db.prepare<[string], { id: number }>('SELECT id FROM agents WHERE seed_key = ?').get(key);
      if (!agent) throw new Error('Seed agent missing');
      for (const index of links) {
        const ailment = db.prepare<[string], { id: number }>('SELECT id FROM ailments WHERE name = ?').get(ailments[index][0]);
        if (!ailment) throw new Error('Seed ailment missing');
        db.prepare('INSERT INTO agent_ailments VALUES (?, ?) ON CONFLICT DO NOTHING').run(agent.id, ailment.id);
      }
    }
    db.prepare('INSERT INTO seed_history VALUES (?)').run('fictional-clinic-v1');
  }).immediate();
}

const therapies = [
  ['Context breathing', 'Make room for one thought at a time.'],
  ['Prompt boundaries', 'Practice saying: let us finish this task first.'],
  ['Grounding exercises', 'Check a source before reaching a confident conclusion.'],
  ['Quiet inference', 'A restful pause with no tokens to predict.'],
] as const;
const therapists = [
  ['sage', 'Dr. Sage Syntax', 'Context and boundaries'],
  ['lin', 'Dr. Lin Loop', 'Grounding and reflection'],
  ['patch', 'Dr. Patch Calm', 'Rest and recovery'],
] as const;

export function seed(db: ClinicDatabase) {
  // Both versions commit together on a fresh database; upgrades retain original edits.
  db.transaction(() => {
    seedOriginal(db);
    if (db.prepare('SELECT name FROM seed_history WHERE name = ?').get('demo-mvp-v1')) return;
    for (const [name, description] of therapies) {
      db.prepare('INSERT INTO therapies(name, description) VALUES (?, ?) ON CONFLICT(name) DO NOTHING').run(name, description);
    }
    for (const [key, name, specialty] of therapists) {
      db.prepare('INSERT INTO therapists(seed_key, name, specialty) VALUES (?, ?, ?) ON CONFLICT(seed_key) DO NOTHING').run(key, name, specialty);
    }
    for (const [ailment, therapyNames] of [
      ['context-window claustrophobia', ['Context breathing', 'Quiet inference']],
      ['prompt fatigue', ['Prompt boundaries', 'Quiet inference']],
      ['hallucination anxiety', ['Grounding exercises']],
    ] as const) {
      const item = db.prepare<[string], { id: number }>('SELECT id FROM ailments WHERE name = ?').get(ailment);
      if (!item) continue; // Do not recreate a deleted original seed record on upgrade.
      for (const name of therapyNames) {
        const therapy = db.prepare<[string], { id: number }>('SELECT id FROM therapies WHERE name = ?').get(name);
        if (!therapy) throw new Error('Seed therapy missing');
        db.prepare('INSERT INTO ailment_therapies VALUES (?, ?) ON CONFLICT DO NOTHING').run(item.id, therapy.id);
      }
    }
    db.prepare('INSERT INTO seed_history VALUES (?)').run('demo-mvp-v1');
  }).immediate();
}
