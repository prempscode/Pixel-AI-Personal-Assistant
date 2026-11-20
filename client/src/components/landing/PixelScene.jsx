import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { MousePointer2, Sparkles } from "lucide-react";
import * as THREE from "three";
import { useTheme } from "../../context/ThemeContext";

const PALETTES = {
  dark: {
    cube: "#f3f0e7",
    accent: "#d7ff3e",
    muted: "#aab69b",
    ring: "#f3f0e7",
    glow: "#d7ff3e",
    star: "#f3f0e7",
    starOpacity: 0.46,
    glowIntensity: 16,
    keyLight: "#fffaf0",
    keyIntensity: 2.4,
    fillIntensity: 0.55,
    ambient: 0.72,
  },
  light: {
    cube: "#25281e",
    accent: "#7f9d1d",
    muted: "#a0a592",
    ring: "#4b5042",
    glow: "#84a21f",
    star: "#4b5042",
    starOpacity: 0.26,
    glowIntensity: 8,
    keyLight: "#fffdf5",
    keyIntensity: 2.1,
    fillIntensity: 0.38,
    ambient: 1.2,
  },
};

function fibonacciSphere(count, radius) {
  const points = [];
  const offset = 2 / count;
  const increment = Math.PI * (3 - Math.sqrt(5));

  for (let index = 0; index < count; index += 1) {
    const y = index * offset - 1 + offset / 2;
    const ringRadius = Math.sqrt(1 - y * y);
    const phi = index * increment;
    points.push(
      new THREE.Vector3(
        Math.cos(phi) * ringRadius * radius,
        y * radius,
        Math.sin(phi) * ringRadius * radius,
      ),
    );
  }

  return points;
}

function PixelCloud({ reduceMotion, palette, tileCount, interactionRef }) {
  const meshRef = useRef(null);
  const pointerGroupRef = useRef(null);
  const spinGroupRef = useRef(null);
  const coreRef = useRef(null);
  const haloRef = useRef(null);
  const rippleRef = useRef(null);
  const rippleMaterialRef = useRef(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  const tiles = useMemo(() => {
    const positions = fibonacciSphere(tileCount, 2.05);

    return positions.map((position, index) => {
      const accent = index % 13 === 0 || index % 37 === 0;
      const muted = index % 5 === 0;
      const jitter = ((index * 97) % 100) / 100;

      return {
        base: position.clone().multiplyScalar(0.97 + jitter * 0.08),
        phase: jitter * Math.PI * 2,
        size: accent
          ? 0.11 + (index % 4) * 0.018
          : 0.036 + (index % 6) * 0.009,
        color: accent
          ? palette.accent
          : muted
            ? palette.muted
            : palette.cube,
        accent,
      };
    });
  }, [palette, tileCount]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    tiles.forEach((tile, index) => {
      color.set(tile.color);
      mesh.setColorAt(index, color);
    });

    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [tiles, color]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const interaction = interactionRef.current;
    const elapsed = state.clock.getElapsedTime();
    const motionTime = reduceMotion ? 0.6 : elapsed;

    if (pointerGroupRef.current) {
      const targetX = reduceMotion
        ? -0.06
        : interaction.pressed
          ? pointerGroupRef.current.rotation.x
          : interaction.y * -0.2 - 0.04;
      const targetY = reduceMotion
        ? 0.12
        : interaction.pressed
          ? pointerGroupRef.current.rotation.y
          : interaction.x * 0.26 + 0.12;
      pointerGroupRef.current.rotation.x = THREE.MathUtils.damp(
        pointerGroupRef.current.rotation.x,
        targetX,
        3.4,
        delta,
      );
      pointerGroupRef.current.rotation.y = THREE.MathUtils.damp(
        pointerGroupRef.current.rotation.y,
        targetY,
        3.4,
        delta,
      );
      pointerGroupRef.current.position.y = reduceMotion
        ? 0
        : Math.sin(motionTime * 0.42) * 0.045;
    }

    if (spinGroupRef.current) {
      const spin = spinGroupRef.current;

      if (interaction.pressed) {
        // Manual mode: idle rotation and inertia are suspended immediately.
        interaction.autoWeight = 0;
        interaction.resumeDelay = 0;
      } else {
        if (interaction.resumeDelay > 0) {
          interaction.resumeDelay = Math.max(
            0,
            interaction.resumeDelay - delta,
          );
        } else {
          // Ease the idle orbit back in after the user lets go.
          interaction.autoWeight = THREE.MathUtils.damp(
            interaction.autoWeight,
            1,
            3.2,
            delta,
          );
        }

        // A short, decaying fling keeps the release feeling natural.
        interaction.targetX = THREE.MathUtils.clamp(
          interaction.targetX + interaction.flingX * delta,
          -1.15,
          1.15,
        );
        interaction.targetY += interaction.flingY * delta;
        interaction.flingX = THREE.MathUtils.damp(
          interaction.flingX,
          0,
          3.1,
          delta,
        );
        interaction.flingY = THREE.MathUtils.damp(
          interaction.flingY,
          0,
          2.7,
          delta,
        );
      }

      // Negative Y gives a clockwise orbit when viewed from above. The idle
      // orbit stays active even when the OS requests reduced motion because
      // it is the core state of the hero object, not a decorative flourish.
      const idleSpeed = -0.26;
      interaction.targetY +=
        idleSpeed * interaction.autoWeight * delta;

      const followSpeed = interaction.pressed ? 22 : 13;
      spin.rotation.x = THREE.MathUtils.damp(
        spin.rotation.x,
        interaction.targetX,
        followSpeed,
        delta,
      );
      spin.rotation.y = THREE.MathUtils.damp(
        spin.rotation.y,
        interaction.targetY,
        followSpeed,
        delta,
      );

      const tapScale = reduceMotion ? 1 : 1 + interaction.pulse * 0.035;
      spin.scale.setScalar(tapScale);
    }

    if (coreRef.current) {
      const corePulse = 1 + interaction.pulse * 0.65;
      coreRef.current.scale.setScalar(corePulse);
    }

    if (haloRef.current) {
      haloRef.current.scale.setScalar(1 + interaction.pulse * 0.5);
    }

    if (rippleRef.current && rippleMaterialRef.current) {
      interaction.burst = Math.max(0, interaction.burst - delta * 0.8);
      const progress = 1 - interaction.burst;
      rippleRef.current.scale.setScalar(1 + progress * 1.9);
      rippleMaterialRef.current.opacity = interaction.burst * 0.32;
    }

    interaction.pulse = THREE.MathUtils.damp(
      interaction.pulse,
      0,
      3.2,
      delta,
    );

    if (!mesh) return;

    tiles.forEach((tile, index) => {
      const pulse = reduceMotion
        ? 1
        : 1 + Math.sin(motionTime * 0.85 + tile.phase) * 0.16;
      const idleLift =
        (reduceMotion
          ? 0
          : Math.sin(motionTime * 0.55 + tile.phase) * 0.045) *
        (tile.accent ? 2 : 1);
      const tapLift = interaction.pulse * 0.12 * (tile.accent ? 2.2 : 1);
      const lift = idleLift + tapLift;

      dummy.position
        .copy(tile.base)
        .multiplyScalar(1 + lift / Math.max(tile.base.length(), 0.001));
      dummy.rotation.set(
        motionTime * 0.06 + tile.phase,
        motionTime * 0.08 + tile.phase,
        0,
      );
      dummy.scale.setScalar(tile.size * pulse);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={pointerGroupRef}>
      <group ref={spinGroupRef}>
        <instancedMesh ref={meshRef} args={[null, null, tiles.length]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            roughness={0.36}
            metalness={0.18}
            transparent
            opacity={0.96}
          />
        </instancedMesh>
      </group>

      <mesh ref={rippleRef} rotation={[Math.PI / 2.15, 0.2, 0]}>
        <ringGeometry args={[1.95, 1.975, 120]} />
        <meshBasicMaterial
          ref={rippleMaterialRef}
          color={palette.accent}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2.25, 0.25, 0]}>
        <torusGeometry args={[2.72, 0.0045, 8, 200]} />
        <meshBasicMaterial
          color={palette.ring}
          transparent
          opacity={0.22}
        />
      </mesh>
      <mesh rotation={[Math.PI / 1.9, -0.35, 0.55]}>
        <torusGeometry args={[2.96, 0.0035, 8, 200]} />
        <meshBasicMaterial
          color={palette.accent}
          transparent
          opacity={0.24}
        />
      </mesh>

      <mesh ref={coreRef}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshBasicMaterial color={palette.glow} />
      </mesh>
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.4, 24, 24]} />
        <meshBasicMaterial
          color={palette.glow}
          transparent
          opacity={0.06}
        />
      </mesh>
      <pointLight
        color={palette.glow}
        intensity={palette.glowIntensity}
        distance={8}
        decay={2}
      />
    </group>
  );
}

function seededRandom(seed) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function StarField({ reduceMotion, palette, starCount }) {
  const pointsRef = useRef(null);
  const geometry = useMemo(() => {
    const positions = new Float32Array(starCount * 3);

    for (let index = 0; index < starCount; index += 1) {
      const seed = index + 1;
      const radius = 3.8 + seededRandom(seed) * 4.6;
      const theta = seededRandom(seed + 17.3) * Math.PI * 2;
      const phi = Math.acos(2 * seededRandom(seed + 41.9) - 1);
      positions[index * 3] = Math.sin(phi) * Math.cos(theta) * radius;
      positions[index * 3 + 1] = Math.cos(phi) * radius * 0.8;
      positions[index * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius;
    }

    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return buffer;
  }, [starCount]);

  useFrame((_state, delta) => {
    if (pointsRef.current && !reduceMotion) {
      pointsRef.current.rotation.y += delta * 0.014;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color={palette.star}
        size={0.02}
        transparent
        opacity={palette.starOpacity}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function Scene({
  reduceMotion,
  theme,
  compact,
  inView,
  interactionRef,
}) {
  const palette = PALETTES[theme] || PALETTES.dark;
  const tileCount = compact ? 170 : 290;
  const starCount = compact ? 70 : 180;

  return (
    <Canvas
      dpr={compact ? 1 : [1, 1.6]}
      gl={{
        alpha: true,
        antialias: !compact,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0, 6.9], fov: 38 }}
      frameloop={!inView ? "demand" : "always"}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <ambientLight intensity={palette.ambient} />
      <directionalLight
        position={[4, 6, 5]}
        intensity={palette.keyIntensity}
        color={palette.keyLight}
      />
      <directionalLight
        position={[-5, -2, 2]}
        intensity={palette.fillIntensity}
        color={palette.muted}
      />
      <Suspense fallback={null}>
        <PixelCloud
          reduceMotion={reduceMotion}
          palette={palette}
          tileCount={tileCount}
          interactionRef={interactionRef}
        />
        <StarField
          reduceMotion={reduceMotion}
          palette={palette}
          starCount={starCount}
        />
      </Suspense>
    </Canvas>
  );
}

function StaticFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative size-[min(68vw,360px)]">
        <div className="absolute inset-0 rounded-full border border-paper/10" />
        <div className="absolute inset-8 rounded-full border border-volt/15" />
        <div className="orb-fallback absolute inset-[18%] opacity-80" />
        <div className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-[2px] bg-volt shadow-[0_0_40px_rgba(215,255,62,.65)]" />
      </div>
    </div>
  );
}

export default function PixelScene() {
  const reduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const wrapperRef = useRef(null);
  const [inView, setInView] = useState(true);
  const [compact] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(max-width: 767px)").matches ||
      (navigator.hardwareConcurrency || 8) <= 4
    );
  });
  const [webglAvailable] = useState(() => {
    if (typeof document === "undefined") return false;
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  });

  const interactionRef = useRef({
    x: 0,
    y: 0,
    pulse: 0,
    burst: 0,
    pressed: false,
    targetX: 0,
    targetY: 0,
    flingX: 0,
    flingY: 0,
    autoWeight: 1,
    resumeDelay: 0,
    lastMoveTime: 0,
    lastX: 0,
    lastY: 0,
  });

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "120px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);



  function setPointerPosition(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    const interaction = interactionRef.current;

    if (interaction.pressed) {
      const now = performance.now();
      const deltaX = x - interaction.lastX;
      const deltaY = y - interaction.lastY;
      const elapsed = Math.max(
        (now - interaction.lastMoveTime) / 1000,
        0.008,
      );

      // Move the target directly with the pointer for a 1:1 grab feel.
      interaction.targetY += deltaX * 2;
      interaction.targetX = THREE.MathUtils.clamp(
        interaction.targetX + deltaY * 1.8,
        -1.15,
        1.15,
      );

      // Capture a bounded release velocity for a soft, premium fling.
      interaction.flingY = THREE.MathUtils.clamp(
        (deltaX * 2) / elapsed,
        -5,
        5,
      );
      interaction.flingX = THREE.MathUtils.clamp(
        (deltaY * 1.8) / elapsed,
        -4,
        4,
      );
      interaction.lastMoveTime = now;
    }

    interaction.x = x;
    interaction.y = y;
    interaction.lastX = x;
    interaction.lastY = y;
  }

  function releaseInteraction(cancelled = false) {
    const interaction = interactionRef.current;
    if (!interaction.pressed) return;

    interaction.pressed = false;
    interaction.autoWeight = 0;
    interaction.resumeDelay = 0.2;

    if (
      cancelled ||
      performance.now() - interaction.lastMoveTime > 90
    ) {
      interaction.flingX = 0;
      interaction.flingY = 0;
    }
  }

  function handlePointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const interaction = interactionRef.current;
    interaction.pressed = true;
    interaction.autoWeight = 0;
    interaction.resumeDelay = 0;
    interaction.flingX = 0;
    interaction.flingY = 0;
    interaction.lastMoveTime = performance.now();
    interaction.lastX = interaction.x;
    interaction.lastY = interaction.y;

    if (!reduceMotion) {
      interaction.pulse = 1;
      interaction.burst = 1;
    }

    if (event.currentTarget.setPointerCapture) {
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Some embedded browsers don't support pointer capture.
      }
    }
  }

  function handlePointerUp() {
    releaseInteraction();
  }

  function handlePointerLeave() {
    const interaction = interactionRef.current;
    interaction.x = 0;
    interaction.y = 0;
    if (interaction.pressed) releaseInteraction();
  }

  return (
    <div
      ref={wrapperRef}
      className="relative h-full w-full touch-none cursor-grab select-none active:cursor-grabbing"
      role="img"
      aria-label="An interactive sphere of pixel blocks that slowly orbits clockwise. Drag in any direction to spin it, or tap to send a spark through it."
      onPointerMove={setPointerPosition}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => releaseInteraction(true)}
      onPointerLeave={handlePointerLeave}
      onLostPointerCapture={() => releaseInteraction(true)}
    >
      <div className="pointer-events-none absolute inset-[14%] rounded-full bg-volt/[0.055] blur-[80px]" />
      {webglAvailable ? (
        <Scene
          reduceMotion={Boolean(reduceMotion)}
          theme={theme}
          compact={compact}
          inView={inView}
          interactionRef={interactionRef}
        />
      ) : (
        <StaticFallback />
      )}

      <div className="pointer-events-none absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 text-[8px] font-semibold tracking-[0.14em] whitespace-nowrap text-paper/28 uppercase sm:bottom-1">
        <MousePointer2 className="size-2.5" />
        Drag to orbit
        {!reduceMotion && (
          <>
            <span className="size-0.5 rounded-full bg-paper/30" />
            <Sparkles className="size-2.5" />
            Tap to spark
          </>
        )}
      </div>
    </div>
  );
}
