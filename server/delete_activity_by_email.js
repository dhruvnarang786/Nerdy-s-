import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const email = '18dakshsuri@gmail.com';

  try {
    const userRes = await pool.query('SELECT id, email FROM "User" WHERE email = $1', [email]);
    if (userRes.rowCount === 0) {
      console.log(JSON.stringify({ found: false, email }));
      await pool.end();
      return;
    }

    const user = userRes.rows[0];

    const logCountRes = await pool.query('SELECT count(*) FROM "BookLog" WHERE "userId" = $1', [user.id]);
    const logsToDelete = parseInt(logCountRes.rows[0].count, 10);

    const eventCountRes = await pool.query('SELECT count(*) FROM "DnaActivityEvent" WHERE "userId" = $1', [user.id]);
    const eventsToDelete = parseInt(eventCountRes.rows[0].count, 10);

    if (logsToDelete === 0 && eventsToDelete === 0) {
      console.log(JSON.stringify({ found: true, email: user.email, userId: user.id, deletedLogs: 0, deletedEvents: 0 }));
      await pool.end();
      return;
    }

    await pool.query('BEGIN');
    const delLogsRes = await pool.query('DELETE FROM "BookLog" WHERE "userId" = $1', [user.id]);
    const delEventsRes = await pool.query('DELETE FROM "DnaActivityEvent" WHERE "userId" = $1', [user.id]);
    await pool.query('COMMIT');

    console.log(JSON.stringify({ found: true, email: user.email, userId: user.id, deletedLogs: delLogsRes.rowCount, deletedEvents: delEventsRes.rowCount }));
  } catch (err) {
    try { await pool.query('ROLLBACK'); } catch (_) {}
    console.error(JSON.stringify({ error: String(err) }));
    process.exit(1);
  } finally {
    await pool.end();
  }
})();