import type { PropsWithChildren } from 'hono/jsx';
import { Header } from './Header.js';
import type { Section } from './Header.js';
import { Main } from './Main.js';
import { Footer } from './Footer.js';

export type MainLayoutProps = PropsWithChildren<{
  title?: string;
  section?: Section;
}>;

export function MainLayout({ children, title = 'AgentClinic', section = 'home' }: MainLayoutProps) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <link rel="stylesheet" href="/pico.css" />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <Header section={section} />
        <Main>{children}</Main>
        <Footer />
      </body>
    </html>
  );
}
