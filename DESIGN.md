# Bullship — Token Economy & The Rabbit Hole

Bullship is a blockchain trivia game: players guess whether headlines are real or
AI-generated. Correct guesses earn **SMART**; wrong guesses earn **DUMB**. Every
token is **play money** — a TON jetton with no cash value, no market, no listing.

**The philosophy: a game with a story, not a story with a game.** The economy is
not a book you read — it is a course you *pass*. Every mechanic is earned by
doing, never handed to you. The "story" is the narrative of your own mastery.

---

## The 12 tokens

Every token has a **draw up** (how you earn it) and a **draw down** (how you
spend it). No token is passive — each has an active action.

| Token | Class | Draw up (earn) | Draw down (spend) |
|-------|-------|----------------|-------------------|
| SMART  | good | correct guesses | burn → cleanse GLUTTON |
| DUMB   | bad · decays 30d | wrong guesses | split → GOOD or EVIL |
| SEER   | good | predict the category | burn → buy a reveal |
| SHAME  | bad · soulbound · decays 14d | abstain | burn → the ritual (atone) |
| VOICE  | good | share / refer | burn → boost line position |
| LAZY   | bad · decays 7d | not playing | burn → catch up a missed day |
| MODEST | good | own your failures | burn → confess (dissolve own shame) |
| GRACE  | good | serve as priest | burn → bless another's shame |
| EVIL   | bad · decays 30d | split DUMB → evil | burn → tempt fate (risky hint) |
| GOOD   | good | split DUMB → good | burn → redeem into SMART |
| ANGEL  | soulbound | claim (paid) | spend → activate the glutton shield |
| GLUTTON | soulbound · grows | inactivity / subsidy | burn with SMART → cleanse |

The four **decaying** tokens are DUMB, SHAME, EVIL, LAZY. The three **soulbound**
tokens are SHAME, ANGEL, GLUTTON. Decay and glutton-growth are **context** — the
*reason* an action is urgent — not a trial in themselves.

---

## The Bullship Quotient (BQ)

BQ is the live measure of intelligence, folly, influence, and reputation. It is
the single score the whole game reports.

```
BQ = (E + √B + d·D + DecayedVoice) − (S²·λ) − (G·μ)
```

- `E` = earned SMART
- `√B` = bought SMART (quadratic — caps whales)
- `d·D` = DUMB at **~10-20%** weight — a small participation credit (you guessed, which beats abstaining)
- `DecayedVoice` = VOICE (diminishing credit)
- `S²·λ` = SHAME (quadratic — the harsh stick for *not* playing)
- `G·μ` = GLUTTON (linear — the gentle, growing drag)

---

## The Half-Life Token — the core mechanic

The most novel piece: a token that **decays from the moment it's minted**.

Every *bad* token has a **half-life** (e.g. DUMB = 30 days). The clock starts at
the **first transfer** out of the treasury. From then on its effective value is:

```
effective = raw × 2^(−age / half_life)
```

After one half-life it's worth 50%; after two, 25%; it approaches zero but never
quite dies.

- **Age follows the token** — a transfer does not refresh the clock; the token
  stays "radioactive".
- **Good tokens have `half_life = ∞`** — they never decay.
- **On-chain** — realized as a *custom* jetton whose `get_wallet_data` returns
  the decayed balance, computed from the wallet's `(raw_balance, mint_time)`.

This makes **time a first-class mechanic**: bad tokens expire, creating urgency
to spend them (the shame ritual, the Good/Evil split) rather than hoard them.

### Why on-chain half-life beats off-chain decay

An off-chain decay (a daily DB halving) only bites the *unclaimed* balance —
claim a token and it "escapes" the decay. An **on-chain** half-life means the
token itself keeps shrinking *in the wallet*, so claiming can't dodge it.

### The primitive (a custom decaying jetton)

The wallet stores two fields instead of a single balance:

```
raw_balance  — the undecayed amount
mint_time    — the weighted-average "birth" timestamp
```

- **Read**: `get_wallet_data` returns
  `raw_balance × 2^(−(now − mint_time) / half_life)`.
- **Decay clock starts at the first transfer OUT of the maker wallet** — the
  maker's own wallet has `mint_time = 0` (no decay); the first transfer to a
  player sets `mint_time = now()`; every later transfer passes the age along.
- **Transfer** of `X` effective tokens: move `X / decay_factor` raw, and merge
  the sender's `mint_time` into the recipient's as a weighted average.

Half-life values (defaults): DUMB 30d, SHAME 14d, LAZY 7d, EVIL 30d. Good tokens
and ANGEL never decay.

### The contract flags

One jetton contract serves every token. Four master-level flags, set at deploy
and mirrored into each wallet:

| Flag | Meaning |
|------|---------|
| `decaying` | token decays on a per-token `half_life` |
| `half_life` | seconds per halving (0 = never) |
| `soulbound` | non-transferable — burn is the only exit |
| `maker` | treasury address — its own wallet never decays |

Burn is standard TEP-74 (`0x595f07bc`) and works for **every** token, including
soulbound ones. The contract is compiled and future-proof: decay, soulbound,
burn, mint and transfer are all flags; cross-token rules (e.g. SMART-burns-to-
cleanse-GLUTTON) and glutton growth live off-chain.

---

## The claim economy & the line

Balances are earned in-game (in a database). A **claim** moves them on-chain.

Pressing **claim** does not grant tokens instantly — it puts you **in the line**.
The line is a queue, and it is funded by the people who pay:

1. **Paid claim** — an **Angel** signs a TON amount (any amount).
2. **Angels activate the line** — their claim is what physically bridges the
   queued players' tokens on-chain.
3. **50/50 split** — half to the treasury, half to a **claim pool** that pays
   the gas for the non-Angels in the line.

So a non-Angel isn't "claiming" — they are *standing in line*, and an Angel's
real claim is the engine that moves them. Angels are bridged first (most Angel =
highest priority), then the subsidized non-Angels.

**Raising your place:** share the game (earn **VOICE**) and burn VOICE to boost
your position. The boost is **dynamic** — a fraction of the line, and the
fraction scales with your rank:

| Boost rank | Jump |
|------------|------|
| top ~1% of boosters | ~10% of the line |
| next ~10% | ~5% |
| everyone else | ~1% |

It scales with the crowd (10,000 in line → the top booster jumps 1,000 spots)
and stays competitive — "highest booster" is a title worth holding.

---

## The Angel system

Angel is the "skin in the game" score, earned only by claiming. It grants:

| Buff | Effect |
|------|--------|
| Oracle's Favor | +2% SMART per Angel on correct answers (cap +50%) |
| Claim Priority | bridged first in the global claim |
| Glutton Shield | **active** — spend Angel to hold the shield (slower glutton accrual) for a window |

> The shield is **spent**, not passive: holding Angel does nothing on its own.
> Activating the shield is a choice, which keeps every Angel mechanic active.

---

## The Rabbit Hole — 11 chapters over 3 months

The economy is revealed as a **course you pass**, one chapter per week — an
~11-week (~3 month) arc. The order is **fixed** (everyone walks the same story),
and each chapter opens only when you have **earned the token** and **mastered
the mechanic** — used it enough times to understand it — **and a week has
passed**. There are no passive unlocks; you cannot skip ahead by reading.

| # | Chapter | Earn | Master by |
|---|---------|------|-----------|
| 1 | The Reveal | guess → SMART / DUMB | guessing daily |
| 2 | The Fork | split DUMB → GOOD (redeem) *or* EVIL (tempt) | splitting both ways |
| 3 | The Ritual | burn SHAME to atone | performing the ritual |
| 4 | The Eye | burn SEER to reveal | buying reveals |
| 5 | The Voice | burn VOICE to climb the line | boosting your place |
| 6 | The Confession | burn MODEST to shed shame | confessing |
| 7 | The Blessing | burn GRACE to lift another | blessing others |
| 8 | The Catch-up | burn LAZY to replay a missed day | catching up |
| 9 | The Debt | burn SMART to cleanse glutton | cleansing the debt |
| 10 | The Skin | spend ANGEL to hold the shield | holding the shield |
| 11 | The Crown | the reign — "Smartest Bullshipper Alive" | the prize |

Good and Evil fold into The Fork (one chapter, two roads). Decay and
glutton-growth are the *context* — the reason the action is urgent ("split it
now, it's fading") — never the trial itself.

---

## The veil

The economy is invisible until you act to reveal it:

```
guess (veil 0)
  → claim = join the line
  → tokens land (one veil: they're real)
  → poke a token → "DO NOT TOUCH THIS unless you're ready to go down a rabbit hole"
  → one veil at a time, per token, opened only by acting on it
```

A player who only wants to guess never lifts a veil and never loses anything:
the core loop is complete and penalty-free. Every "stick" is either a relief
(decay), opt-in (glutton only accrues if you claim), or non-participation only
(shame). Depth is a **carrot** — engaging adds, never required to break even.

---

## Decay

Bad tokens (DUMB, SHAME, LAZY, EVIL) **decay** on their per-token half-life.
Decay is a *relief* for the casual player (your shame fades) and *urgency* for
the deep player (split or spend it before it's gone). It is context, not a
trial. Once claimed on-chain, the jetton itself keeps shrinking in the wallet —
claiming cannot dodge the half-life.

---

## Why this design

- **A game with a story** — the economy is earned by doing, never read. Every
  mechanic has an active in and an active out.
- **Claiming is sponsored, not gated** — you never have to pay to play. Free
  players are subsidized by the Angels who choose to claim.
- **Depth is opt-in** — a player who only wants to guess never sees the rabbit
  hole and never loses anything to it.
- **Decay keeps bad tokens honest** — no permanent shame piles; the half-life
  makes time a first-class mechanic.
- **The line is social** — the claim queue is funded by people and climbed by
  sharing, so the meta is common and discussable.

---

## Architecture

| Layer | Tech | Role |
|-------|------|------|
| Frontend | Flutter / Telegram Mini App | game UI, TON Connect |
| API | Node.js (Express) | bridge, claim, balance reads |
| Worker | Node.js (BullMQ) | scheduled decay + global claim |
| Chain | TON (jettons) | treasury signs batched transfers |
| DB | PostgreSQL | source of truth for unclaimed balances + Angel |

---

## Reference code

See `src/` for the scrubbed reference implementation of the novel pieces:

- `half-life-token.js` — the decaying jetton primitive (the core mechanic)
- `bridge.js` — the batched jetton bridge (one wallet message, rent-forward)
- `claim.js` — the paid claim + global claim (Angel-first + subsidy)
- `decay.js` — the daily DB decay (off-chain fallback)
- `buffs.js` — the Angel buff math

The full decaying/soulbound jetton contract (Tact) lives in the production repo
under `ton/contracts/decaying_jetton.tact` (flags: `decaying`, `half_life`,
`soulbound`, `maker`; TEP-74 burn; TEP-89 discovery).

---

## What's deliberately not in this repo

This repo is **design + reference code only**. It excludes:

- any private key / mnemonic / `.env`
- the live treasury + jetton addresses (placeholders only)
- production deployment config

These live in the private production repository.
