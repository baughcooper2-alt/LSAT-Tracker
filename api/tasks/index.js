import { neon } from '@neondatabase/serverless';

function rowToTask(r) {
  return {
    date: r.date,
    title: r.title,
    cat: r.cat,
    plannedMin: r.planned_min,
    skip: r.skip,
    done: r.done,
    actualMin: r.actual_min
  };
}

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM tasks ORDER BY date`;
      return res.status(200).json(rows.map(rowToTask));
    }

    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
