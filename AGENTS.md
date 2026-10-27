# HOTLINE MAX

Birthday gift: a short top-down action game (Hotline Miami-like) for desktop browsers.

## Stack

- Phaser 3, TypeScript (strict, no `any`), Vite, npm
- No extra dependencies without a clear reason
- All assets local — no external APIs

## How to work

- Follow `promts/` in order. Do not skip ahead or add unrequested features.
- Work incrementally. Do not rewrite working systems without saying why.
- Do not silently remove features.
- Prefer simple, maintainable code over extra abstraction.
- Keep gameplay logic out of rendering where practical.
- After code changes: `npm run typecheck`, `npm run build`, and verify in the browser.

## Layout

- `src/scenes/` — Boot, Menu, Game (thin: wire systems, no combat math)
- `src/systems/` — input, movement, level, collision, weapons, combat
- `src/entities/` — player, projectiles, later enemies
- `src/data/` — levels and weapon stats (do not hardcode balance in scenes)
- `src/config.ts` — resolution, speeds, colors

## Gameplay rules

- Arcade physics for walls, bodies, and bullets
- Level layout is rectangles in `src/data/levels.ts`; camera bounds follow the level
- WASD is independent of mouse aim
- New levels should not require rewriting movement
