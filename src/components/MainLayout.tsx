import type { PropsWithChildren } from 'hono/jsx';
import { Header } from './Header.js';
import { Main } from './Main.js';
import { Footer } from './Footer.js';

export function MainLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>AgentClinic</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <Header />
        <Main>{children}</Main>
        <Footer />
      </body>
    </html>
  );
}
