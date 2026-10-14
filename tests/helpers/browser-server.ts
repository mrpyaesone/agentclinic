// Validation-only harness. Never used by npm start or the production app.
import { serve } from '@hono/node-server';
import { openDatabase, requireSchema } from '../../src/database.js';
import { createApp } from '../../src/app.js';
const db = openDatabase();
requireSchema(db);
const app = createApp(db);
app.get('/__validation_500', () => { throw new Error('Deliberate validation failure'); });
const server = serve({ fetch: app.fetch, port: Number(process.env.PORT ?? 3112) });
process.once('SIGTERM', () => server.close(() => db.close()));
process.once('SIGINT', () => server.close(() => db.close()));
console.log('Validation harness ready');
