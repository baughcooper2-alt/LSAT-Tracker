import { neon } from '@neondatabase/serverless';

function rowToJournal(r) {
  return {
    id: r.id,
    date: r.date,
    mode: r.mode,
    source: r.source,
    qtype: r.qtype,
    level: r.level,
    timeSec: r.time_sec,
    test: r.test,
    section: r.section,
    q: r.q,
    whyWrong: r.why_wrong,
    whyRight: r.why_right,
    createdAt: r.created_at === null ? null : Number(r.created_at)
  };
}

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM journal ORDER BY date DESC, created_at DESC`;
      return res.status(200).json(rows.map(rowToJournal));
    }

    if (req.method === 'POST') {
      const b = req.body || {};
      const rows = await sql`
        INSERT INTO journal (
          date, mode, source, qtype, level, time_sec, test, section, q,
          why_wrong, why_right, created_at
        )
        VALUES (
          ${b.date}, ${b.mode || null}, ${b.source || null}, ${b.qtype || null},
          ${b.level ?? null}, ${b.timeSec ?? null}, ${b.test || null}, ${b.section || null},
          ${b.q || null}, ${b.whyWrong || null}, ${b.whyRight || null},
          ${b.createdAt || Date.now()}
        )
        RETURNING id
      `;
      return res.status(200).json({ id: rows[0].id });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end();
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
