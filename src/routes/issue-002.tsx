import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
export const Route = createFileRoute("/issue-002")({
  head: () => ({
    meta: [
      { title: "002 — happy girlfriend's day" },
      {
        name: "description",
        content: " Everything I noticed.",
      },
      { property: "og:title", content: "Everything I Noticed" },
      { property: "og:description", content: "happy gf day, Neva." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/* ================================================================
   MEDIA — every photo, video, and audio slot for the whole issue.
   Paste your real paths in below. Anything left as '' shows a
   dashed placeholder box on-screen so it's obvious what's missing.
================================================================= */
const MEDIA = {
  // PHOTO — spread 3, full bleed, the sudden "loud" photo
  bigPhoto: "/photos/big.PNG",

  // PHOTO — spread 4, small, pushed off-axis
  tinyPhoto: "/photos/tiny.JPG",

  // PHOTO — spread 6, the collage base image, tags sit on top of it
  collagePhoto: "/photos/collage.JPG", // e.g. "/photos/collage.jpg"

  // VIDEO — spread 9, muted autoplay loop, short clip ideal (3–6s)
  video: "/videos/footage.mp4", // e.g. "/videos/footage.mp4"

  // PHOTO x3 — spread 10 gallery, deliberately mismatched sizes
  galleryPhoto1: "/photos/gallery-1.JPG", // e.g. "/photos/gallery-1.jpg"
  galleryPhoto2: "/photos/gallery-3.JPG", // e.g. "/photos/gallery-2.jpg"
  galleryPhoto3: "/photos/gallery-2.JPG", // e.g. "/photos/gallery-3.jpg"

  // AUDIO x3 — the audio-guide playlist, plays continuously once started,
  // keeps going while you move between every later spread
  track1: "/audio/track1.mp3", // e.g. "/audio/track-1.mp3"
  track2: "/audio/track2.mp3", // e.g. "/audio/track-2.mp3"
};

// accent palette — red is the primary tag color throughout;
// lime/blue only appear on the collage spread (spread 6),
// pulled from the same family as issue 001's track cards
const RED = "#A6331F";
const LIME = "#E8FF5A"; // same lime already used in issue 001
const BLUE = "#6C8EFF"; // a slightly more saturated cousin of issue 001's #B9C7FF

type SpreadKey =
  | "cover"
  | "sentence"
  | "photo"
  | "tiny"
  | "audio"
  | "collage"
  | "note"
  | "date"
  | "video"
  | "gallery"
  | "letter"
  | "back";

const SPREADS: SpreadKey[] = [
  "cover",
  "audio",
  "sentence",
  "photo",
  "tiny",
  "collage",
  "note",
  "date",
  "video",
  "gallery",
  "letter",
  "back",
];

/* ================================================================
   MAIN COMPONENT
================================================================= */
function Index() {
  const [page, setPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.8);

useEffect(() => {
  audioRefs.current.forEach((a) => { a.volume = volume; });
}, [volume]);

  const audioRefs = useRef<HTMLAudioElement[]>([]);
  const trackIndexRef = useRef(0);

  useEffect(() => {
    const srcs = [MEDIA.track1, MEDIA.track2,].filter(Boolean);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const goTo = (i: number) => {
    if (i < 0 || i >= SPREADS.length) return;
    setPage(i);
  };

  // swipe (vertical) — same technique as issue-001
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
    const el = e.target as HTMLElement | null;
    const scroller = el?.closest<HTMLElement>(".hide-scrollbar");
    if (scroller) {
      const atTop = scroller.scrollTop <= 0;
      const atBottom =
        scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
      if (dy < 0 && !atBottom) return;
      if (dy > 0 && !atTop) return;
    }
    if (dy < 0) goTo(page + 1);
    else goTo(page - 1);
  };

  // wheel (desktop) — same technique as issue-001
  const wheelLock = useRef(0);
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < 30) return;
    const now = Date.now();
    if (now - wheelLock.current < 700) return;
    wheelLock.current = now;
    if (e.deltaY > 0) goTo(page + 1);
    else goTo(page - 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(page + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goTo(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const frameBg = SPREADS[page] === "video" || SPREADS[page] === "collage" ? "#0A0A0A" : "#FFFFFF";

  return (
    <main
      className="fixed inset-0 overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: frameBg }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
    >
     <div className="relative mx-auto h-full w-full lg:max-w-[560px] overflow-hidden bg-inherit lg:shadow-2xl">
        {SPREADS.map((key, i) => (
          <PageFade key={key} show={page === i}>
            {renderSpread(key, {
              isPlaying,
              togglePlay,
              hasTracks: audioRefs.current.length > 0,
              muted,
              toggleMute: () => setMuted((m) => !m),
            volume,
  setVolume,
            })}
          </PageFade>
        ))}
        {page >= 2 && (
  <button
    onClick={togglePlay}
    className="fixed top-5 right-5 z-50 w-9 h-9 rounded-full border border-black/15 bg-white/90 backdrop-blur flex items-center justify-center text-[12px] text-black/70 font-helvetica"
  >
    {isPlaying ? "❙❙" : "▷"}
  </button>
)}
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.7s ease-out both; }
      `}</style>
    </main>
  );
}

/* same crossfade wrapper pattern used across the site */
function PageFade({ show, children }: { show: boolean; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(show);
  useEffect(() => {
    if (show) setMounted(true);
    else {
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

/* ================================================================
   SPREAD RENDERER
================================================================= */
function renderSpread(
  key: SpreadKey,
  audio: { isPlaying: boolean; togglePlay: () => void; hasTracks: boolean; muted: boolean; toggleMute: () => void; volume: number; setVolume: (v: number) => void }
) {
  switch (key) {
    case "cover":
      return <Cover />;
    case "sentence":
      return <Sentence />;
    case "photo":
      return <BigPhoto />;
    case "tiny":
      return <TinyPhoto />;
    case "audio":
  return <AudioGuide isPlaying={audio.isPlaying} onToggle={audio.togglePlay} hasTracks={audio.hasTracks} volume={audio.volume} onVolumeChange={audio.setVolume} />;
    case "collage":
      return <Collage />;
    case "note":
      return <Note />;
    case "date":
      return <DatePage />;
    case "video":
      return <VideoSpread muted={audio.muted} onToggleMute={audio.toggleMute} />;
    case "gallery":
      return <Gallery />;
    case "letter":
      return <Letter />;
    case "back":
      return <Back />;
      case "audio":
  return <AudioGuide isPlaying={audio.isPlaying} onToggle={audio.togglePlay} hasTracks={audio.hasTracks} volume={audio.volume} onVolumeChange={audio.setVolume} />;
  }
}

function Placeholder({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center text-center px-6 text-[11px] tracking-[0.06em] border border-dashed font-helvetica ${
        dark ? "text-white/50 border-white/25" : "text-black/40 border-black/15"
      }`}
    >
      {label}
    </div>
  );
}

/* ---------------------------- 1 — COVER ---------------------------- */
function Cover() {
  return (
    <section className="relative w-full h-full bg-white text-black">
    <h1 className="absolute top-[14%] left-[6%] font-helvetica font-medium leading-[0.95] fade-up text-[12vw] lg:text-[8vw] whitespace-nowrap">
  HI NEVA!
</h1>
<h1 className="absolute top-[42%] left-[6%] font-helvetica font-medium leading-[0.95] fade-up text-[12vw] lg:text-[8vw]">
  YOU ARE
</h1>
<h1 className="absolute top-[62%] left-[6%] font-garamond italic font-medium leading-[0.95] fade-up text-[12vw] lg:text-[8vw]">
  noticed
</h1>
      <span className="absolute bottom-[6%] right-[8%] text-[11px] tracking-[0.14em] text-black/60 font-helvetica">
        2026
      </span>
      <span className="absolute bottom-[6%] left-[8%] flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-black/60 font-helvetica">
        <span className="inline-block w-1.5 h-1.5" style={{ backgroundColor: RED }} />
        Issue 002
      </span>
    </section>
  );
}

/* ---------------------------- 2 — SENTENCE ---------------------------- */
function Sentence() {
  return (
    <section className="relative w-full h-full bg-white text-black flex items-center justify-center px-[14%]">
      <p className="text-center text-lg md:text-2xl leading-relaxed font-helvetica">
        i still don't know
        <br />
        if you realize
        <br />
        how <span className="font-garamond italic">pretty</span> you are.
      </p>
    </section>
  );
}

/* ---------------------------- 3 — PHOTO ---------------------------- */
function BigPhoto() {
  return (
    <section
      className="relative w-full h-full bg-neutral-300 bg-cover bg-center"
      style={MEDIA.bigPhoto ? { backgroundImage: `url(${MEDIA.bigPhoto})` } : undefined}
    >
      {!MEDIA.bigPhoto && <Placeholder label={"paste photo path in MEDIA.bigPhoto"} />}
    </section>
  );
}

/* ---------------------------- 4 — TINY ---------------------------- */
function TinyPhoto() {
  return (
    <section className="relative w-full h-full bg-white text-black">
      <div
        className="absolute bottom-[18%] right-[10%] w-[34%] aspect-[4/5] bg-neutral-300 bg-cover bg-center shadow-lg"
        style={MEDIA.tinyPhoto ? { backgroundImage: `url(${MEDIA.tinyPhoto})` } : undefined}
      >
        {!MEDIA.tinyPhoto && <Placeholder label="MEDIA.tinyPhoto" />}
      </div>
      <p className="absolute bottom-[9%] right-[10%] w-[34%] text-[12px] text-black/60 font-helvetica">
        this one doesn't get enough <span className="font-garamond italic">appreciation</span>.
      </p>
    </section>
  );
}

/* ---------------------------- 5 — AUDIO GUIDE ---------------------------- */
function AudioGuide({
  isPlaying,
  onToggle,
  hasTracks,
  volume,
  onVolumeChange,
}: {
  isPlaying: boolean;
  onToggle: () => void;
  hasTracks: boolean;
  volume: number;
  onVolumeChange: (v: number) => void;
}) {
  return (
    <section className="relative w-full h-full bg-white text-black flex flex-col items-center justify-center gap-5 px-10">
      <span className="text-[11px] uppercase tracking-[0.18em] text-black/60 font-helvetica">Before you continue,
</span>
      <span className="w-14 h-px bg-black/15" />
      <span className="text-[11px] tracking-[0.1em] text-black/60 font-helvetica">I'd love for you to hear it
while you're reading.</span>
      <svg width="120" height="24" viewBox="0 0 120 24">
        <line x1="0" y1="12" x2="120" y2="12" stroke="#D9D8D3" strokeWidth="1" />
        {[10, 30, 50, 70, 90, 110].map((x, i) => (
          <line
            key={i}
            x1={x}
            y1={12 - (i % 2 === 0 ? 6 : 3)}
            x2={x}
            y2={12 + (i % 2 === 0 ? 6 : 3)}
            stroke={isPlaying ? RED : "#121212"}
            strokeWidth="1.4"
          />
        ))}
      </svg>
      <button
        onClick={onToggle}
        disabled={!hasTracks}
        className="text-[11px] uppercase tracking-[0.14em] px-6 py-2.5 border transition-colors disabled:opacity-40 font-helvetica"
        style={{
          color: isPlaying ? RED : "#4B4B48",
          borderColor: isPlaying ? RED : "#D9D8D3",
        }}
      >
        {isPlaying ? "❙❙  Playing" : "▷  Listen"}
      </button>
      <input
  type="range"
  min={0}
  max={1}
  step={0.01}
  value={volume}
  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
  className="w-32 accent-[#A6331F] mt-2"
/>
       <p className="text-[13px] text-black/60 mt-2 font-helvetica">
        for you, <span className="font-garamond italic">again</span>.
      </p>
    </section>
  );
}

/* ---------------------------- 6 — COLLAGE ---------------------------- */
function Collage() {
  const tags: { word: string; top: string; left: string; color: string }[] = [
    { word: "the", top: "10%", left: "8%", color: BLUE },
    { word: "way", top: "6%", left: "62%", color: LIME },
    { word: "you", top: "48%", left: "4%", color: RED },
    { word: "laugh", top: "70%", left: "58%", color: BLUE },
    { word: "playlists", top: "82%", left: "16%", color: LIME },
  ];
  return (
    <section className="relative w-full h-full bg-black">
      <div
        className="absolute inset-0 bg-neutral-700 bg-cover bg-center opacity-90"
        style={MEDIA.collagePhoto ? { backgroundImage: `url(${MEDIA.collagePhoto})` } : undefined}
      >
        {!MEDIA.collagePhoto && <Placeholder label={"paste photo path in MEDIA.collagePhoto"} dark />}
      </div>
      {tags.map((t, i) => (
        <div
          key={i}
          className="absolute w-[74px] h-[74px] rounded-full flex items-center justify-center text-center text-[12px] font-semibold text-black shadow-lg font-helvetica"
          style={{ top: t.top, left: t.left, backgroundColor: t.color }}
        >
          {t.word}
        </div>
      ))}
    </section>
  );
}

/* ---------------------------- 7 — NOTE ---------------------------- */
function Note() {
  return (
    <section className="relative w-full h-full bg-white text-black flex items-center px-[12%]">
      <p className="font-helvetica text-2xl md:text-4xl leading-snug translate-x-[6%]">
        you make ordinary days
        <br />
        feel like they <span className="font-garamond italic">mattered</span>.
      </p>
    </section>
  );
}

/* ---------------------------- 8 — DATE ---------------------------- */
function DatePage() {
  return (
    <section className="relative w-full h-full bg-white text-black flex items-center justify-center">
      <span className="text-[15px] tracking-[0.24em] font-helvetica">27 . 06 . 2026</span>
    </section>
  );
}

/* ---------------------------- 9 — VIDEO ---------------------------- */
function VideoSpread({ muted, onToggleMute }: { muted: boolean; onToggleMute: () => void }) {
  return (
    <section className="relative w-full h-full bg-black">
      {MEDIA.video ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          src={MEDIA.video}
          muted={muted}
          loop
          autoPlay
          playsInline
className="absolute inset-0 w-full h-full object-cover object-center lg:object-[center_99%]"        />
      ) : (
        <Placeholder label={"paste video path in MEDIA.video"} dark />
      )}
      <button
        onClick={onToggleMute}
        className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.1em] text-white/75 z-10 font-helvetica"
      >
        {muted ? "🔇 tap for sound" : "🔊 sound on"}
      </button>
      <span className="absolute bottom-4 right-4 text-[10px] uppercase tracking-[0.14em] text-white/60 font-helvetica">
        archive
      </span>
    </section>
  );
}

/* ---------------------------- 10 — GALLERY ---------------------------- */
function Gallery() {
  return (
    <section className="relative w-full h-full bg-white text-black">
      <div
        className="absolute top-[4%] left-0 w-[46%] h-[34%] bg-neutral-300 bg-cover bg-center"
        style={MEDIA.galleryPhoto1 ? { backgroundImage: `url(${MEDIA.galleryPhoto1})` } : undefined}
      >
        {!MEDIA.galleryPhoto1 && <Placeholder label="MEDIA.galleryPhoto1" />}
      </div>
      <div
        className="absolute top-[10%] right-[6%] w-[16%] h-[16%] bg-neutral-300 bg-cover bg-center shadow-md"
        style={MEDIA.galleryPhoto2 ? { backgroundImage: `url(${MEDIA.galleryPhoto2})` } : undefined}
      >
        {!MEDIA.galleryPhoto2 && <Placeholder label="2" />}
      </div>
      <div
        className="absolute top-[44%] left-[20%] w-[40%] h-[34%] bg-neutral-300 bg-cover bg-center shadow-md"
        style={MEDIA.galleryPhoto3 ? { backgroundImage: `url(${MEDIA.galleryPhoto3})` } : undefined}
      >
        {!MEDIA.galleryPhoto3 && <Placeholder label="MEDIA.galleryPhoto3" />}
      </div>
      <span
        className="absolute top-[82%] left-[22%] text-[11px] text-black/60 pl-2 font-helvetica"
        style={{ borderLeft: `2px solid ${RED}` }}
      >
        my <span className="font-garamond italic">favorite</span>.
      </span>
    </section>
  );
}

/* ---------------------------- 11 — LETTER ---------------------------- */
function Letter() {
  return (
    <section className="relative w-full h-full bg-white text-black overflow-y-auto hide-scrollbar px-[12%] pt-[12%] pb-[8%]">
      <p className="font-garamond italic text-base text-black/60">Dear</p>
      <p className="font-garamond italic font-medium text-[13vw] md:text-6xl leading-[1.05] mb-7">Neva,</p>
      <div className="font-helvetica text-[17px] leading-[1.8] max-w-[520px] space-y-5">
        <p>I don't really know how to start this, so I'll just start.</p>
        <p>
          Most of this exists because I couldn't stop <em className="italic font-garamond">noticing</em> you. The way you laugh, your playlists, the random pictures you sent. Little things I don't think you even notice about yourself.
        </p>
<p>One morning, after we fell asleep on the phone, you woke me up by <span className="font-garamond italic">softly</span> saying my name. I don't think you <span className="font-garamond italic">realized</span> it, but it was the gentlest sound I'd ever woken up to. I remember opening my eyes with the biggest smile on my face. I actually <span className="font-garamond italic">smiling</span> and kicking my feet like an idiot.^^</p>        <p>
          I don't think I say this enough, so I'm saying it here instead: you make ordinary days feel like
          they <em className="italic font-garamond">mattered</em>.
        </p>
        <p>I hope this made you feel even a little of what I feel. ^^</p>
        <p className="text-right">— md, who's <span className="font-garamond italic">still</span>  noticing.</p>
      </div>
    </section>
  );
}

//* ---------------------------- 12 — BACK ---------------------------- */
function Back() {
  return (
    <section className="relative w-full h-full bg-white text-black flex flex-col justify-center px-[6%] gap-1">
      <h1 className="font-helvetica font-medium leading-[0.95] fade-up text-[12vw] lg:text-[8vw]">
        Happy
      </h1>
      <h1 className="font-helvetica font-medium leading-[0.95] fade-up text-[12vw] lg:text-[8vw]">
        Girlfriend's day ^^
      </h1>
      <h1 className="font-helvetica font-medium leading-[0.95] fade-up text-[12vw] lg:text-[8vw]">
        I <span className="font-garamond italic">love</span> you.
      </h1>

      <Link
        to="/"
        className="mt-6 text-[11px] uppercase tracking-[0.14em] text-black/50 underline underline-offset-4"
      >
        back to home
      </Link>

      <span className="absolute bottom-[6%] right-[8%] text-[11px] tracking-[0.14em] text-black/60 font-helvetica">
        ♡
      </span>
      <span className="absolute bottom-[6%] left-[8%] flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-black/60 font-helvetica">
        <span className="inline-block w-1.5 h-1.5" style={{ backgroundColor: RED }} />
        end of issue
      </span>
    </section>
  );
}