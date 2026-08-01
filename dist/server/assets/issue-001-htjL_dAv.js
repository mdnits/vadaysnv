import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
const TRACKS = [{
  id: "01",
  title: "Intro",
  note: "intro ala ala radio gitu ceritanya.",
  duration: "0:13",
  seconds: 13,
  audio: "/audio/opening.mp3",
  volume: 1,
  bg: "#E8FF5A",
  fg: "#0A0A0A"
}, {
  id: "02",
  title: "Lagu clairo",
  note: "you knew me ^^.",
  duration: "0:25",
  seconds: 25,
  audio: "/audio/juna.mp3",
  volume: 0.1,
  bg: "#FF6A3D",
  fg: "#0A0A0A"
}, {
  id: "03",
  title: "Ini lagu yang kamu pilih",
  note: "aku pas denger lagu ini bareng kamu jadi salting jir:DDD.",
  duration: "0:21",
  seconds: 21,
  audio: "/audio/love.mp3",
  volume: 0.1,
  bg: "#B9C7FF",
  fg: "#0A0A0A"
}, {
  id: "04",
  title: "Kalo ini aku pas bareng kmu^^",
  note: "any reason to be close to you.",
  duration: "0:21",
  seconds: 21,
  audio: "/audio/shout ab it.mp3",
  volume: 0.1,
  bg: "#F7B7D9",
  fg: "#0A0A0A"
}, {
  id: "05",
  title: "Enak banget lagu ini",
  note: "udah ketebak belum?^^.",
  duration: "0:14",
  seconds: 14,
  audio: "/audio/hanya untukmu.mp3",
  volume: 0.1,
  bg: "#1A1A1A",
  fg: "#E8FF5A"
}, {
  id: "06",
  title: "Udah deeehh",
  note: "read every first letter. this is my confession",
  duration: "0:16",
  seconds: 16,
  audio: "/audio/ending.mp3",
  volume: 1,
  bg: "#7BE3B1",
  fg: "#0A0A0A"
}];
function Index() {
  const [page, setPage] = useState(0);
  const [completed, setCompleted] = useState(() => /* @__PURE__ */ new Set());
  const allDone = completed.size >= TRACKS.length;
  const goTo = (i) => {
    if (i < 0 || i > 2) return;
    if (i === 2 && !allDone) return;
    setPage(i);
  };
  const markComplete = (id) => setCompleted((prev) => {
    if (prev.has(id)) return prev;
    const next = new Set(prev);
    next.add(id);
    return next;
  });
  const frameBg = page === 1 ? "#0A0A0A" : "#FFFFFF";
  const touchStart = useRef(null);
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchStart.current = {
      x: t.clientX,
      y: t.clientY
    };
  };
  const onTouchEnd = (e) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dy) < 60 || Math.abs(dy) < Math.abs(dx)) return;
    const el = e.target;
    const scroller = el?.closest(".hide-scrollbar");
    if (scroller) {
      const atTop = scroller.scrollTop <= 0;
      const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
      if (dy < 0 && !atBottom) return;
      if (dy > 0 && !atTop) return;
    }
    if (dy < 0) goTo(page + 1);
    else goTo(page - 1);
  };
  const wheelLock = useRef(0);
  const onWheel = (e) => {
    if (Math.abs(e.deltaY) < 30) return;
    const now = Date.now();
    if (now - wheelLock.current < 700) return;
    const el = e.target;
    const scroller = el?.closest(".hide-scrollbar");
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
  return /* @__PURE__ */ jsxs("main", { className: "fixed inset-0 overflow-hidden transition-colors duration-500", style: {
    backgroundColor: frameBg
  }, onTouchStart, onTouchEnd, onWheel, children: [
    /* @__PURE__ */ jsxs("div", { className: "relative mx-auto h-full w-full overflow-hidden bg-inherit lg:shadow-2xl", children: [
      "        ",
      /* @__PURE__ */ jsx(PageFade, { show: page === 0, children: /* @__PURE__ */ jsx(PageOne, { onNext: () => goTo(1) }) }),
      /* @__PURE__ */ jsx(PageFade, { show: page === 1, children: /* @__PURE__ */ jsx(PageTwo, { completed, markComplete, allDone, onNext: () => goTo(2), onBack: () => goTo(0) }) }),
      /* @__PURE__ */ jsx(PageFade, { show: page === 2, children: allDone ? /* @__PURE__ */ jsx(PageThree, { onBack: () => goTo(1) }) : /* @__PURE__ */ jsx(PageThreeLocked, { completedCount: completed.size, total: TRACKS.length, onBack: () => goTo(1) }) }),
      /* @__PURE__ */ jsx("nav", { className: "pointer-events-none absolute right-4 top-1/2 z-50 -translate-y-1/2 flex flex-col items-center gap-2", children: [0, 1, 2].map((i) => {
        const dark = page === 1;
        const locked = i === 2 && !allDone;
        return /* @__PURE__ */ jsx("button", { onClick: () => goTo(i), disabled: locked, "aria-label": `Go to page ${i + 1}${locked ? " (locked)" : ""}`, className: `pointer-events-auto w-1.5 rounded-full transition-all duration-300 ${page === i ? "h-8" : "h-1.5"} ${dark ? page === i ? "bg-white" : "bg-white/30" : page === i ? "bg-black" : "bg-black/25"} ${locked ? "opacity-40" : ""}` }, i);
      }) })
    ] }),
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .fade-up { animation: fadeUp 0.7s ease-out both; }
        .fade-up-delay-1 { animation-delay: 0.08s; }
        .fade-up-delay-2 { animation-delay: 0.18s; }
        .fade-up-delay-4 { animation-delay: 0.5s; }
        .fade-in { animation: fadeIn 0.6s ease-out both; }
        .fade-up-delay-3 { animation-delay: 0.32s; }
      ` })
  ] });
}
function PageFade({
  show,
  children
}) {
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
  return /* @__PURE__ */ jsx("div", { className: `absolute inset-0 transition-opacity duration-500 ease-out ${show ? "opacity-100" : "pointer-events-none opacity-0"}`, children });
}
function PageOne({
  onNext
}) {
  return /* @__PURE__ */ jsxs("section", { className: "relative w-full h-full bg-white text-black flex flex-col", children: [
    /* @__PURE__ */ jsxs("header", { className: "w-full max-w-7xl mx-auto flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 pt-14", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-[0.22em]", children: "Hello Navy^^" }),
      /* @__PURE__ */ jsx("span", { className: "font-garamond text-base", children: "no. 001" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col justify-center w-full max-w-7xl mx-auto px-6 md:px-16 lg:px-24 xl:px-32", children: [
      /* @__PURE__ */ jsxs("p", { className: "font-garamond text-lg text-black/60 mb-6 fade-up", children: [
        "from ",
        /* @__PURE__ */ jsx("span", { className: "not-italic font-sans", children: "—" }),
        " md"
      ] }),
      /* @__PURE__ */ jsxs("h1", { className: "lg:hidden leading-[0.85] font-bold tracking-[-0.04em] fade-up fade-up-delay-1", style: {
        fontSize: "clamp(3.5rem, 12vw, 6rem)"
      }, children: [
        "There's",
        /* @__PURE__ */ jsx("br", {}),
        "something",
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("span", { className: "font-garamond font-light italic", children: "I've" }),
        /* @__PURE__ */ jsx("br", {}),
        "been",
        /* @__PURE__ */ jsx("br", {}),
        "meaning",
        /* @__PURE__ */ jsx("br", {}),
        "to ",
        /* @__PURE__ */ jsx("span", { className: "font-garamond font-light italic", children: "say" }),
        "."
      ] }),
      /* @__PURE__ */ jsxs("h1", { className: "hidden lg:block leading-[0.9] font-bold tracking-[-0.04em] fade-up fade-up-delay-1", style: {
        fontSize: "clamp(5rem, 7vw, 8rem)"
      }, children: [
        "There's something",
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("span", { className: "font-garamond font-light italic", children: "I've" }),
        " been",
        /* @__PURE__ */ jsx("br", {}),
        "meaning to ",
        /* @__PURE__ */ jsx("span", { className: "font-garamond font-light italic", children: "say" }),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("footer", { className: "w-full max-w-7xl mx-auto px-6 md:px-16 lg:px-24 xl:px-32 pb-12 flex items-end justify-between fade-up fade-up-delay-3", children: [
      /* @__PURE__ */ jsx("p", { className: "max-w-xs text-[13px] leading-snug text-black/60", children: "coba tebak apaaaa^^." }),
      /* @__PURE__ */ jsxs("button", { onClick: onNext, className: "font-garamond text-sm text-black/70 whitespace-nowrap underline underline-offset-4", children: [
        "begin ",
        /* @__PURE__ */ jsx("span", { className: "not-italic font-sans", children: "→" })
      ] })
    ] })
  ] });
}
function PageTwo({
  completed,
  markComplete,
  allDone,
  onNext,
  onBack
}) {
  const [playingId, setPlayingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
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
  const play = (t) => {
    stop();
    const audio = new Audio(t.audio);
    audio.volume = t.volume;
    if (["02", "03", "04", "05"].includes(t.id)) {
      const fadeDuration = 3;
      window.setTimeout(() => {
        const startVolume = t.volume;
        const start = Date.now();
        const fadeInterval = window.setInterval(() => {
          const elapsed = (Date.now() - start) / 1e3;
          const progress = Math.min(elapsed / fadeDuration, 1);
          audio.volume = startVolume * (1 - progress);
          if (progress >= 1) {
            clearInterval(fadeInterval);
          }
        }, 50);
      }, (t.seconds - fadeDuration) * 1e3);
    }
    audioRef.current = audio;
    setPlayingId(t.id);
    audio.play();
    audio.onended = () => {
      markComplete(t.id);
      stop();
    };
  };
  const onCardClick = (t) => {
    if (expandedId === t.id) {
      setExpandedId(null);
      stop();
      return;
    }
    setExpandedId(t.id);
    play(t);
  };
  const remaining = TRACKS.length - completed.size;
  return /* @__PURE__ */ jsxs("section", { className: "relative w-full h-full bg-[#0A0A0A] text-white flex flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between px-6 pt-14 pb-4", children: [
      /* @__PURE__ */ jsxs("button", { onClick: onBack, className: "flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/60", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "w-3 h-3", strokeWidth: 1.5 }),
        /* @__PURE__ */ jsx("span", { children: "Back" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-[0.22em] text-white/50", children: "Listened" }),
        /* @__PURE__ */ jsxs("p", { className: "font-garamond text-lg mt-0.5", children: [
          completed.size,
          /* @__PURE__ */ jsxs("span", { className: "not-italic font-sans text-white/40", children: [
            " / ",
            TRACKS.length
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 md:px-12 lg:px-20 pb-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-[0.22em] text-white/60", children: "coba tebak" }),
      /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-5xl font-bold tracking-tight mt-1", children: "aku mau apa" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto hide-scrollbar px-4 md:px-10 lg:px-20 pb-24 pt-3", children: [
      "        ",
      /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-3", children: TRACKS.map((t) => {
        const expanded = expandedId === t.id;
        const playing = playingId === t.id;
        const done = completed.has(t.id);
        return /* @__PURE__ */ jsx("div", { className: "w-full transition-all duration-300", children: /* @__PURE__ */ jsxs("button", { onClick: () => onCardClick(t), style: {
          backgroundColor: t.bg,
          color: t.fg
        }, className: `group relative w-full rounded-2xl p-5 text-left flex flex-col justify-between overflow-hidden active:scale-[0.99] transition-[height,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${expanded ? "h-[24rem]" : "h-28"}`, children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-[0.2em] opacity-70", children: t.id }),
            /* @__PURE__ */ jsx("span", { className: `h-6 w-6 rounded-full flex items-center justify-center text-[10px] ${playing ? "animate-pulse" : ""}`, style: {
              backgroundColor: t.fg,
              color: t.bg
            }, children: playing ? "‖" : done ? "✓" : "▶" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold leading-tight tracking-tight", children: t.title }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-[11px] opacity-70", children: [
              t.duration,
              done ? " · heard" : ""
            ] }),
            /* @__PURE__ */ jsx("div", { className: `grid transition-[grid-template-rows,opacity,margin] duration-500 ease-out ${expanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"}`, children: /* @__PURE__ */ jsxs("div", { className: "overflow-hidden", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[13px] leading-relaxed text-gray-400 max-w-[28rem]", children: t.note }),
              "                        ",
              /* @__PURE__ */ jsxs("div", { className: "mt-5 flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("span", { className: "h-9 w-9 rounded-full flex items-center justify-center text-xs", style: {
                  backgroundColor: t.fg,
                  color: t.bg
                }, children: playing ? "‖" : "▶" }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "h-[3px] w-full rounded-full overflow-hidden", style: {
                    backgroundColor: `${t.fg}33`
                  }, children: /* @__PURE__ */ jsx("div", { className: "h-full origin-left", style: {
                    backgroundColor: t.fg,
                    transform: done && !playing ? "scaleX(1)" : void 0,
                    animation: playing ? `grow ${t.seconds}s linear forwards` : void 0
                  } }, playing ? `p-${t.id}` : `s-${t.id}-${done}`) }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-1.5 flex justify-between text-[10px] opacity-60", children: [
                    /* @__PURE__ */ jsx("span", { children: playing ? "playing" : done ? "heard" : "tap to play" }),
                    /* @__PURE__ */ jsx("span", { children: t.duration })
                  ] })
                ] })
              ] })
            ] }) })
          ] }),
          playing && !expanded && /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 h-0.5 w-full origin-left", style: {
            backgroundColor: t.fg,
            animation: `grow ${t.seconds}s linear forwards`
          } })
        ] }) }, t.id);
      }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "absolute bottom-4 left-0 right-0 flex justify-center px-6", children: allDone ? /* @__PURE__ */ jsxs("button", { onClick: onNext, className: "font-garamond text-sm text-white/80 underline underline-offset-4", children: [
      "all heard ",
      /* @__PURE__ */ jsx("span", { className: "not-italic font-sans", children: "— continue " })
    ] }) : /* @__PURE__ */ jsxs("p", { className: "font-garamond text-sm text-white/60 text-center pointer-events-none", children: [
      remaining,
      " ",
      remaining === 1 ? "sound" : "sounds",
      " left before the last page"
    ] }) })
  ] });
}
function PageThreeLocked({
  completedCount,
  total,
  onBack
}) {
  const pct = Math.round(completedCount / total * 100);
  return /* @__PURE__ */ jsxs("section", { className: "relative w-full h-full bg-white text-black flex flex-col", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between px-6 pt-14", children: [
      /* @__PURE__ */ jsxs("button", { onClick: onBack, className: "flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-black/60", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "w-3 h-3", strokeWidth: 1.5 }),
        /* @__PURE__ */ jsx("span", { children: "Back" })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "font-garamond text-base", children: "not yet" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-24", children: [
      "        ",
      /* @__PURE__ */ jsx("p", { className: "font-garamond text-lg text-black/60 mb-6 fade-up", children: "a page kept closed" }),
      /* @__PURE__ */ jsxs("h2", { className: "text-[13vw] sm:text-[4rem] leading-[0.9] font-bold tracking-[-0.03em] fade-up fade-up-delay-1", children: [
        "Listen",
        /* @__PURE__ */ jsx("br", {}),
        "first,",
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("span", { className: "font-garamond font-normal", children: "then" }),
        /* @__PURE__ */ jsx("br", {}),
        "answer."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-12 max-w-sm fade-up fade-up-delay-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between text-[11px] uppercase tracking-[0.22em] text-black/50", children: [
          /* @__PURE__ */ jsx("span", { children: "Heard" }),
          /* @__PURE__ */ jsxs("span", { children: [
            completedCount,
            " / ",
            total
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 h-[2px] w-full bg-black/10 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-black transition-all duration-500", style: {
          width: `${pct}%`
        } }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("footer", { className: "px-6 pb-12 flex items-end justify-between text-[13px] text-black/50", children: /* @__PURE__ */ jsx("span", { children: "Locked" }) })
  ] });
}
function PageThree({
  onBack
}) {
  const [choice, setChoice] = useState(null);
  const messages = {
    yes: "Thank you. That makes me happier than I know how to say. I hope this is the beginning of something beautiful. ♡",
    no: "No hard feelings. Really. I’m just happy I got the chance to tell you what my heart had been holding onto."
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative h-full flex flex-col px-6 pt-14 pb-20", style: {
    paddingTop: "max(3.5rem, env(safe-area-inset-top))"
  }, children: [
    /* @__PURE__ */ jsxs("button", { onClick: onBack, className: "flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-neutral-500 fade-up self-start", children: [
      /* @__PURE__ */ jsx(ArrowLeft, { className: "w-3 h-3", strokeWidth: 1.5 }),
      /* @__PURE__ */ jsx("span", { children: "Back" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[10px] tracking-[0.25em] uppercase text-neutral-400 mb-8 fade-up fade-up-delay-1", children: "One last thing" }),
      /* @__PURE__ */ jsxs("h2", { className: "font-medium leading-[1.05] tracking-tight text-neutral-900 fade-up fade-up-delay-2", style: {
        fontSize: "clamp(2.25rem, 7vw, 5rem)"
      }, children: [
        "Do you want",
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("span", { className: "font-garamond italic font-normal", children: "us" }),
        " to be more",
        /* @__PURE__ */ jsx("br", {}),
        "than ",
        /* @__PURE__ */ jsx("span", { className: "font-garamond italic font-normal", children: "friends" }),
        "?"
      ] }),
      choice === null ? /* @__PURE__ */ jsxs("div", { className: "flex gap-12 mt-12 fade-up fade-up-delay-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => setChoice("yes"), className: "font-garamond italic text-3xl md:text-5xl text-neutral-900 transition-all hover:scale-110 active:scale-95", children: "yes" }),
        /* @__PURE__ */ jsx("span", { className: "font-garamond italic text-3xl md:text-5xl text-neutral-300", children: "/" }),
        /* @__PURE__ */ jsx("button", { onClick: () => setChoice("no"), className: "font-garamond italic text-3xl md:text-5xl text-neutral-900 transition-all hover:scale-110 active:scale-95", children: "no" })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "fade-in mt-12", children: [
        /* @__PURE__ */ jsx("p", { className: "font-garamond italic leading-relaxed text-neutral-700 max-w-[18rem] mx-auto", style: {
          fontSize: "clamp(0.95rem, 3.2vw, 1.25rem)"
        }, children: messages[choice] }),
        /* @__PURE__ */ jsx("button", { onClick: () => setChoice(null), className: "mt-10 text-[10px] tracking-[0.2em] uppercase text-neutral-400 underline underline-offset-4", children: "." })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-center text-[10px] tracking-[0.2em] uppercase text-neutral-400 fade-up fade-up-delay-4", children: /* @__PURE__ */ jsx("span", { children: "for neva — 2026" }) })
  ] });
}
export {
  Index as component
};
