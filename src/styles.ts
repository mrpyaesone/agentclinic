import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';

export const stylesheet = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');
const builtPico = new URL('./pico.css', import.meta.url);
export const picoStylesheet = readFileSync(existsSync(builtPico) ? builtPico : createRequire(import.meta.url).resolve('@picocss/pico/css/pico.min.css'), 'utf8');
