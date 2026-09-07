// half-life-token.js — the decaying jetton primitive (reference, scrubbed).
//
// The core mechanic: a token that decays from the first transfer OUT of the
// maker (treasury) wallet. mint_time = 0 means "still in the maker" → no decay.
// The on-chain wallet stores (raw_balance, mint_time) and get_wallet_data
// returns the DECAYED balance.

const MAKER_ADDRESS = 'EQ…'; // the treasury wallet — its tokens never decay

const HALF_LIFE_DAYS = { DUMB: 30, SHAME: 14, LAZY: 7, EVIL: 30 };
// Good tokens (SMART, SEER, VOICE, MODEST, GRACE, GOOD) and ANGEL never decay.

// decay = 2^(-age / half_life); age = 0 → 1 (no decay yet).
function decayFactor(ageSeconds, halfLifeDays) {
  if (!isFinite(halfLifeDays) || ageSeconds <= 0) return 1;
  return 2 ** (-ageSeconds / (halfLifeDays * 86400));
}

// get_wallet_data: raw × decay. A wallet still "in the maker" (mint_time = 0)
// shows its full raw balance.
function effectiveBalance(wallet, halfLifeDays, nowSec = Date.now() / 1000) {
  if (wallet.mintTime === 0) return wallet.rawBalance;
  return wallet.rawBalance * decayFactor(nowSec - wallet.mintTime, halfLifeDays);
}

// Transfer X *effective* tokens. The decay clock starts on the FIRST transfer
// out of the maker, and every later transfer preserves the token's age.
function transfer(sender, recipient, xEffective, halfLifeDays, nowSec = Date.now() / 1000) {
  const senderEffective = effectiveBalance(sender, halfLifeDays, nowSec);
  const d = senderEffective / sender.rawBalance; // current decay factor
  const raw = xEffective / d;

  sender.rawBalance -= raw; // mint_time unchanged — remaining keeps its age

  // The incoming token's "birth" is either "now" (just left the maker) or the
  // sender's existing age (passed along).
  const incomingMintTime = sender.mintTime === 0 ? nowSec : sender.mintTime;

  const totalRaw = recipient.rawBalance + raw;
  recipient.mintTime =
    recipient.rawBalance === 0
      ? incomingMintTime                                   // first receipt — adopt the incoming age
      : (recipient.rawBalance * recipient.mintTime + raw * incomingMintTime) / totalRaw;
  recipient.rawBalance = totalRaw;
}

module.exports = { MAKER_ADDRESS, HALF_LIFE_DAYS, decayFactor, effectiveBalance, transfer };

