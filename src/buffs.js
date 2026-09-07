// buffs.js — the Angel buff math (reference, scrubbed).
//
// Angel is the "skin in the game" score. It grants in-game buffs that scale
// with the Angel amount.

// Oracle's Favor: +2% SMART per Angel on correct answers, capped at +50%.
function angelSmartMultiplier(angel) {
  return 1 + Math.min(Number(angel) * 0.02, 0.5);
}

// Decay Shield: Angel holders' bad tokens decay at 75% instead of 50%.
function decayFactor(angel) {
  return Number(angel) > 0 ? 0.75 : 0.5;
}

// Claim priority is structural, not a number: in the global claim, users are
// sorted by Angel (desc) and bridged in that order. Non-Angels are subsidized
// only after Angels are handled.
