import { describe, expect, it } from 'vitest';
import { MainLayout } from '../src/components/MainLayout.js';

describe('MainLayout', () => {
  it('renders supplied page content inside main between the header and footer', () => {
    const document = (<MainLayout><h1>A different page</h1><p>Page content</p></MainLayout>).toString();
    expect(document).toMatch(/<header\b[\s\S]*<\/header><main\b[^>]*><h1>A different page<\/h1><p>Page content<\/p><\/main><footer\b/);
  });

  it('escapes text children rather than rendering them as markup', () => {
    const document = (<MainLayout>{'<script>alert("hello")</script>'}</MainLayout>).toString();
    expect(document).not.toContain('<script>');
    expect(document).toContain('&lt;script&gt;');
  });
});
