import { neon } from '@neondatabase/serverless';

function rowToScore(r) {
  return {
    id: r.id,
    date: r.date,
    kind: r.kind,
    mode: r.mode,
    raw: r.raw,
    total: r.total,
    scaled: r.scaled,
    timeSec: r.time_sec,
    br: r.br,
    note: r.note,
    createdAt: r.created_at === null ? null : Number(r.created_at)
  };
}

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM scores ORDER BY date DESC`;
      return res.status(200).json(rows.map(rowToScore));
    }

    if (req.method === 'POST') {
      const b = req.body || {};
      const rows = await sql`
        INSERT INTO scores (
          date, kind, mode, raw, total, scaled, time_sec, br, note, created_at
        )
        VALUES (
          ${b.date}, ${b.kind || null}, ${b.mode || null}, ${b.raw ?? null}, ${b.total ?? null},
          ${b.scaled ?? null}, ${b.timeSec ?? null}, ${b.br || null}, ${b.note || null},
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
