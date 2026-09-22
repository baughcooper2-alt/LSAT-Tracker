import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);
  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      const b = req.body || {};
      // Upsert, not a plain UPDATE: restoring a backup calls set() on ids that
      // may not exist yet in this database, and a bare UPDATE against a
      // nonexistent row silently touches zero rows instead of inserting one.
      await sql`
        INSERT INTO journal (
          id, date, mode, source, qtype, level, time_sec, test, section, q,
          why_wrong, why_right, created_at
        )
        VALUES (
          ${id}, ${b.date}, ${b.mode || null}, ${b.source || null}, ${b.qtype || null},
          ${b.level ?? null}, ${b.timeSec ?? null}, ${b.test || null}, ${b.section || null},
          ${b.q || null}, ${b.whyWrong || null}, ${b.whyRight || null},
          ${b.createdAt || Date.now()}
        )
        ON CONFLICT (id) DO UPDATE SET
          date = EXCLUDED.date,
          mode = EXCLUDED.mode,
          source = EXCLUDED.source,
          qtype = EXCLUDED.qtype,
          level = EXCLUDED.level,
          time_sec = EXCLUDED.time_sec,
          test = EXCLUDED.test,
          section = EXCLUDED.section,
          q = EXCLUDED.q,
          why_wrong = EXCLUDED.why_wrong,
          why_right = EXCLUDED.why_right
      `;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM journal WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end();
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
