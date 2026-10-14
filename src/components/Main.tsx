import type { PropsWithChildren } from 'hono/jsx';

export function Main({ children }: PropsWithChildren) {
  return <main class="container site-main">{children}</main>;
}
