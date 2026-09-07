# Bullship — The Whitepaper

*A daily trivia ritual with a half-life token economy. Play money, bragging rights, and a rabbit hole.*

## Abstract

Bullship is a daily trivia game on TON. Every day, players face **two true headlines and one AI-generated lie** and must spot the lie. Correct answers earn SMART, wrong answers earn DUMB — and every token is **play money**: a real on-chain jetton with no cash value, no market, and no listing.

Beneath that simple loop is a deliberately deep economy: a **half-life token** that decays on-chain, a **claim line** funded by players, a **Bullship Quotient** that scores everything, and an **eleven-chapter rabbit hole** that reveals the economy over a three-month arc.

The governing idea is one sentence: **it is a game with a story, not a story with a game.**

## 1. The philosophy

Most blockchain games are a *story with a game bolted on*: a narrative you read, with mechanics that exist to extract value. Bullship inverts it. The **game is primary** — you earn, you master, you climb — and the **story is the emergent narrative of your own mastery**.

Three consequences:

1. **Nothing is handed to you.** Every mechanic is earned by doing, never revealed by a tutorial.
2. **Depth is opt-in.** A player who only wants to guess the lie never sees the economy and never loses anything to it.
3. **Every mechanic has an active in and an active out.** No passive buffs, no dead tokens — decay is relief, not a chore; growth is a debt you choose to take on.

## 2. The core loop

Each day a player faces three headlines: two real, one AI-generated. They lock in one guess. The next day the lie is revealed, scores update, and tokens are awarded.

| Action | Token | Class |
|---|---|---|
| Correct guess | SMART | good |
| Wrong guess | DUMB | bad, decays |
| Abstain | SHAME | bad, soulbound, decays |
| Predict the category | SEER | good |
| Share / refer | VOICE | good |
| Not playing | LAZY | bad, decays |

The loop is **complete and penalty-free on its own**: guessing always helps your score, correct more than wrong. A player can play *only* this and have a full experience.

## 3. The tokens

Twelve tokens, each with a **draw up** (how you earn it) and a **draw down** (how you spend it):

| Token | Class | Draw up | Draw down |
|---|---|---|---|
| SMART | good | correct guesses | burn → cleanse GLUTTON |
| DUMB | bad · decays 30d | wrong guesses | split → GOOD or EVIL |
| SEER | good | predict category | burn → buy a reveal |
| SHAME | bad · soulbound · decays 14d | abstain | burn → the ritual (atone) |
| VOICE | good | share / refer | burn → boost line position |
| LAZY | bad · decays 7d | not playing | burn → catch up a missed day |
| MODEST | good | own failures | burn → confess (dissolve own shame) |
| GRACE | good | serve as priest | burn → bless another's shame |
| EVIL | bad · decays 30d | split DUMB → evil | burn → tempt fate (risky hint) |
| GOOD | good | split DUMB → good | burn → redeem into SMART |
| ANGEL | soulbound | claim (paid) | spend → activate the glutton shield |
| GLUTTON | soulbound · grows | inactivity / subsidy | burn with SMART → cleanse |

Four tokens **decay** (DUMB, SHAME, EVIL, LAZY). Three are **soulbound** (SHAME, ANGEL, GLUTTON) — non-transferable, with burn as the only exit. One **grows** (GLUTTON). Decay and growth are **context** — the *reason* an action is urgent — never a trial in themselves.

## 4. The Bullship Quotient (BQ)

BQ is the single score the whole game reports — the live measure of intelligence, folly, influence, and reputation.

```
BQ = (E + √B + d·D + DecayedVoice) − (S²·λ) − (G·μ)
```

- **E** — earned SMART (your correct answers)
- **√B** — bought SMART, square-rooted (caps whales)
- **d·D** — DUMB at ~10-20% weight (a small participation credit; guessing beats abstaining)
- **DecayedVoice** — VOICE, with diminishing credit
- **S²·λ** — SHAME, squared (the harsh stick for *not* playing)
- **G·μ** — GLUTTON, linear (the gentle, growing drag)

The shape is deliberate: participation is rewarded, abstention is punished hard, and greed is a gentle drag that grows.

## 5. The half-life token

The most novel piece: a token that **decays on-chain**. Bad tokens halve on a per-token half-life (DUMB 30d, SHAME 14d, LAZY 7d, EVIL 30d). The clock starts at the first transfer out of the treasury, and age follows the token — a transfer never refreshes it.

One jetton contract serves every token, with four master-level flags set at deploy:

- `decaying` — the token halves on its `half_life`
- `half_life` — seconds per halving (0 = never)
- `soulbound` — non-transferable, burn is the only exit
- `maker` — the treasury address, whose own wallet never decays

Burn is standard TEP-74 and works for every token, including soulbound ones. Because decay lives **in the wallet**, claiming cannot dodge it — the token keeps shrinking even after it's claimed.

## 6. The claim economy & the line

Balances are earned in-game (a database). A **claim** moves them on-chain — but pressing claim does not grant tokens instantly. It puts you **in the line**.

The line is a queue, funded by the people who pay:

1. An **Angel** signs a TON amount (any amount).
2. Their claim **activates the line** — physically bridging the queued players' tokens on-chain.
3. Half goes to the treasury, half to a **claim pool** that pays the gas for the non-Angels in the line.

So a non-Angel isn't claiming — they're *standing in line*, and an Angel's real claim is the engine that moves them. Angels are bridged first (most Angel = highest priority).

**Raising your place:** share the game to earn **VOICE**, and burn VOICE to boost your position. The boost is dynamic — a fraction of the line, scaling with your rank (top ~1% of boosters jump ~10% of the line). It scales with the crowd and stays competitive.

## 7. The Angel system

Angel is the skin-in-the-game score, earned only by claiming. It grants:

- **Oracle's Favor** — +2% SMART per Angel on correct answers (cap +50%)
- **Claim Priority** — bridged first in the global claim
- **Glutton Shield** — *active*: spend Angel to hold the shield (slower glutton accrual) for a window

The shield is **spent, not passive** — holding Angel does nothing on its own. Activating it is a choice.

## 8. The rabbit hole

The economy is revealed as a **course you pass** — eleven chapters, one per week, a three-month arc. The order is **fixed** (everyone walks the same story), and each chapter opens only when you have **earned the token**, **mastered the mechanic** (used it enough times to understand it), **and a week has passed**. No passive unlocks; no skipping ahead by reading.

1. **The Reveal** — guess → SMART / DUMB
2. **The Fork** — split DUMB → GOOD (redeem) or EVIL (tempt)
3. **The Ritual** — burn SHAME to atone
4. **The Eye** — burn SEER to reveal
5. **The Voice** — burn VOICE to climb the line
6. **The Confession** — burn MODEST to shed shame
7. **The Blessing** — burn GRACE to lift another
8. **The Catch-up** — burn LAZY to replay the missed
9. **The Debt** — burn SMART to cleanse glutton
10. **The Skin** — spend ANGEL to hold the shield
11. **The Crown** — the reign: "Smartest Bullshipper Alive"

## 9. The veil

The economy is invisible until you act to reveal it. Guess (veil 0) → claim (join the line) → tokens land (they're real) → poke a token → *"DO NOT TOUCH THIS unless you're ready to go down a rabbit hole"* → one veil at a time, per token, opened only by acting on it.

A player who only wants to guess never lifts a veil and never loses anything. Every "stick" is a relief (decay), opt-in (glutton only accrues if you claim), or non-participation-only (shame). Depth is a **carrot** — engaging adds, never required to break even.

## 10. Tokenomics

- **Play money.** Every token is a TON jetton with **no cash value**, no market, no pool, no listing. The disclaimer is written into the on-chain metadata so a wallet shows it too.
- **Soulbound.** SHAME, ANGEL, and GLUTTON cannot be transferred; burn is the only exit.
- **Decaying.** Bad tokens halve on a half-life, so shame fades and time is a first-class mechanic.
- **No extraction.** Claiming is sponsored, not gated — you never have to pay to play.

## 11. Roadmap

- **Phase 1 — Launch.** Core loop, the jettons, the claim line, the half-life decay.
- **Phase 2 — The rabbit hole.** The eleven-chapter arc, the veil, GLUTTON (token 12).
- **Phase 3 — Community.** The reign, the shame marketplace, leaderboards.
- **Phase 4 — Ecosystem.** Third-party integrations, a developer API.