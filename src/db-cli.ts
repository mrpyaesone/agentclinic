import { migrate, openDatabase, requireSchema } from './database.js';
import { seed } from './seed.js';

try {
  const command = process.argv[2];
  if (command !== 'migrate' && command !== 'seed') throw new Error('Usage: db-cli migrate|seed');
  const db = openDatabase();
  try {
    if (command === 'migrate') migrate(db);
    else { requireSchema(db); seed(db); }
    console.log(`Database ${command} completed.`);
  } finally { db.close(); }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
