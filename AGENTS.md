# AGENTS.md

Overview of this project for developers and AI agents working on this codebase.

## Project Overview

A single-page mobile "listening" experience: a vertically swiped, three-page site used to share a personal message. Built with TanStack Start and deployed on Netlify.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Language | TypeScript 5.9 (strict mode) |
| Deployment | Netlify |

## Directory Structure

```
├── public
│   ├── favicon.ico
│   └── placeholder.png
├── src
│   ├── routes
│   │   ├── __root.tsx  # Root layout: HTML shell, global meta/title
│   │   └── index.tsx   # The entire three-page experience
│   ├── router.tsx       # TanStack Router setup
│   └── styles.css       # Tailwind import, fonts, keyframes
├── netlify.toml         # Build command (vite build), publish dir (dist/client)
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## How the page works (`src/routes/index.tsx`)

The whole experience lives in one route, `/`, with a full-viewport scroll-snap container holding three `<section>` pages:

1. **Page one** — an oversized type statement (the opening line).
2. **Page two** — a vertical list of six "tracks". Tapping a card expands it and plays a short synthesized tone (Web Audio `OscillatorNode`, no audio files) while the card fills a progress bar. Each track must fully play once to be marked "heard".
3. **Page three** — a single yes/no question. **Locked** (renders `PageThreeLocked` instead) until all six tracks have been heard; the right-hand nav dot and swipe-to-scroll for page 3 are both disabled until then. Once unlocked, the real `PageThree` renders with a yes/no toggle and a reveal message.

Progress state (`completed: Set<string>`) and current page index live in the top-level `Index` component and are passed down as props — no external state library needed for a single route this small.

### Editing the content

- **Track copy/count**: edit the `TRACKS` array in `index.tsx` (title, note, duration, synthesized tone frequency, colors).
- **Page 1 headline / page 3 question and reveal copy**: edit directly in the `PageOne` / `PageThree` components — all copy is currently placeholder text and is meant to be replaced.
- **Fonts**: `--font-garamond` (Cormorant Garamond italic, for the softer/personal lines) and `--font-sans` (Archivo, for bold display type) are defined as Tailwind theme tokens in `styles.css` and used via `font-garamond` / default sans classes.

## Conventions

- Single-file route composition is intentional here — this is a small, self-contained experience, not a multi-page app. Don't split into extra route files unless the scope grows.
- No backend/database is used or needed; all state is client-side and ephemeral (resets on reload).
- Tailwind utility classes only, no component library.
