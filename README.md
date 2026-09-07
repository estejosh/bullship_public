# Bullship — source-available design

The **design + reference implementation** of Bullship, a blockchain trivia game
built on TON.

This repository captures the *ideas and mechanics* — the claim economy, the
Angel system, the token taxonomy, the decay model — so they can be read, learned
from, and discussed. It is **not** the production system.

- **`DESIGN.md`** — the full token-economy and claim design.
- **`src/`** — scrubbed reference code for the novel pieces (bridge, claim,
  decay, Angel buffs).

## What this is

- A **design document** for a self-sustaining play-to-earn game economy.
- **Reference code** for the on-chain bridge and the claim/decay/buff logic.

## What this is not

- The production repo (secrets, live addresses, deployment config are not here).
- An installable/runnable product. This is a design + reference, not a drop-in.

## License

See `LICENSE`. Source-available: you may view and learn from it, but not
fork it into a competing product without permission.

## Status

This design is documented for discussion and reference. The production
implementation lives in a private repository.
