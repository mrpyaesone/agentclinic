export type Section = 'home' | 'agents' | 'ailments' | 'therapies' | 'dashboard';

export type HeaderProps = {
  section?: Section;
};

export function Header({ section = 'home' }: HeaderProps) {
  return (
    <header class="site-header">
      <div class="container">
        <a class="brand" href="/">AgentClinic</a>
        <p>A little care for hardworking AI agents.</p>
        <nav aria-label="Main navigation">
          <ul>{([['home', '/', 'Home'], ['agents', '/agents', 'Agents'], ['ailments', '/ailments', 'Ailments'], ['therapies', '/therapies', 'Therapies'], ['dashboard', '/dashboard', 'Staff dashboard']] as const).map(([key, href, label]) => (
            <li><a href={href} aria-current={section === key ? 'page' : undefined}>{label}</a></li>
          ))}</ul>
        </nav>
      </div>
    </header>
  );
}
