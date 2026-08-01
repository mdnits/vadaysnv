import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "@tanstack/react-router";
const MEDIA = {
  // PHOTO — spread 3, full bleed, the sudden "loud" photo
  bigPhoto: "/photos/big.PNG",
  // PHOTO — spread 4, small, pushed off-axis
  tinyPhoto: "/photos/tiny.JPG",
  // PHOTO — spread 6, the collage base image, tags sit on top of it
  collagePhoto: "/photos/collage.JPG",
  // e.g. "/photos/collage.jpg"
  // VIDEO — spread 9, muted autoplay loop, short clip ideal (3–6s)
  video: "/videos/footage.mp4",
  // e.g. "/videos/footage.mp4"
  // PHOTO x3 — spread 10 gallery, deliberately mismatched sizes
  galleryPhoto1: "/photos/gallery-1.JPG",
  // e.g. "/photos/gallery-1.jpg"
  galleryPhoto2: "/photos/gallery-3.JPG",
  // e.g. "/photos/gallery-2.jpg"
  galleryPhoto3: "/photos/gallery-2.JPG",
  // e.g. "/photos/gallery-3.jpg"
  // AUDIO x3 — the audio-guide playlist, plays continuously once started,
  // keeps going while you move between every later spread
  track1: "/audio/track1.mp3",
  // e.g. "/audio/track-1.mp3"
  track2: "/audio/track2.mp3",
  // e.g. "/audio/track-2.mp3"
  voiceHer: "/audio/neva.m4a",
  // e.g. "/audio/her-voice.mp3"
  voiceMe: "audio/mada.m4a"
  // e.g. "/audio/my-voice.mp3"
};
const RED = "#A6331F";
const LIME = "#E8FF5A";
const BLUE = "#6C8EFF";
const SPREADS = ["cover", "audio", "sentence", "photo", "tiny", "collage", "note", "date", "video", "gallery", "voice", "letter", "back"];
function Index() {
  const [page, setPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.8);
  useEffect(() => {
    audioRefs.current.forEach((a) => {
      a.volume = volume;
    });
  }, [volume]);
  const audioRefs = useRef([]);
  const trackIndexRef = useRef(0);
  useEffect(() => {
    const srcs = [MEDIA.track1, MEDIA.track2].filter(Boolean);
    audioRefs.current = srcs.map((src) => {
      const a = new Audio(src);
      a.preload = "auto";
      return a;
    });
    audioRefs.current.forEach((a, i) => {
      a.addEventListener("ended", () => {
        trackIndexRef.current = (i + 1) % audioRefs.current.length;
        if (isPlaying) audioRefs.current[trackIndexRef.current]?.play();
      });
    });
    return () => {
      audioRefs.current.forEach((a) => a.pause());
    };
  }, []);
  const togglePlay = useCallback(() => {
    if (!audioRefs.current.length) return;
    setIsPlaying((prev) => {
      const next = !prev;
      if (next) audioRefs.current[trackIndexRef.current]?.play();
      else audioRefs.current[trackIndexRef.current]?.pause();
      return next;
    });
  }, []);
  const duckMusic = useCallback(() => {
    audioRefs.current.forEach((a) => {
      a.volume = volume * 0.15;
    });
  }, [volume]);
  const restoreMusic = useCallback(() => {
    audioRefs.current.forEach((a) => {
      a.volume = volume;
    });
  }, [volume]);
  const goTo = (i) => {
    if (i < 0 || i >= SPREADS.length) return;
    setPage(i);
  };
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
    wheelLock.current = now;
    if (e.deltaY > 0) goTo(page + 1);
    else goTo(page - 1);
  };
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(page + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goTo(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page]);
  const frameBg = SPREADS[page] === "video" || SPREADS[page] === "collage" ? "#0A0A0A" : "#FFFFFF";
  return /* @__PURE__ */ jsxs("main", { className: "fixed inset-0 overflow-hidden transition-colors duration-500", style: {
    backgroundColor: frameBg
  }, onTouchStart, onTouchEnd, onWheel, children: [
    /* @__PURE__ */ jsxs("div", { className: "relative mx-auto h-full w-full lg:max-w-[560px] overflow-hidden bg-inherit lg:shadow-2xl", children: [
      SPREADS.map((key, i) => /* @__PURE__ */ jsx(PageFade, { show: page === i, children: renderSpread(key, {
        isPlaying,
        togglePlay,
        hasTracks: audioRefs.current.length > 0,
        muted,
        toggleMute: () => setMuted((m) => !m),
        volume,
        setVolume,
        duckMusic,
        restoreMusic
      }) }, key)),
      page >= 2 && /* @__PURE__ */ jsx("button", { onClick: togglePlay, className: "fixed top-5 right-5 z-50 w-9 h-9 rounded-full border border-black/15 bg-white/90 backdrop-blur flex items-center justify-center text-[12px] text-black/70 font-helvetica", children: isPlaying ? "❙❙" : "▷" })
    ] }),
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.7s ease-out both; }
      ` })
  ] });
}
function PageFade({
  show,
  children
}) {
  const [mounted, setMounted] = useState(show);
  useEffect(() => {
    if (show) setMounted(true);
    else {
      const t = setTimeout(() => setMounted(false), 500);
      return () => clearTimeout(t);
    }
  }, [show]);
  if (!mounted && !show) return null;
  return /* @__PURE__ */ jsx("div", { className: `absolute inset-0 transition-opacity duration-500 ease-out ${show ? "opacity-100" : "pointer-events-none opacity-0"}`, children });
}
function renderSpread(key, audio) {
  switch (key) {
    case "cover":
      return /* @__PURE__ */ jsx(Cover, {});
    case "sentence":
      return /* @__PURE__ */ jsx(Sentence, {});
    case "photo":
      return /* @__PURE__ */ jsx(BigPhoto, {});
    case "tiny":
      return /* @__PURE__ */ jsx(TinyPhoto, {});
    case "audio":
      return /* @__PURE__ */ jsx(AudioGuide, { isPlaying: audio.isPlaying, onToggle: audio.togglePlay, hasTracks: audio.hasTracks, volume: audio.volume, onVolumeChange: audio.setVolume });
    case "collage":
      return /* @__PURE__ */ jsx(Collage, {});
    case "note":
      return /* @__PURE__ */ jsx(Note, {});
    case "date":
      return /* @__PURE__ */ jsx(DatePage, {});
    case "video":
      return /* @__PURE__ */ jsx(VideoSpread, { muted: audio.muted, onToggleMute: audio.toggleMute });
    case "gallery":
      return /* @__PURE__ */ jsx(Gallery, {});
    case "voice":
      return /* @__PURE__ */ jsx(Voice, { duckMusic: audio.duckMusic, restoreMusic: audio.restoreMusic });
    case "letter":
      return /* @__PURE__ */ jsx(Letter, {});
    case "back":
      return /* @__PURE__ */ jsx(Back, {});
    case "audio":
      return /* @__PURE__ */ jsx(AudioGuide, { isPlaying: audio.isPlaying, onToggle: audio.togglePlay, hasTracks: audio.hasTracks, volume: audio.volume, onVolumeChange: audio.setVolume });
  }
}
function Cover() {
  return /* @__PURE__ */ jsxs("section", { className: "relative w-full h-full bg-white text-black", children: [
    /* @__PURE__ */ jsx("h1", { className: "absolute top-[14%] left-[6%] font-helvetica font-medium leading-[0.95] fade-up text-[12vw] lg:text-[8vw] whitespace-nowrap", children: "HI NEVA!" }),
    /* @__PURE__ */ jsx("h1", { className: "absolute top-[42%] left-[6%] font-helvetica font-medium leading-[0.95] fade-up text-[12vw] lg:text-[8vw]", children: "YOU ARE" }),
    /* @__PURE__ */ jsx("h1", { className: "absolute top-[62%] left-[6%] font-garamond italic font-medium leading-[0.95] fade-up text-[12vw] lg:text-[8vw]", children: "noticed" }),
    /* @__PURE__ */ jsx("span", { className: "absolute bottom-[6%] right-[8%] text-[11px] tracking-[0.14em] text-black/60 font-helvetica", children: "2026" }),
    /* @__PURE__ */ jsxs("span", { className: "absolute bottom-[6%] left-[8%] flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-black/60 font-helvetica", children: [
      /* @__PURE__ */ jsx("span", { className: "inline-block w-1.5 h-1.5", style: {
        backgroundColor: RED
      } }),
      "Issue 002"
    ] })
  ] });
}
function Sentence() {
  return /* @__PURE__ */ jsx("section", { className: "relative w-full h-full bg-white text-black flex items-center justify-center px-[14%]", children: /* @__PURE__ */ jsxs("p", { className: "text-center text-lg md:text-2xl leading-relaxed font-helvetica", children: [
    "i still don't know",
    /* @__PURE__ */ jsx("br", {}),
    "if you realize",
    /* @__PURE__ */ jsx("br", {}),
    "how ",
    /* @__PURE__ */ jsx("span", { className: "font-garamond italic", children: "pretty" }),
    " you are."
  ] }) });
}
function BigPhoto() {
  return /* @__PURE__ */ jsx("section", { className: "relative w-full h-full bg-neutral-300 bg-cover bg-center", style: {
    backgroundImage: `url(${MEDIA.bigPhoto})`
  }, children: false });
}
function TinyPhoto() {
  return /* @__PURE__ */ jsxs("section", { className: "relative w-full h-full bg-white text-black", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute bottom-[18%] right-[10%] w-[34%] aspect-[4/5] bg-neutral-300 bg-cover bg-center shadow-lg", style: {
      backgroundImage: `url(${MEDIA.tinyPhoto})`
    }, children: false }),
    /* @__PURE__ */ jsxs("p", { className: "absolute bottom-[9%] right-[10%] w-[34%] text-[12px] text-black/60 font-helvetica", children: [
      "this one doesn't get enough ",
      /* @__PURE__ */ jsx("span", { className: "font-garamond italic", children: "appreciation" }),
      "."
    ] })
  ] });
}
function AudioGuide({
  isPlaying,
  onToggle,
  hasTracks,
  volume,
  onVolumeChange
}) {
  return /* @__PURE__ */ jsxs("section", { className: "relative w-full h-full bg-white text-black flex flex-col items-center justify-center gap-5 px-10", children: [
    /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-[0.18em] text-black/60 font-helvetica", children: "Before you continue," }),
    /* @__PURE__ */ jsx("span", { className: "w-14 h-px bg-black/15" }),
    /* @__PURE__ */ jsx("span", { className: "text-[11px] tracking-[0.1em] text-black/60 font-helvetica", children: "I'd love for you to hear it while you're reading." }),
    /* @__PURE__ */ jsxs("svg", { width: "120", height: "24", viewBox: "0 0 120 24", children: [
      /* @__PURE__ */ jsx("line", { x1: "0", y1: "12", x2: "120", y2: "12", stroke: "#D9D8D3", strokeWidth: "1" }),
      [10, 30, 50, 70, 90, 110].map((x, i) => /* @__PURE__ */ jsx("line", { x1: x, y1: 12 - (i % 2 === 0 ? 6 : 3), x2: x, y2: 12 + (i % 2 === 0 ? 6 : 3), stroke: isPlaying ? RED : "#121212", strokeWidth: "1.4" }, i))
    ] }),
    /* @__PURE__ */ jsx("button", { onClick: onToggle, disabled: !hasTracks, className: "text-[11px] uppercase tracking-[0.14em] px-6 py-2.5 border transition-colors disabled:opacity-40 font-helvetica", style: {
      color: isPlaying ? RED : "#4B4B48",
      borderColor: isPlaying ? RED : "#D9D8D3"
    }, children: isPlaying ? "❙❙  Playing" : "▷  Listen" }),
    /* @__PURE__ */ jsx("input", { type: "range", min: 0, max: 1, step: 0.01, value: volume, onChange: (e) => onVolumeChange(parseFloat(e.target.value)), className: "w-32 accent-[#A6331F] mt-2" }),
    /* @__PURE__ */ jsxs("p", { className: "text-[13px] text-black/60 mt-2 font-helvetica", children: [
      "for you, ",
      /* @__PURE__ */ jsx("span", { className: "font-garamond italic", children: "again" }),
      "."
    ] })
  ] });
}
function Collage() {
  const tags = [{
    word: "love",
    top: "10%",
    left: "8%",
    color: BLUE
  }, {
    word: "the",
    top: "6%",
    left: "62%",
    color: LIME
  }, {
    word: "way",
    top: "48%",
    left: "4%",
    color: RED
  }, {
    word: "you",
    top: "70%",
    left: "58%",
    color: BLUE
  }, {
    word: "laugh",
    top: "82%",
    left: "16%",
    color: LIME
  }];
  return /* @__PURE__ */ jsxs("section", { className: "relative w-full h-full bg-black", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-neutral-700 bg-cover bg-center opacity-90", style: {
      backgroundImage: `url(${MEDIA.collagePhoto})`
    }, children: false }),
    tags.map((t, i) => /* @__PURE__ */ jsx("div", { className: "absolute w-[74px] h-[74px] rounded-full flex items-center justify-center text-center text-[12px] font-semibold text-black shadow-lg font-helvetica", style: {
      top: t.top,
      left: t.left,
      backgroundColor: t.color
    }, children: t.word }, i))
  ] });
}
function Note() {
  return /* @__PURE__ */ jsx("section", { className: "relative w-full h-full bg-white text-black flex items-center px-[12%]", children: /* @__PURE__ */ jsxs("p", { className: "font-helvetica text-2xl md:text-4xl leading-snug translate-x-[6%]", children: [
    "you make ordinary days",
    /* @__PURE__ */ jsx("br", {}),
    "feel like they ",
    /* @__PURE__ */ jsx("span", { className: "font-garamond italic", children: "mattered" }),
    "."
  ] }) });
}
function DatePage() {
  return /* @__PURE__ */ jsx("section", { className: "relative w-full h-full bg-white text-black flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-[15px] tracking-[0.24em] font-helvetica", children: "27 . 06 . 2026" }) });
}
function VideoSpread({
  muted,
  onToggleMute
}) {
  return /* @__PURE__ */ jsxs("section", { className: "relative w-full h-full bg-black", children: [
    // eslint-disable-next-line jsx-a11y/media-has-caption
    /* @__PURE__ */ jsx("video", { src: MEDIA.video, muted, loop: true, autoPlay: true, playsInline: true, className: "absolute inset-0 w-full h-full object-cover object-center lg:object-[center_99%]" }),
    /* @__PURE__ */ jsx("button", { onClick: onToggleMute, className: "absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.1em] text-white/75 z-10 font-helvetica", children: muted ? "🔇 tap for sound" : "🔊 sound on" }),
    /* @__PURE__ */ jsx("span", { className: "absolute bottom-4 right-4 text-[10px] uppercase tracking-[0.14em] text-white/60 font-helvetica", children: "archive" })
  ] });
}
function Gallery() {
  return /* @__PURE__ */ jsxs("section", { className: "relative w-full h-full bg-white text-black", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute top-[4%] left-0 w-[46%] h-[34%] bg-neutral-300 bg-cover bg-center", style: {
      backgroundImage: `url(${MEDIA.galleryPhoto1})`
    }, children: false }),
    /* @__PURE__ */ jsx("div", { className: "absolute top-[10%] right-[6%] w-[16%] h-[16%] bg-neutral-300 bg-cover bg-center shadow-md", style: {
      backgroundImage: `url(${MEDIA.galleryPhoto2})`
    }, children: false }),
    /* @__PURE__ */ jsx("div", { className: "absolute top-[44%] left-[20%] w-[40%] h-[34%] bg-neutral-300 bg-cover bg-center shadow-md", style: {
      backgroundImage: `url(${MEDIA.galleryPhoto3})`
    }, children: false }),
    /* @__PURE__ */ jsxs("span", { className: "absolute top-[82%] left-[22%] text-[11px] text-black/60 pl-2 font-helvetica", style: {
      borderLeft: `2px solid ${RED}`
    }, children: [
      "my ",
      /* @__PURE__ */ jsx("span", { className: "font-garamond italic", children: "favorite" }),
      "."
    ] })
  ] });
}
function Voice({
  duckMusic,
  restoreMusic
}) {
  const [playingKey, setPlayingKey] = useState(null);
  const audioRef = useRef(null);
  const play = (key, src) => {
    if (!src) return;
    audioRef.current?.pause();
    if (playingKey === key) {
      setPlayingKey(null);
      restoreMusic();
      return;
    }
    const audio = new Audio(src);
    audioRef.current = audio;
    duckMusic();
    audio.play();
    setPlayingKey(key);
    audio.onended = () => {
      setPlayingKey(null);
      restoreMusic();
    };
  };
  return /* @__PURE__ */ jsxs("section", { className: "relative w-full h-full bg-white text-black flex flex-col items-center justify-center gap-8 px-10", children: [
    /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-[0.18em] text-black/60", children: "listen ^^" }),
    /* @__PURE__ */ jsx("button", { onClick: () => play("me", MEDIA.voiceMe), disabled: false, className: "text-[13px] tracking-[0.08em] px-6 py-3 border disabled:opacity-30", style: {
      borderColor: playingKey === "me" ? RED : "#D9D8D3",
      color: playingKey === "me" ? RED : "#4B4B48"
    }, children: playingKey === "me" ? "❙❙  ^^ " : "▷  ^^" }),
    /* @__PURE__ */ jsx("button", { onClick: () => play("her", MEDIA.voiceHer), disabled: false, className: "text-[13px] tracking-[0.08em] px-6 py-3 border disabled:opacity-30", style: {
      borderColor: playingKey === "her" ? RED : "#D9D8D3",
      color: playingKey === "her" ? RED : "#4B4B48"
    }, children: playingKey === "her" ? "❙❙  :0" : "▷  :0" })
  ] });
}
function Letter() {
  return /* @__PURE__ */ jsxs("section", { className: "relative w-full h-full bg-white text-black overflow-y-auto hide-scrollbar px-[12%] pt-[12%] pb-[8%]", children: [
    /* @__PURE__ */ jsx("p", { className: "font-garamond italic text-base text-black/60", children: "Dear" }),
    /* @__PURE__ */ jsx("p", { className: "font-garamond italic font-medium text-[13vw] md:text-6xl leading-[1.05] mb-7", children: "Neva," }),
    /* @__PURE__ */ jsxs("div", { className: "font-helvetica text-[17px] leading-[1.8] max-w-[520px] space-y-5", children: [
      /* @__PURE__ */ jsx("p", { children: "I don't really know how to start this, so I'll just start." }),
      /* @__PURE__ */ jsxs("p", { children: [
        "Most of this exists because I couldn't stop ",
        /* @__PURE__ */ jsx("em", { className: "italic font-garamond", children: "noticing" }),
        " you. The way you laugh, your playlists, the random pictures you sent. Little things I don't think you even notice about yourself."
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        "One morning, after we fell asleep on the phone, you woke me up by ",
        /* @__PURE__ */ jsx("span", { className: "font-garamond italic", children: "softly" }),
        " saying my name. I don't think you ",
        /* @__PURE__ */ jsx("span", { className: "font-garamond italic", children: "realized" }),
        " it, but it was the gentlest sound I'd ever woken up to. I remember opening my eyes with the biggest smile on my face. I actually ",
        /* @__PURE__ */ jsx("span", { className: "font-garamond italic", children: "smiling" }),
        " and kicking my feet like an idiot.^^"
      ] }),
      "        ",
      /* @__PURE__ */ jsxs("p", { children: [
        "I don't think I say this enough, so I'm saying it here instead: you make ordinary days feel like they ",
        /* @__PURE__ */ jsx("em", { className: "italic font-garamond", children: "mattered" }),
        "."
      ] }),
      /* @__PURE__ */ jsx("p", { children: "I hope this made you feel even a little of what I feel. ^^" }),
      /* @__PURE__ */ jsxs("p", { className: "text-right", children: [
        "— md, who's ",
        /* @__PURE__ */ jsx("span", { className: "font-garamond italic", children: "still" }),
        "  noticing."
      ] })
    ] })
  ] });
}
function Back() {
  return /* @__PURE__ */ jsxs("section", { className: "relative w-full h-full bg-white text-black flex flex-col justify-center px-[6%] gap-1", children: [
    /* @__PURE__ */ jsx("h1", { className: "font-helvetica font-medium leading-[0.95] fade-up text-[12vw] lg:text-[8vw]", children: "Happy" }),
    /* @__PURE__ */ jsx("h1", { className: "font-helvetica font-medium leading-[0.95] fade-up text-[12vw] lg:text-[8vw]", children: "Girlfriend's day ^^" }),
    /* @__PURE__ */ jsxs("h1", { className: "font-helvetica font-medium leading-[0.95] fade-up text-[12vw] lg:text-[8vw]", children: [
      "I ",
      /* @__PURE__ */ jsx("span", { className: "font-garamond italic", children: "love" }),
      " you."
    ] }),
    /* @__PURE__ */ jsx(Link, { to: "/", className: "mt-6 text-[11px] uppercase tracking-[0.14em] text-black/50 underline underline-offset-4", children: "back to home" }),
    /* @__PURE__ */ jsx("span", { className: "absolute bottom-[6%] right-[8%] text-[11px] tracking-[0.14em] text-black/60 font-helvetica", children: "♡" }),
    /* @__PURE__ */ jsxs("span", { className: "absolute bottom-[6%] left-[8%] flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-black/60 font-helvetica", children: [
      /* @__PURE__ */ jsx("span", { className: "inline-block w-1.5 h-1.5", style: {
        backgroundColor: RED
      } }),
      "end of issue"
    ] })
  ] });
}
export {
  Index as component
};
