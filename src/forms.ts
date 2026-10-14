import { publicId } from './clinic.js';
import type { FormErrors } from './components/ClinicPages.js';

export type ParsedForm = { values: Record<string, string>; errors: FormErrors };
export async function readForm(request: Request, allowed: readonly string[]): Promise<ParsedForm> {
  const values: Record<string, string> = {};
  const errors: FormErrors = {};
  if (request.headers.get('content-type')?.split(';')[0]?.trim() !== 'application/x-www-form-urlencoded') {
    return { values, errors: { form: 'Submit this form using its provided controls.' } };
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).length > 4096) {
    return { values, errors: { form: 'This submission is too large. Please use the form controls.' } };
  }
  const fields = new URLSearchParams(text);
  for (const [key, value] of fields) {
    if (!allowed.includes(key)) errors.form = 'This form contains an unsupported field.';
    else if (fields.getAll(key).length !== 1) errors[key] = 'Submit one value for this field.';
    else if (value.length > 100) errors[key] = 'This field is too long.';
    else values[key] = value;
  }
  return { values, errors };
}
export function sameOrigin(request: Request): boolean {
  const expected = new URL(request.url).origin;
  const origin = request.headers.get('origin');
  if (origin !== null) return origin === expected;
  // Legacy same-origin forms may omit Origin. Fetch Metadata/Referer cannot
  // contradict same-origin; headerless CLI clients are allowed for the local demo.
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin' && site !== 'none') return false;
  const referer = request.headers.get('referer');
  if (!referer) return true;
  try { return new URL(referer).origin === expected; } catch { return false; }
}
export function selectedId(value: string | undefined): number | undefined {
  return value ? publicId(value) : undefined;
}
