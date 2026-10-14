import { readFileSync } from 'node:fs';

// Resolve beside this module in both src/ (development) and dist/ (production).
export const stylesheet = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');
