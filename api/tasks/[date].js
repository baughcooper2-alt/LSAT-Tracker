import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);
  const { date } = req.query;

  try {
    if (req.method === 'PUT') {
      const b = req.body || {};
      await sql`
        INSERT INTO tasks (date, title, cat, planned_min, skip, done, actual_min)
        VALUES (
          ${date}, ${b.title || ''}, ${b.cat || ''}, ${b.plannedMin || 0},
          ${!!b.skip}, ${!!b.done}, ${b.actualMin || 0}
        )
        ON CONFLICT (date) DO UPDATE SET
          title = EXCLUDED.title,
          cat = EXCLUDED.cat,
          planned_min = EXCLUDED.planned_min,
          skip = EXCLUDED.skip,
          done = EXCLUDED.done,
          actual_min = EXCLUDED.actual_min
      `;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM tasks WHERE date = ${date}`;
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end();
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
