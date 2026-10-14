# AgentClinic

## Input from stakeholders

- Mary in engineering wants a reliable site with a popular stack based on TypeScript, giving agents and staff a dashboard for easy access.
- Susan in product has a set of features about agents and their ailments, therapies, and booking appointments.
- Steve in marketing wants an attractive, responsive site that works well in modern browsers on phones, tablets, and desktops.

## Product UI requirements

- Every web page must use responsive design from its first implementation, including lists, details, forms, dashboards, and error pages.
- Use a mobile-first layout with fluid widths, flexible spacing, readable typography, and viewport metadata that permits zoom.
- Support widths from 320 CSS pixels upward. Validate at 320, 375, 768, 1280, and 1440 CSS pixels, plus phone landscape and 200% browser zoom.
- Content must reflow without page-level horizontal scrolling, clipped text, or overlapping regions. Long names and URLs must wrap; wide data tables may scroll inside a clearly bounded region.
- Keep controls usable with touch and keyboard, with visible focus and touch targets at least 44 by 44 CSS pixels.
- Core content and controls must remain usable without browser JavaScript. Every feature spec must include responsive acceptance criteria and browser validation alongside Vitest behavior tests.
