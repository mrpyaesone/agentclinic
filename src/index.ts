import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { openDatabase, requireSchema } from './database.js';
import { getPort } from './port.js';

try {
  const port = getPort(process.env.PORT);
  const db = openDatabase();
  try {
    requireSchema(db);
    const server = serve({ fetch: createApp(db).fetch, port }, (info) => {
      console.log(`AgentClinic is listening at http://localhost:${info.port}`);
    });
    server.on('error', (error) => { console.error(error.message); db.close(); process.exitCode = 1; });
    for (const signal of ['SIGINT', 'SIGTERM'] as const) {
      process.once(signal, () => { server.close(() => { db.close(); }); });
    }
  } catch (error) { db.close(); throw error; }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
