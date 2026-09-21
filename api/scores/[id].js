import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);
  const { id } = req.query;

  try {
    if (req.method === 'DELETE') {
      await sql`DELETE FROM scores WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end();
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
