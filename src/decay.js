// decay.js — daily decay + Angel shield (reference, scrubbed).
//
// Bad tokens (DUMB, SHAME, LAZY, EVIL) halve each cycle. Angel holders decay
// at 75% instead of 50% (the "Decay Shield" buff).

async function runDecay() {
  const res = await db.query(`
    UPDATE users SET
      shame_tokens = ROUND(shame_tokens * CASE WHEN angel_tokens > 0 THEN 0.75 ELSE 0.5 END, 4),
      evil_tokens  = ROUND(evil_tokens  * CASE WHEN angel_tokens > 0 THEN 0.75 ELSE 0.5 END, 4),
      lazy_tokens  = ROUND(lazy_tokens  * CASE WHEN angel_tokens > 0 THEN 0.75 ELSE 0.5 END, 4),
      dumb_tokens  = ROUND(dumb_tokens  * CASE WHEN angel_tokens > 0 THEN 0.75 ELSE 0.5 END, 4),
      updated_at = now()
    WHERE shame_tokens > 0 OR evil_tokens > 0 OR lazy_tokens > 0 OR dumb_tokens > 0
  `);
  return res.rowCount; // users decayed
}
