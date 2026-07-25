# For You

A small, mobile-first "listening" experience made for sharing a personal message — three pages you swipe through vertically: an opening line, a set of six short audio "memories" you tap through, and a final page with a single question that only unlocks after everything has been listened to.

All copy (the headline, the six track titles/notes, and the final question) is placeholder text — replace it with your own before sharing.

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React 19 + TanStack Router)
- Vite 7
- Tailwind CSS 4
- TypeScript
- Web Audio API for the small synthesized tones on page two (no audio files needed)

## Running locally

```bash
npm install
npm run dev
```

This starts the dev server on `http://localhost:3000`.

To preview it the way Netlify would serve it (including redirects/functions emulation), use the Netlify CLI instead:

```bash
netlify dev
```

## Editing the content

Everything lives in `src/routes/index.tsx`:

- Page 1's headline is in the `PageOne` component.
- The six tracks are in the `TRACKS` array — edit the title, note, and duration for each.
- Page 3's question and yes/no reveal messages are in the `PageThree` component.

See `AGENTS.md` for a fuller breakdown of how the page and lock mechanism work.
