// half-life-token.js — the decaying jetton primitive (reference, scrubbed).
//
// The core mechanic: a token that decays from the moment it's minted, with a
// fixed half-life. The on-chain wallet stores (raw_balance, mint_time) and its
// get_wallet_data returns the DECAYED balance, so the token shrinks in-wallet
// and a claim can't "dodge" the decay.

const HALF_LIFE_DAYS = { DUMB: 30, SHAME: 14, LAZY: 7, EVIL: 30 };
// Good tokens (SMART, SEER, VOICE, MODEST, GRACE, GOOD) and ANGEL have
// half_life = Infinity — they never decay.

// decay = 2^(-age / half_life)
function decayFactor(ageSeconds, halfLifeDays) {
  if (!isFinite(halfLifeDays)) return 1;
  return 2 ** (-ageSeconds / (halfLifeDays * 86400));
}

// The on-chain "get_wallet_data" result: raw × decay.
function effectiveBalance(rawBalance, mintTime, halfLifeDays, nowSec = Date.now() / 1000) {
  return rawBalance * decayFactor(nowSec - mintTime, halfLifeDays);
}

// Transfer X *effective* tokens, preserving age (the token stays radioactive).
function transfer(sender, recipient, xEffective, halfLifeDays, nowSec = Date.now() / 1000) {
  const d = decayFactor(nowSec - sender.mintTime, halfLifeDays);
  const raw = xEffective / d;

  sender.rawBalance -= raw; // mint_time unchanged — remaining keeps its age

  // Recipient merges via a weighted-average mint time.
  const totalRaw = recipient.rawBalance + raw;
  recipient.mintTime =
    (recipient.rawBalance * recipient.mintTime + raw * sender.mintTime) / totalRaw;
  recipient.rawBalance = totalRaw;
}

module.exports = { HALF_LIFE_DAYS, decayFactor, effectiveBalance, transfer };
