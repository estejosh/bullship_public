// decay.js — daily DB decay (reference, scrubbed).
//
// Bad tokens (DUMB, SHAME, LAZY, EVIL) halve each cycle. The decay rate is a
// per-token property, not a holder-dependent shield (removed because reading
// another wallet's balance is not cheap on-chain).

async function runDecay() {
  const res = await db.query(`
    UPDATE users SET
      shame_tokens = ROUND(shame_tokens * 0.5, 4),
      evil_tokens  = ROUND(evil_tokens  * 0.5, 4),
      lazy_tokens  = ROUND(lazy_tokens  * 0.5, 4),
      dumb_tokens  = ROUND(dumb_tokens  * 0.5, 4),
      updated_at = now()
    WHERE shame_tokens > 0 OR evil_tokens > 0 OR lazy_tokens > 0 OR dumb_tokens > 0
  `);
  return res.rowCount; // users decayed
}
