// buffs.js — the Angel buff math (reference, scrubbed).
//
// Angel is the "skin in the game" score. It grants in-game buffs that scale
// with the Angel amount. Only buffs that are cheap to compute are kept; a
// holder-dependent decay rate ("Angel holders decay slower") was removed because
// it requires reading another wallet's balance, which is not cheap on-chain.

// Oracle's Favor: +2% SMART per Angel on correct answers, capped at +50%.
function angelSmartMultiplier(angel) {
  return 1 + Math.min(Number(angel) * 0.02, 0.5);
}

// The decay rate is a per-token property (the half-life), not a holder buff:
// bad tokens decay at their own half-life regardless of Angel. Good tokens and
// ANGEL never decay, so the "shield" is structural — hold good tokens instead
// of bad ones.

// Claim priority is structural, not a number: in the global claim, users are
// sorted by Angel (desc) and bridged in that order. Non-Angels are subsidized
// only after Angels are handled.
