import type { PropsWithChildren } from 'hono/jsx';

export type MainProps = PropsWithChildren;

export function Main({ children }: MainProps) {
  return <main class="container site-main">{children}</main>;
}
