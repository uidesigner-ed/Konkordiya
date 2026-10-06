"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";

/**
 * «З хаосу в порядок»: поле цифр, що злітаються з безладу в ідеальну таблицю.
 * Курсор (або «зонд» на тач-пристроях) розворушує цифри — вони рахують і повертаються на місце.
 * Один draw call (instanced quads + атлас гліфів), рендер ставиться на паузу поза екраном.
 */

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uCell;
  uniform float uRadius;
  uniform float uStrength;
  uniform vec2 uMouse;
  uniform vec2 uSize;
  uniform float uFocusX;

  attribute vec2 aGrid;
  attribute float aSeed;
  attribute float aDigit;

  varying vec2 vUv;
  varying float vDigit;
  varying float vHeat;
  varying float vAlpha;
  varying float vAccent;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

  void main() {
    vec2 grid = aGrid;
    vec2 chaos = grid + (vec2(hash(aSeed * 1.71), hash(aSeed * 3.13)) - 0.5) * uSize * vec2(1.1, 1.3);

    // кожна клітинка «приземляється» у свій момент
    float p = clamp(uProgress * 1.7 - hash(aSeed * 5.37) * 0.7, 0.0, 1.0);
    p = 1.0 - pow(1.0 - p, 4.0);
    vec2 pos = mix(chaos, grid, p);
    float angle = mix((hash(aSeed * 7.91) - 0.5) * 6.2831, 0.0, p);

    // ледь помітне дихання таблиці
    pos.y += sin(uTime * 0.7 + grid.x * 0.006 + grid.y * 0.004) * 2.0 * p;

    // курсор: відштовхування + підрахунок
    vec2 d = pos - uMouse;
    float dist = length(d);
    float heat = smoothstep(uRadius, 0.0, dist) * uStrength * p;
    pos += normalize(d + 0.0001) * heat * uCell * 1.35;
    angle += heat * (hash(aSeed * 2.3) - 0.5) * 1.6;

    float scale = uCell * (0.56 + heat * 0.42);
    vec2 v = rot(angle) * (position.xy * scale);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos + v, 0.0, 1.0);

    vUv = uv;
    vHeat = heat;
    float tick = floor(uTime * 9.0 + aSeed * 31.0);
    vDigit = heat > 0.06 ? mod(aDigit + tick, 10.0) : aDigit;

    // тихіше зліва (там текст), щільніше праворуч; згасання по краях
    float nx = (grid.x / uSize.x) + 0.5;
    float ny = (grid.y / uSize.y) + 0.5;
    float side = smoothstep(uFocusX - 0.35, uFocusX + 0.25, nx);
    float edge = smoothstep(0.0, 0.12, ny) * smoothstep(1.0, 0.85, ny) * smoothstep(0.0, 0.04, nx) * smoothstep(1.0, 0.96, nx);
    vAlpha = mix(0.028, 0.19, side) * edge * mix(0.35, 1.0, p);
    vAccent = step(0.985, hash(aSeed * 9.17));
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uAtlas;
  uniform vec3 uInk;
  uniform vec3 uGreen;
  uniform vec3 uRed;
  varying vec2 vUv;
  varying float vDigit;
  varying float vHeat;
  varying float vAlpha;
  varying float vAccent;

  void main() {
    vec2 uv = vec2((vUv.x + vDigit) / 10.0, vUv.y);
    float glyph = texture2D(uAtlas, uv).a;
    vec3 col = mix(uInk, uGreen, max(smoothstep(0.0, 0.45, vHeat), vAccent));
    col = mix(col, uRed, smoothstep(0.55, 0.95, vHeat));
    float a = glyph * (vAlpha + vHeat * 0.75 + vAccent * 0.25);
    if (a < 0.01) discard;
    gl_FragColor = vec4(col, a);
  }
`;

function makeAtlas(family: string) {
  const cell = 96;
  const canvas = document.createElement("canvas");
  canvas.width = cell * 10;
  canvas.height = cell;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `400 ${cell * 0.74}px ${family}`;
  for (let i = 0; i < 10; i++) ctx.fillText(String(i), i * cell + cell / 2, cell / 2 + cell * 0.04);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

type FieldProps = {
  atlas: THREE.Texture;
  pointer: React.RefObject<{ x: number; y: number; active: boolean }>;
  cellSize: number;
  focusX: number;
  progress: React.RefObject<{ v: number }>;
  reduced: boolean;
};

// Детермінований «випадок» — однаковий між рендерами
const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function Field({ atlas, pointer, cellSize, focusX, progress, reduced }: FieldProps) {
  const { size, invalidate } = useThree();
  const mat = useRef<THREE.ShaderMaterial>(null);
  const mouse = useRef(new THREE.Vector2(9999, 9999));
  const strength = useRef(0);

  const geometry = useMemo(() => {
    const cols = Math.ceil(size.width / cellSize) + 1;
    const rows = Math.ceil(size.height / cellSize) + 1;
    const count = cols * rows;
    const plane = new THREE.PlaneGeometry(1, 1);
    const geo = new THREE.InstancedBufferGeometry();
    geo.index = plane.index;
    geo.setAttribute("position", plane.getAttribute("position"));
    geo.setAttribute("uv", plane.getAttribute("uv"));
    const grid = new Float32Array(count * 2);
    const seed = new Float32Array(count);
    const digit = new Float32Array(count);
    const ox = ((cols - 1) * cellSize) / 2;
    const oy = ((rows - 1) * cellSize) / 2;
    let k = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        grid[k * 2] = c * cellSize - ox;
        grid[k * 2 + 1] = oy - r * cellSize;
        seed[k] = rnd(k) * 100;
        digit[k] = Math.floor(rnd(k + 7919) * 10);
        k++;
      }
    }
    geo.setAttribute("aGrid", new THREE.InstancedBufferAttribute(grid, 2));
    geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seed, 1));
    geo.setAttribute("aDigit", new THREE.InstancedBufferAttribute(digit, 1));
    geo.instanceCount = count;
    return geo;
  }, [size.width, size.height, cellSize]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uCell: { value: cellSize },
      uRadius: { value: cellSize * 4.2 },
      uStrength: { value: 0 },
      uMouse: { value: new THREE.Vector2(9999, 9999) },
      uSize: { value: new THREE.Vector2(1, 1) },
      uFocusX: { value: focusX },
      uAtlas: { value: atlas },
      uInk: { value: new THREE.Color("#141210") },
      uGreen: { value: new THREE.Color("#1F4D3A") },
      uRed: { value: new THREE.Color("#E2552C") },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [atlas],
  );

  useEffect(() => {
    const u = mat.current?.uniforms;
    if (!u) return;
    u.uSize.value.set(size.width, size.height);
    u.uCell.value = cellSize;
    u.uRadius.value = cellSize * 4.2;
    u.uFocusX.value = focusX;
    invalidate();
  }, [size.width, size.height, cellSize, focusX, invalidate]);

  useFrame((_state, delta) => {
    const material = mat.current;
    if (!material) return;
    const u = material.uniforms;
    u.uTime.value += reduced ? 0 : Math.min(delta, 0.05);
    u.uProgress.value = progress.current?.v ?? 1;
    const pt = pointer.current;
    const m = mouse.current;
    if (pt && pt.active) {
      const tx = pt.x - size.width / 2;
      const ty = size.height / 2 - pt.y;
      if (m.x > 9000) m.set(tx, ty);
      m.x += (tx - m.x) * 0.14;
      m.y += (ty - m.y) * 0.14;
    }
    strength.current += ((pt?.active ? 1 : 0) - strength.current) * 0.06;
    u.uMouse.value.copy(m);
    u.uStrength.value = strength.current;
  });

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export default function DigitField({ focusX = 0.62 }: { focusX?: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0, active: false });
  const progress = useRef({ v: 0 });
  const [atlas, setAtlas] = useState<THREE.Texture | null>(null);
  const [visible, setVisible] = useState(true);
  const [reduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [coarse] = useState(() => window.matchMedia("(pointer: coarse)").matches);
  const [cellSize] = useState(() => (window.innerWidth < 768 ? 30 : window.innerWidth > 1800 ? 40 : 34));

  // атлас — після завантаження моноширинного шрифту
  useEffect(() => {
    const family =
      getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains").trim() || "monospace";
    let cancelled = false;
    document.fonts
      .load(`400 64px ${family}`)
      .catch(() => null)
      .then(() => {
        if (!cancelled) setAtlas(makeAtlas(family));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // хаос → порядок
  useEffect(() => {
    if (!atlas) return;
    const p = progress.current;
    if (reduced) {
      p.v = 1;
      return;
    }
    const tw = gsap.to(p, { v: 1, duration: 2.8, ease: "power2.out", delay: 0.1 });
    return () => {
      tw.kill();
    };
  }, [atlas, reduced, progress]);

  // вказівник (полотно не перехоплює події — текст лишається інтерактивним)
  useEffect(() => {
    const el = wrap.current;
    if (!el || reduced) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const inside = e.clientY >= r.top && e.clientY <= r.bottom;
      pointer.current.x = e.clientX - r.left;
      pointer.current.y = e.clientY - r.top;
      pointer.current.active = inside;
    };
    const onLeave = () => (pointer.current.active = false);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    // тач-пристрої: повільний «зонд» за кривою Ліссажу
    let probe: gsap.core.Tween | null = null;
    if (coarse) {
      const s = { t: 0 };
      probe = gsap.to(s, {
        t: Math.PI * 2,
        duration: 14,
        repeat: -1,
        ease: "none",
        onUpdate: () => {
          const r = el.getBoundingClientRect();
          pointer.current.x = r.width * (0.5 + 0.38 * Math.sin(s.t * 2));
          pointer.current.y = r.height * (0.55 + 0.3 * Math.sin(s.t * 3 + 1));
          pointer.current.active = true;
        },
      });
    }
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      probe?.kill();
    };
  }, [reduced, coarse]);

  // пауза поза екраном
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      {atlas && (
        <Canvas
          orthographic
          camera={{ position: [0, 0, 10], zoom: 1, near: 0.1, far: 100 }}
          dpr={[1, coarse ? 1.5 : 1.75]}
          gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
          frameloop={visible ? (reduced ? "demand" : "always") : "never"}
          style={{ pointerEvents: "none" }}
          className="digit-field-canvas"
        >
          <Field
            atlas={atlas}
            pointer={pointer}
            cellSize={cellSize}
            focusX={focusX}
            progress={progress}
            reduced={reduced}
          />
        </Canvas>
      )}
    </div>
  );
}
