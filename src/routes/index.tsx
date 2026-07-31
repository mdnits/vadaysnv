import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "md & nv archives" },
      { name: "description", content: "karena kita berdua pelupa jadi aku bikin ini biar selalu inget^^." },
    ],
  }),
  component: IssueZeroLanding,
});

type LabelDef = { text: string; path?: string };

// Cuma yang punya `path` yang beneran mindah halaman (Issue 001).
// Sisanya placeholder -- gampang disambungin ke halaman baru nanti.
const LABELS: LabelDef[] = [
  { text: "001", path: "/issue-001" },
  { text: "002", path: "/issue-002" },
  { text: "003 (soon)" },
];

const RADIUS = 220;
const PARTICLE_COUNT = 2000;

// sebaran acak MENGISI VOLUME bola (bukan cuma kulit terluar) -> gerombolan
// padat 3D beneran, ada yang deket ada yang jauh dari pusat.
function fillSphereVolume(count: number, radius: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1;
    const theta = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const r = radius * Math.cbrt(Math.random());
    positions[i * 3] = s * Math.cos(theta) * r;
    positions[i * 3 + 1] = u * r;
    positions[i * 3 + 2] = s * Math.sin(theta) * r;
  }
  return positions;
}

// label disebar rapi di permukaan bola (fibonacci sphere) biar gampang keliatan
function labelPosition(i: number, total: number, radius: number) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (i / Math.max(total - 1, 1)) * 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = golden * i;
  return new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius);
}

// tekstur bulat lembut buat titik partikel, biar bulet bukan kotak
function makeCircleTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grd = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.8, "rgba(255,255,255,1)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  return new THREE.CanvasTexture(canvas);
}

function ParticleField({ count, radius }: { count: number; radius: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const basePositions = useMemo(() => fillSphereVolume(count, radius), [count, radius]);
  const livePositions = useMemo(() => basePositions.slice(), [basePositions]);
  const texture = useMemo(() => makeCircleTexture(), []);

  // gerombolan tetap "hidup" -- gerak halus sendiri, TAPI sama sekali
  // ga bereaksi ke cursor/mouse (sesuai spec).
  useFrame((state) => {
    const attr = pointsRef.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    if (!attr) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      livePositions[idx] = basePositions[idx] + Math.sin(t * 0.6 + i) * 1.4;
      livePositions[idx + 1] = basePositions[idx + 1] + Math.cos(t * 0.5 + i * 1.3) * 1.4;
      livePositions[idx + 2] = basePositions[idx + 2] + Math.sin(t * 0.7 + i * 0.7) * 1.4;
    }
    attr.array = livePositions;
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
  <bufferAttribute attach="attributes-position" args={[basePositions, 3]} />
</bufferGeometry>
      <pointsMaterial
        size={20}
        map={texture}
        color="#88c0ee"
        transparent
        alphaTest={0.35}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function LabelMarker({
  position,
  text,
  path,
  onNavigate,
}: {
  position: THREE.Vector3;
  text: string;
  path?: string;
  onNavigate: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // label "ketutup" gerombolan pas ada di sisi jauh dari kamera, dan
  // "kelihatan" pas sisi deket -- ini yang bikin efek parallax pas diputer.
  useFrame(({ camera }) => {
    if (!ref.current) return;
    const toLabel = position.clone().normalize();
    const toCamera = camera.position.clone().normalize();
    const facing = toLabel.dot(toCamera);
    const visibility = THREE.MathUtils.clamp((facing + 0.25) / 0.55, 0, 1);
    const finalOpacity = visibility * (path ? 1 : 0.55);
    ref.current.style.opacity = String(finalOpacity);
    ref.current.style.pointerEvents = finalOpacity > 0.2 ? "auto" : "none";
  });

  return (
    <Html position={position} center zIndexRange={[10, 0]}>
      <div
        ref={ref}
        onClick={onNavigate}
        className="transition-transform duration-150 hover:scale-105 active:scale-95"
        style={{
          background: "#111111",
          color: "#ffffff",
          fontSize: "12px",
          letterSpacing: "0.03em",
          padding: "8px 16px",
          borderRadius: "999px",
          cursor: path ? "pointer" : "default",
          whiteSpace: "nowrap",
          userSelect: "none",
        }}
      >
        {text}
      </div>
    </Html>
  );
}

function IssueZeroLanding() {
  const navigate = useNavigate();
  const [heroVisible, setHeroVisible] = useState(true);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStart = () => {
    setHeroVisible(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
  };
  const handleEnd = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setHeroVisible(true), 2600);
  };

  useEffect(() => {
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  return (
    <main className="fixed inset-0 overflow-hidden bg-white">
      <div className="absolute top-6 left-6 z-10 text-[12px] tracking-[0.12em] uppercase text-black/50 pointer-events-none">
         000 — archives
      </div>

      <div
  className="fixed inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none z-50 text-center transition-opacity duration-700"
  style={{ opacity: heroVisible ? 1 : 0, filter: "blur(2.5px)" }}
>
        <h1 className="text-black font-semibold tracking-tight" style={{ fontSize: "clamp(30px, 6vw, 52px)" }}>
          
        </h1>
      </div>

      <Canvas
        camera={{ position: [0, 0, RADIUS * 2.6], fov: 50 }}
        style={{ position: "absolute", inset: 0, touchAction: "none" }}
      >
        <ParticleField count={PARTICLE_COUNT} radius={RADIUS} />
        {LABELS.map((l, i) => (
          <LabelMarker
            key={l.text}
            position={labelPosition(i, LABELS.length, RADIUS * 0.68)}
            text={l.text}
            path={l.path}
            onNavigate={() => l.path && navigate({ to: l.path })}
          />
        ))}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.6}
          autoRotate
          autoRotateSpeed={0.5}
          onStart={handleStart}
          onEnd={handleEnd}
        />
      </Canvas>
    </main>
  );
}
