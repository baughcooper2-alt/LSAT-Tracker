import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);
  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      // Upsert: the app has no in-place score editor, but restoring a backup
      // calls set() on ids that don't exist yet in this database, so this
      // needs to insert, not just update an existing row.
      const b = req.body || {};
      await sql`
        INSERT INTO scores (
          id, date, kind, mode, raw, total, scaled, time_sec, br, note, created_at
        )
        VALUES (
          ${id}, ${b.date}, ${b.kind || null}, ${b.mode || null}, ${b.raw ?? null},
          ${b.total ?? null}, ${b.scaled ?? null}, ${b.timeSec ?? null}, ${b.br || null},
          ${b.note || null}, ${b.createdAt || Date.now()}
        )
        ON CONFLICT (id) DO UPDATE SET
          date = EXCLUDED.date,
          kind = EXCLUDED.kind,
          mode = EXCLUDED.mode,
          raw = EXCLUDED.raw,
          total = EXCLUDED.total,
          scaled = EXCLUDED.scaled,
          time_sec = EXCLUDED.time_sec,
          br = EXCLUDED.br,
          note = EXCLUDED.note
      `;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM scores WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end();
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
