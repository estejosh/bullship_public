# Bullship — Token Economy & Claim Design

Bullship is a blockchain trivia game: players guess whether headlines are real or
AI-generated. Correct guesses earn **SMART**; wrong guesses earn **DUMB**. Every
token is **play money** — a TON jetton with no cash value, no market, no listing.

---

## The 11 tokens

| Token | Earned by | Class | On-chain? |
|-------|-----------|-------|-----------|
| SMART  | correct guesses            | good | jetton |
| DUMB   | wrong guesses              | bad  | jetton |
| SEER   | predicting the category    | good | jetton |
| SHAME  | abstaining                 | bad  | jetton |
| VOICE  | sharing / referring        | good | jetton |
| LAZY   | not playing                | bad  | jetton |
| MODEST | owning your failures       | good | jetton |
| GRACE  | serving as a priest        | good | jetton |
| EVIL   | the evil side of DUMB      | bad  | jetton |
| GOOD   | the good side of DUMB      | good | jetton |
| ANGEL  | claiming (paid)            | —    | DB-only (priority/buff score) |

Ten are transferable jettons. **ANGEL** is not transferred — it is the
"skin-in-the-game" score that drives priority and buffs.

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
- **Transfer** of `X` effective tokens: move `X / decay_factor` raw, and merge
  the sender's `mint_time` into the recipient's as a weighted average.

Half-life values (defaults): DUMB 30d, SHAME 14d, LAZY 7d, EVIL 30d. Good tokens
and ANGEL never decay.

---

## The claim economy (the core loop)

Balances are earned in-game (in a database). A **claim** moves them on-chain:

1. **Paid claim** — a player signs a TON amount (any amount) from their wallet.
2. **+1 Angel per TON** — the reward for claiming.
3. **50/50 split** — half to the **treasury**, half to a **claim pool**.

The claim pool is the "everyone wins" mechanic: it pays the gas to bridge the
tokens of players who have *not* claimed. A claimer literally sponsors the
players behind them.

4. **Global claim (daily)** — one batched transaction:
   - **Angel holders first** (most Angel = highest priority).
   - Then **half the non-Angels** are subsidized from the pool.

Net effect: claiming is self-sustaining (claimers fund non-claimers), and
claiming earns you priority for the next cycle.

---

## The Angel system

Angel is the "skin in the game" score. It grants:

| Buff | Requirement | Effect |
|------|-------------|--------|
| Decay Shield | ≥ 1 Angel | bad tokens decay at **75%** instead of 50% |
| Oracle's Favor | ≥ 1 Angel | **+2% SMART** per Angel on correct answers (cap +50%) |
| Claim Priority | ≥ 1 Angel | bridged first in the global claim |

---

## Decay

Bad tokens (DUMB, SHAME, LAZY, EVIL) **decay daily** — halved each cycle — to
prevent hoarding and keep the game moving. Angel holders decay slower.

Decay applies to the **unclaimed** (in-game) balance. Once claimed on-chain, a
token is "settled" and stops decaying.

---

## Why this design

- **Claiming is sponsored, not gated** — you never have to pay to play. Free
  players are subsidized by the people who choose to claim.
- **Angels align incentives** — the people who fund the game get first dibs and
  in-game buffs.
- **Decay keeps bad tokens honest** — no permanent shame piles.

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
- `decay.js` — the daily DB decay + Angel shield (off-chain fallback)
- `buffs.js` — the Angel buff math

---

## What's deliberately not in this repo

This repo is **design + reference code only**. It excludes:

- any private key / mnemonic / `.env`
- the live treasury + jetton addresses (placeholders only)
- production deployment config

These live in the private production repository.
