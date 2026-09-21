import { neon } from '@neondatabase/serverless';

function rowToConfig(r) {
  return {
    weeklyGoalMin: r.weekly_goal_min,
    startDate: r.start_date,
    trackerStart: r.tracker_start,
    baselineMinutes: r.baseline_minutes,
    priorDaysCompleted: r.prior_days_completed,
    priorBestStreak: r.prior_best_streak,
    priorStreakInto: r.prior_streak_into,
    priorWeeks: r.prior_weeks || {}
  };
}

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM config WHERE id = 1`;
      return res.status(200).json(rows.length ? rowToConfig(rows[0]) : null);
    }

    if (req.method === 'PUT') {
      const b = req.body || {};
      await sql`
        INSERT INTO config (
          id, weekly_goal_min, start_date, tracker_start, baseline_minutes,
          prior_days_completed, prior_best_streak, prior_streak_into, prior_weeks
        )
        VALUES (
          1, ${b.weeklyGoalMin ?? null}, ${b.startDate ?? null}, ${b.trackerStart ?? null},
          ${b.baselineMinutes ?? null}, ${b.priorDaysCompleted ?? null}, ${b.priorBestStreak ?? null},
          ${b.priorStreakInto ?? null}, ${JSON.stringify(b.priorWeeks || {})}::jsonb
        )
        ON CONFLICT (id) DO UPDATE SET
          weekly_goal_min = EXCLUDED.weekly_goal_min,
          start_date = EXCLUDED.start_date,
          tracker_start = EXCLUDED.tracker_start,
          baseline_minutes = EXCLUDED.baseline_minutes,
          prior_days_completed = EXCLUDED.prior_days_completed,
          prior_best_streak = EXCLUDED.prior_best_streak,
          prior_streak_into = EXCLUDED.prior_streak_into,
          prior_weeks = EXCLUDED.prior_weeks
      `;
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).end();
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
