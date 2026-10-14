export const sessionDuration = 30 * 60 * 1000;
export type Clock = () => number;

// Bangkok has a fixed UTC+07:00 offset; never parse in the host's local timezone.
export function parseBangkokStart(value: string): number | undefined {
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!parts) return undefined;
  const year = Number(parts[1]);
  if (year < 2000 || year > 9998) return undefined;
  const local = Date.UTC(year, Number(parts[2]) - 1, Number(parts[3]), Number(parts[4]), Number(parts[5]));
  if (new Date(local).toISOString().slice(0, 16) !== value) return undefined;
  return local - 7 * 60 * 60 * 1000;
}

const formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Bangkok', dateStyle: 'medium', timeStyle: 'short', hourCycle: 'h23',
});
export function formatBangkok(instant: number): string {
  return `${formatter.format(instant)} (Asia/Bangkok, UTC+07:00)`;
}
