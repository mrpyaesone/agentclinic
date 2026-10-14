import { serve } from '@hono/node-server';
import app from './app.js';

const configuredPort = process.env.PORT;
const port = configuredPort === undefined ? 3000 : Number(configuredPort);

if (
  (configuredPort !== undefined && !/^\d+$/.test(configuredPort)) ||
  !Number.isInteger(port) ||
  port < 1 ||
  port > 65535
) {
  console.error('Invalid PORT: expected an integer between 1 and 65535.');
  process.exit(1);
}

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`AgentClinic is listening at http://localhost:${info.port}`);
});
