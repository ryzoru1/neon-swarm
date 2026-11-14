# NEON SWARM

A neon arena-survivor game (Vampire Survivors-style auto-shooter) in a single
dependency-free HTML file. No build step, no assets, no frameworks — just open
`index.html` in any browser.

## How to play

- **WASD / Arrows** — move (auto-fires at the nearest enemy)
- Collect cyan XP gems, choose an upgrade on level-up
- Survive waves; a boss arrives every 5th wave
- **P / Esc** — pause

## Features

- 12 stacking upgrades (multishot, piercing, orbit blades, shock nova, crits…)
- 5 enemy types incl. splitting enemies and wave bosses
- Synthesized sound effects via WebAudio (zero audio files)
- Particles, screen shake, damage numbers, persistent high score

## Development

- `node test/smoke.js` — headless smoke test (no browser needed), also runs in CI
- MIT licensed — see [LICENSE](LICENSE)
