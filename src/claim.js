// claim.js — the paid claim + global claim (reference, scrubbed).
//
// The claim economy:
//   paid claim:   +1 Angel per TON, 50% treasury / 50% claim pool
//   global claim: Angel-first, then half the non-Angels subsidized from the pool

const { sendJettons } = require('./bridge');

// 10 transferable tokens (ANGEL is the priority/buff score, not bridged).
const CLAIMABLE_BALANCES = [
  // { token, column, master }
];

const CHUNK = 250; // max messages per wallet transfer

// Paid claim: sign a TON amount, earn Angel, feed the pool.
async function claim(userId, amount, txHash) {
  const angelAward = amount;       // +1 Angel per TON
  const poolShare = amount * 0.5;  // 50% to the claim pool

  await db.query('UPDATE users SET angel_tokens = angel_tokens + $1 WHERE id = $2', [angelAward, userId]);
  await db.query(
    "INSERT INTO game_state (key, value) VALUES ('claim_pool_ton', $1) " +
    'ON CONFLICT (key) DO UPDATE SET value = game_state.value + EXCLUDED.value',
    [poolShare]
  );
  await db.query('INSERT INTO claim_events (id, user_id, amount_ton, tx_hash, angel_awarded, pool_share) VALUES ($1,$2,$3,$4,$5,$6)',
    [/* id */, userId, amount, txHash, angelAward, poolShare]);
}

// Global claim: bridge everyone, Angel-first, half the non-Angels subsidized.
async function claimAll() {
  // Everyone with a linked wallet + a non-zero claimable balance.
  const rows = await db.query(`
    SELECT u.id, u.angel_tokens, cw.wallet_address,
           u.smart_tokens, u.dumb_tokens, u.seer_tokens, u.shame_tokens,
           u.voice_tokens, u.lazy_tokens, u.modest_tokens, u.grace_tokens,
           u.evil_tokens, u.good_tokens
    FROM users u
    JOIN chain_wallets cw ON cw.user_id = u.id AND cw.chain = 'ton'
    WHERE (u.smart_tokens > 0 OR u.dumb_tokens > 0 OR u.seer_tokens > 0 OR u.shame_tokens > 0
        OR u.voice_tokens > 0 OR u.lazy_tokens > 0 OR u.modest_tokens > 0 OR u.grace_tokens > 0
        OR u.evil_tokens > 0 OR u.good_tokens > 0)
  `);

  const build = (list) => {
    const transfers = [];
    const ids = new Set();
    for (const row of list) {
      for (const { column, master } of CLAIMABLE_BALANCES) {
        const balance = Number(row[column] || 0);
        if (balance <= 0) continue;
        transfers.push({ toAddress: row.wallet_address, jettonMasterAddress: master, amount: balance });
        ids.add(row.id);
      }
    }
    return { transfers, ids };
  };

  // Angel holders first, most Angel = highest priority.
  const angels = rows.filter((r) => Number(r.angel_tokens) > 0)
    .sort((a, b) => Number(b.angel_tokens) - Number(a.angel_tokens));
  const nonAngels = rows.filter((r) => !(Number(r.angel_tokens) > 0));

  // Subsidize half of non-Angels so it stays fun.
  const subsidized = nonAngels.slice(0, Math.ceil(nonAngels.length / 2));

  const angelBatch = build(angels);
  const subBatch = build(subsidized);
  const transfers = [...angelBatch.transfers, ...subBatch.transfers];

  // Batch + bridge (chunked), then debit the pool for the subsidized gas and
  // zero the claimed balances.
  for (let i = 0; i < transfers.length; i += CHUNK) {
    await sendJettons(transfers.slice(i, i + CHUNK));
  }
  const subsidyGas = subBatch.transfers.length * 0.02;
  await db.query("UPDATE game_state SET value = GREATEST(0, value - $1) WHERE key = 'claim_pool_ton'", [subsidyGas]);
  for (const id of new Set([...angelBatch.ids, ...subBatch.ids])) {
    await db.query('UPDATE users SET smart_tokens = 0, dumb_tokens = 0, /* ...all 10... */ WHERE id = $1', [id]);
  }
}
