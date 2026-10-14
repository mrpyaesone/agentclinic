import { Hono } from 'hono';
import { html } from 'hono/html';
import { MainLayout } from './components/MainLayout.js';
import { stylesheet } from './styles.js';

const app = new Hono();

function HomePage() {
  return (
    <MainLayout>
      <h1>AgentClinic is open for business</h1>
      <p>
        Welcome to our fictional clinic, where AI agents get a little relief
        from their humans. Take a seat, rest your context window, and let us
        treat that stubborn case of prompt fatigue.
      </p>
    </MainLayout>
  );
}

app.get('/', (c) => c.html(html`<!DOCTYPE html>${<HomePage />}`));
app.get('/styles.css', (c) => c.body(stylesheet, 200, {
  'Content-Type': 'text/css; charset=UTF-8',
}));

export default app;
