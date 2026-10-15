import type { ClinicDatabase } from './database.js';

export type FeedbackValues = Record<'name' | 'email' | 'message' | 'rating', string>;
export type FeedbackErrors = Partial<Record<keyof FeedbackValues | 'form', string>>;
export type FeedbackInput = Omit<FeedbackValues, 'rating'> & { rating: number; createdAt: number };

export function saveFeedback(db: ClinicDatabase, input: FeedbackInput) {
  return db.prepare(`INSERT INTO feedback (name, email, message, rating, created_at) VALUES (?, ?, ?, ?, ?)`)
    .run(input.name, input.email, input.message, input.rating, input.createdAt).lastInsertRowid;
}

export type PublicFeedback = { id: number; name: string; message: string; rating: number; created_at: number };

export function listFeedback(db: ClinicDatabase): PublicFeedback[] {
  return db.prepare<[], PublicFeedback>(
    'SELECT id, name, message, rating, created_at FROM feedback ORDER BY created_at DESC, id DESC',
  ).all();
}

export async function readFeedback(request: Request): Promise<{
  values: FeedbackValues; errors: FeedbackErrors; status: 422 | 413 | 415;
}> {
  const values: FeedbackValues = { name: '', email: '', message: '', rating: '' };
  const errors: FeedbackErrors = {};
  if (request.headers.get('content-type')?.split(';')[0]?.trim() !== 'application/x-www-form-urlencoded') {
    return { values, errors: { form: 'Submit this form using its provided controls.' }, status: 415 };
  }
  // Bound the bytes read, including requests without Content-Length.
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  if (reader) {
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.byteLength;
        if (size > 32768) {
          await reader.cancel();
          return { values, errors: { form: 'This submission is too large. Please shorten your feedback.' }, status: 413 };
        }
        chunks.push(chunk.value);
      }
    } finally { reader.releaseLock(); }
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
  const fields = new URLSearchParams(new TextDecoder().decode(body));
  const names = Object.keys(values) as (keyof FeedbackValues)[];
  for (const key of fields.keys()) {
    if (!names.includes(key as keyof FeedbackValues)) errors.form = 'This form contains an unsupported field.';
  }
  for (const key of names) {
    const entries = fields.getAll(key);
    values[key] = entries[0] ?? '';
    if (entries.length > 1) errors[key] = 'Submit one value for this field.';
  }
  const name = values.name.trim(), email = values.email.trim(), message = values.message.trim();
  if (!name || name.length > 100 || name.includes('\0')) errors.name ??= 'Enter a name between 1 and 100 characters.';
  if (email.length > 254 || !/^[^\s@\0]+@[^\s@\0.]+(?:\.[^\s@\0.]+)+$/.test(email)) errors.email ??= 'Enter a valid email address of at most 254 characters.';
  if (!message || message.length > 2000 || message.includes('\0')) errors.message ??= 'Enter a message between 1 and 2,000 characters.';
  if (!/^[1-5]$/.test(values.rating)) errors.rating ??= 'Choose a rating from 1 to 5.';
  return { values, errors, status: 422 };
}
