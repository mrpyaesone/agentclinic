import { openDatabase } from '../../src/database.js';
import { createApp } from '../../src/app.js';
const path = process.argv[2];
if (!path) throw new Error('Database path required');
const db = openDatabase(path);
const app = createApp(db, { clock: () => Date.parse('2040-01-01T00:00:00Z'), log: () => {}, logError: () => {} });
process.send?.('ready');
process.once('message', async () => {
  try {
    const response = await app.request('/agents/1/appointments', {
      method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'therapist=1&start=2040-01-02T10%3A00',
    });
    process.send?.(response.status);
  } finally { db.close(); process.disconnect(); }
});
