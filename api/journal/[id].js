import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);
  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      const b = req.body || {};
      await sql`
        UPDATE journal SET
          date = ${b.date},
          mode = ${b.mode || null},
          source = ${b.source || null},
          qtype = ${b.qtype || null},
          level = ${b.level ?? null},
          time_sec = ${b.timeSec ?? null},
          test = ${b.test || null},
          section = ${b.section || null},
          q = ${b.q || null},
          why_wrong = ${b.whyWrong || null},
          why_right = ${b.whyRight || null}
        WHERE id = ${id}
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
