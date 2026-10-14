import { copyFileSync, cpSync } from 'node:fs';
copyFileSync('src/styles.css', 'dist/styles.css');
copyFileSync('node_modules/@picocss/pico/css/pico.min.css', 'dist/pico.css');
cpSync('src/migrations', 'dist/migrations', { recursive: true });
