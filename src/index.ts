import { serve } from '@hono/node-server';
import app from './app.js';
import { getPort } from './port.js';

let port: number;
try {
  port = getPort(process.env.PORT);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`AgentClinic is listening at http://localhost:${info.port}`);
});
