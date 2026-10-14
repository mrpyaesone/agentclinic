import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getPort } from '../src/port.js';

describe('port configuration', () => {
  it('defaults to port 3000 only when PORT is unset', () => {
    expect(getPort(undefined)).toBe(3000);
  });

  it.each(['1', '3001', '65535'])('accepts valid PORT=%s', (value) => {
    expect(getPort(value)).toBe(Number(value));
  });

  it.each(['invalid', '', '0', '65536', '-1', '1.5', ' 3001 ', '1e3', '0xBB8', 'Infinity', '9007199254740993'])('rejects invalid PORT=%s', (value) => {
    expect(() => getPort(value)).toThrow('Invalid PORT: expected an integer between 1 and 65535.');
  });

  it('fails clearly at startup before opening a socket for an invalid PORT', () => {
    const result = spawnSync(process.execPath, ['--import', 'tsx', 'src/index.ts'], {
      cwd: fileURLToPath(new URL('..', import.meta.url)),
      env: { ...process.env, PORT: 'invalid' },
      encoding: 'utf8',
      timeout: 10_000,
    });
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Invalid PORT: expected an integer between 1 and 65535.');
    expect(result.stdout).not.toContain('listening');
  });
});
