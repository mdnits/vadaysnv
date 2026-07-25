import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Halo halo halo" },
      {
        name: "description",
        content:
          "let's see where this going.",
      },
      { property: "og:title", content: "halo navy^^" },
      {
        property: "og:description",
        content: "neva navy vadays coba buka inih.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Track = {
  id: string;
  title: string;
  note: string;
  duration: string;
  seconds: number;
  volume: number;
  audio: string;
  bg: string;
  fg: string;
};

const TRACKS: Track[] = [
  { id: "01", title: "Intro", note: "intro ala ala radio gitu ceritanya.", duration: "0:13", seconds: 13, audio: "/audio/opening.mp3", volume:1.0, bg: "#E8FF5A", fg: "#0A0A0A" },
  { id: "02", title: "Lagu clairo", note: "you knew me ^^.", duration: "0:25", seconds: 25, audio: "/audio/juna.mp3", volume: 0.10, bg: "#FF6A3D", fg: "#0A0A0A" },
  { id: "03", title: "Ini lagu yang kamu pilih", note: "aku pas denger lagu ini bareng kamu jadi salting jir:DDD.", duration: "0:21", seconds: 21, audio: "/audio/love.mp3", volume: 0.10, bg: "#B9C7FF", fg: "#0A0A0A" },
  { id: "04", title: "Kalo ini aku pas bareng kmu^^", note: "any reason to be close to you.", duration: "0:21", seconds: 21, audio: "/audio/shout ab it.mp3", volume: 0.10, bg: "#F7B7D9", fg: "#0A0A0A" },
  { id: "05", title: "Enak banget lagu ini", note: "udah ketebak belum?^^.", duration: "0:14", seconds: 14, audio: "/audio/hanya untukmu.mp3", volume: 0.10, bg: "#1A1A1A", fg: "#E8FF5A" },
  { id: "06", title: "Udah deeehh", note: "read every first letter. this is my confession", duration: "0:16", seconds: 16, audio: "/audio/ending.mp3", volume:1.0, bg: "#7BE3B1", fg: "#0A0A0A" },
];

function Index() {
  const [page, setPage] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(() => new Set());
  const allDone = completed.size >= TRACKS.length;

  const goTo = (i: number) => {
    if (i < 0 || i > 2) return;
    if (i === 2 && !allDone) return;
    setPage(i);
  };

  const markComplete = (id: string) =>
    setCompleted((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  // Frame background matches active page so surrounding desktop area is cohesive
  const frameBg = page === 1 ? "#0A0A0A" : "#FFFFFF";

  // Swipe handling (vertical) — triggers the crossfade, no scrolling
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dy) < 60 || Math.abs(dy) < Math.abs(dx)) return;
    // Respect inner scrollers: only page when at the edge in the swipe direction
    const el = e.target as HTMLElement | null;
    const scroller = el?.closest<HTMLElement>(".hide-scrollbar");
    if (scroller) {
      const atTop = scroller.scrollTop <= 0;
      const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
      if (dy < 0 && !atBottom) return;
      if (dy > 0 && !atTop) return;
    }
    if (dy < 0) goTo(page + 1);
    else goTo(page - 1);
  };

  // Wheel handling on desktop — same crossfade
  const wheelLock = useRef(0);
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < 30) return;
    const now = Date.now();
    if (now - wheelLock.current < 700) return;
    const el = e.target as HTMLElement | null;
    const scroller = el?.closest<HTMLElement>(".hide-scrollbar");
    if (scroller) {
      const atTop = scroller.scrollTop <= 0;
      const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
      if (e.deltaY > 0 && !atBottom) return;
      if (e.deltaY < 0 && !atTop) return;
    }
    wheelLock.current = now;
    if (e.deltaY > 0) goTo(page + 1);
    else goTo(page - 1);
  };

  return (
    <main
      className="fixed inset-0 overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: frameBg }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
    >
      {/* Mobile-style stage, centered on desktop */}
<div className="relative mx-auto h-full w-full overflow-hidden bg-inherit lg:shadow-2xl">        <PageFade show={page === 0}>
          <PageOne onNext={() => goTo(1)} />
        </PageFade>
        <PageFade show={page === 1}>
          <PageTwo
            completed={completed}
            markComplete={markComplete}
            allDone={allDone}
            onNext={() => goTo(2)}
            onBack={() => goTo(0)}
          />
        </PageFade>
        <PageFade show={page === 2}>
          {allDone ? (
            <PageThree onBack={() => goTo(1)} />
          ) : (
            <PageThreeLocked completedCount={completed.size} total={TRACKS.length} onBack={() => goTo(1)} />
          )}
        </PageFade>

        {/* Pager dots */}
        <nav className="pointer-events-none absolute right-4 top-1/2 z-50 -translate-y-1/2 flex flex-col items-center gap-2">
          {[0, 1, 2].map((i) => {
            const dark = page === 1;
            const locked = i === 2 && !allDone;
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                disabled={locked}
                aria-label={`Go to page ${i + 1}${locked ? " (locked)" : ""}`}
                className={`pointer-events-auto w-1.5 rounded-full transition-all duration-300 ${
                  page === i ? "h-8" : "h-1.5"
                } ${
                  dark
                    ? page === i
                      ? "bg-white"
                      : "bg-white/30"
                    : page === i
                      ? "bg-black"
                      : "bg-black/25"
                } ${locked ? "opacity-40" : ""}`}
              />
            );
          })}
        </nav>
      </div>

      <style>{`
        @keyframes grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .fade-up { animation: fadeUp 0.7s ease-out both; }
        .fade-up-delay-1 { animation-delay: 0.08s; }
        .fade-up-delay-2 { animation-delay: 0.18s; }
        .fade-up-delay-4 { animation-delay: 0.5s; }
        .fade-in { animation: fadeIn 0.6s ease-out both; }
        .fade-up-delay-3 { animation-delay: 0.32s; }
      `}</style>
    </main>
  );
}

function PageFade({ show, children }: { show: boolean; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(show);
  useEffect(() => {
    if (show) {
      setMounted(true);
    } else {
      const t = setTimeout(() => setMounted(false), 500);
      return () => clearTimeout(t);
    }
  }, [show]);

  if (!mounted && !show) return null;

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-500 ease-out ${
        show ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

/* ------------------------------- Page 1 ------------------------------- */

function PageOne({ onNext }: { onNext: () => void }) {
  return (
    <section className="relative w-full h-full bg-white text-black flex flex-col">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 pt-14">
        <span className="text-[11px] uppercase tracking-[0.22em]">
          Hello Navy^^
        </span>

        <span className="font-garamond text-base">
          no. 001
        </span>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center w-full max-w-7xl mx-auto px-6 md:px-16 lg:px-24 xl:px-32">
        <p className="font-garamond text-lg text-black/60 mb-6 fade-up">
          from <span className="not-italic font-sans">—</span> md
        </p>

        {/* Mobile */}
<h1
  className="lg:hidden leading-[0.85] font-bold tracking-[-0.04em] fade-up fade-up-delay-1"
  style={{
    fontSize: "clamp(3.5rem, 12vw, 6rem)",
  }}
>
  There's
  <br />
  something
  <br />
  <span className="font-garamond font-light italic">I've</span>
  <br />
  been
  <br />
  meaning
  <br />
  to <span className="font-garamond font-light italic">say</span>.
</h1>

{/* Desktop */}
<h1
  className="hidden lg:block leading-[0.9] font-bold tracking-[-0.04em] fade-up fade-up-delay-1"
  style={{
    fontSize: "clamp(5rem, 7vw, 8rem)",
  }}
>
  There's something
  <br />
  <span className="font-garamond font-light italic">I've</span> been
  <br />
  meaning to <span className="font-garamond font-light italic">say</span>.
</h1>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 md:px-16 lg:px-24 xl:px-32 pb-12 flex items-end justify-between fade-up fade-up-delay-3">
        <p className="max-w-xs text-[13px] leading-snug text-black/60">
          coba tebak apaaaa^^.
        </p>

        <button
          onClick={onNext}
          className="font-garamond text-sm text-black/70 whitespace-nowrap underline underline-offset-4"
        >
          begin <span className="not-italic font-sans">→</span>
        </button>
      </footer>
    </section>
  );
}

/* ------------------------------- Page 2 ------------------------------- */

function PageTwo({
  completed,
  markComplete,
  allDone,
  onNext,
  onBack,
}: {
  completed: Set<string>;
  markComplete: (id: string) => void;
  allDone: boolean;
  onNext: () => void;
  onBack: () => void;
}) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

 useEffect(() => {
  return () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };
}, []);

  const stop = () => {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current = null;
  }

  setPlayingId(null);
};

  const play = (t: Track) => {
  stop();

  const audio = new Audio(t.audio);

audio.volume = t.volume;

if (["02", "03", "04", "05"].includes(t.id)) {
  const fadeDuration = 3; // seconds

  const fadeTimeout = window.setTimeout(() => {
  
    const startVolume = t.volume;
    const start = Date.now();

    const fadeInterval = window.setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const progress = Math.min(elapsed / fadeDuration, 1);

      audio.volume = startVolume * (1 - progress);

      if (progress >= 1) {
        clearInterval(fadeInterval);
      }
    }, 50);
  }, (t.seconds - fadeDuration) * 1000);
}
  audioRef.current = audio;
  setPlayingId(t.id);

  audio.play();

  audio.onended = () => {
    markComplete(t.id);
    stop();
  };
};

  const onCardClick = (t: Track) => {
    if (expandedId === t.id) {
      setExpandedId(null);
      stop();
      return;
    }
    setExpandedId(t.id);
    play(t);
  };

  const remaining = TRACKS.length - completed.size;

  return (
    <section className="relative w-full h-full bg-[#0A0A0A] text-white flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-6 pt-14 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/60"
        >
          <ArrowLeft className="w-3 h-3" strokeWidth={1.5} />
          <span>Back</span>
        </button>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">Listened</p>
          <p className="font-garamond text-lg mt-0.5">
            {completed.size}
            <span className="not-italic font-sans text-white/40"> / {TRACKS.length}</span>
          </p>
        </div>
      </header>

<div className="px-6 md:px-12 lg:px-20 pb-2">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">coba tebak</p>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mt-1">aku mau apa</h2>
      </div>

<div className="flex-1 overflow-y-auto hide-scrollbar px-4 md:px-10 lg:px-20 pb-24 pt-3">        <div className="flex flex-col gap-3">
          {TRACKS.map((t) => {
            const expanded = expandedId === t.id;
            const playing = playingId === t.id;
            const done = completed.has(t.id);
            return (
              <div key={t.id} className="w-full transition-all duration-300">
                <button
                  onClick={() => onCardClick(t)}
                  style={{ backgroundColor: t.bg, color: t.fg }}
                  className={`group relative w-full rounded-2xl p-5 text-left flex flex-col justify-between overflow-hidden active:scale-[0.99] transition-[height,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    expanded ? "h-[24rem]" : "h-28"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] uppercase tracking-[0.2em] opacity-70">{t.id}</span>
                    <span
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] ${
                        playing ? "animate-pulse" : ""
                      }`}
                      style={{ backgroundColor: t.fg, color: t.bg }}
                    >
                      {playing ? "‖" : done ? "✓" : "▶"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold leading-tight tracking-tight">{t.title}</h3>
                    <p className="mt-1 text-[11px] opacity-70">
                      {t.duration}
                      {done ? " · heard" : ""}
                    </p>

                    <div
                      className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-out ${
                        expanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"
                      }`}
                    >
                      <div className="overflow-hidden">
<p className="text-[13px] leading-relaxed text-gray-400 max-w-[28rem]">
  {t.note}
</p>                        <div className="mt-5 flex items-center gap-3">
                          <span
                            className="h-9 w-9 rounded-full flex items-center justify-center text-xs"
                            style={{ backgroundColor: t.fg, color: t.bg }}
                          >
                            {playing ? "‖" : "▶"}
                          </span>
                          <div className="flex-1">
                            <div
                              className="h-[3px] w-full rounded-full overflow-hidden"
                              style={{ backgroundColor: `${t.fg}33` }}
                            >
                              <div
                                key={playing ? `p-${t.id}` : `s-${t.id}-${done}`}
                                className="h-full origin-left"
                                style={{
                                  backgroundColor: t.fg,
                                  transform: done && !playing ? "scaleX(1)" : undefined,
                                  animation: playing ? `grow ${t.seconds}s linear forwards` : undefined,
                                }}
                              />
                            </div>
                            <div className="mt-1.5 flex justify-between text-[10px] opacity-60">
                              <span>{playing ? "playing" : done ? "heard" : "tap to play"}</span>
                              <span>{t.duration}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {playing && !expanded && (
                    <div
                      className="absolute bottom-0 left-0 h-0.5 w-full origin-left"
                      style={{
                        backgroundColor: t.fg,
                        animation: `grow ${t.seconds}s linear forwards`,
                      }}
                    />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center px-6">
        {allDone ? (
          <button
            onClick={onNext}
            className="font-garamond text-sm text-white/80 underline underline-offset-4"
          >
            all heard <span className="not-italic font-sans">— continue </span>
          </button>
        ) : (
          <p className="font-garamond text-sm text-white/60 text-center pointer-events-none">
            {remaining} {remaining === 1 ? "sound" : "sounds"} left before the last page
          </p>
        )}
      </div>
    </section>
  );
}

/* ---------------------------- Page 3 (locked) ---------------------------- */

function PageThreeLocked({
  completedCount,
  total,
  onBack,
}: {
  completedCount: number;
  total: number;
  onBack: () => void;
}) {
  const pct = Math.round((completedCount / total) * 100);
  return (
    <section className="relative w-full h-full bg-white text-black flex flex-col">
      <header className="flex items-center justify-between px-6 pt-14">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-black/60"
        >
          <ArrowLeft className="w-3 h-3" strokeWidth={1.5} />
          <span>Back</span>
        </button>
        <span className="font-garamond text-base">not yet</span>
      </header>

<div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-24">        <p className="font-garamond text-lg text-black/60 mb-6 fade-up">a page kept closed</p>
        <h2 className="text-[13vw] sm:text-[4rem] leading-[0.9] font-bold tracking-[-0.03em] fade-up fade-up-delay-1">
          Listen
          <br />
          first,
          <br />
          <span className="font-garamond font-normal">then</span>
          <br />
          answer.
        </h2>

        <div className="mt-12 max-w-sm fade-up fade-up-delay-2">
          <div className="flex items-baseline justify-between text-[11px] uppercase tracking-[0.22em] text-black/50">
            <span>Heard</span>
            <span>
              {completedCount} / {total}
            </span>
          </div>
          <div className="mt-3 h-[2px] w-full bg-black/10 overflow-hidden">
            <div className="h-full bg-black transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <footer className="px-6 pb-12 flex items-end justify-between text-[13px] text-black/50">
        <span>Locked</span>
      </footer>
    </section>
  );
}

/* ------------------------------- Page 3 ------------------------------- */

type Choice = "yes" | "no" | null;

function PageThree({ onBack }: { onBack: () => void }) {
  const [choice, setChoice] = useState<Choice>(null);
  const messages: Record<string, string> = {
    yes: "Thank you. That makes me happier than I know how to say. I hope this is the beginning of something beautiful. ♡",
    no: "No hard feelings. Really. I’m just happy I got the chance to tell you what my heart had been holding onto.",
  };

  return (
    <div
      className="relative h-full flex flex-col px-6 pt-14 pb-20"
      style={{ paddingTop: "max(3.5rem, env(safe-area-inset-top))" }}
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-neutral-500 fade-up self-start"
      >
        <ArrowLeft className="w-3 h-3" strokeWidth={1.5} />
        <span>Back</span>
      </button>

      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
        <p className="text-[10px] tracking-[0.25em] uppercase text-neutral-400 mb-8 fade-up fade-up-delay-1">
          One last thing
        </p>
        <h2
  className="font-medium leading-[1.05] tracking-tight text-neutral-900 fade-up fade-up-delay-2"
style={{
  fontSize: "clamp(2.25rem, 7vw, 5rem)",
}}>
  Do you want
  <br />
  <span className="font-garamond italic font-normal">us</span> to be more
  <br />
  than <span className="font-garamond italic font-normal">friends</span>?
</h2>

       {choice === null ? (
  <div className="flex gap-12 mt-12 fade-up fade-up-delay-3">
    <button
      onClick={() => setChoice("yes")}
      className="font-garamond italic text-3xl md:text-5xl text-neutral-900 transition-all hover:scale-110 active:scale-95"
    >
      yes
    </button>

    <span className="font-garamond italic text-3xl md:text-5xl text-neutral-300">
      /
    </span>

    <button
      onClick={() => setChoice("no")}
      className="font-garamond italic text-3xl md:text-5xl text-neutral-900 transition-all hover:scale-110 active:scale-95"
    >
      no
    </button>
  </div>
) : (
          <div className="fade-in mt-12">
            <p
  className="font-garamond italic leading-relaxed text-neutral-700 max-w-[18rem] mx-auto"
  style={{ fontSize: "clamp(0.95rem, 3.2vw, 1.25rem)" }}
>
  {messages[choice]}
</p>
            <button
              onClick={() => setChoice(null)}
              className="mt-10 text-[10px] tracking-[0.2em] uppercase text-neutral-400 underline underline-offset-4"
            >
              .
            </button>
          </div>
        )}
      </div>

      <div className="text-center text-[10px] tracking-[0.2em] uppercase text-neutral-400 fade-up fade-up-delay-4">
        <span>for neva — 2026</span>
      </div>
    </div>
  );
}
