import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SPACING = 0.5;

function Grid({ cols, rows, animated, isDark, pointerRef, pointerActive }) {
  const mesh = useRef(null);
  const smoothPointer = useRef(new THREE.Vector2(10, 10));
  const hoverStrength = useRef(0);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  const base = useMemo(
    () => new THREE.Color(isDark ? "#1b1b21" : "#d8d4cb"),
    [isDark],
  );
  const hot = useMemo(
    () => new THREE.Color(isDark ? "#ff5a2c" : "#bc3817"),
    [isDark],
  );
  const paper = useMemo(
    () => new THREE.Color(isDark ? "#ece8e1" : "#302d27"),
    [isDark],
  );

  // Calculate fixed grid positions only once.
  const cells = useMemo(() => {
    const result = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - cols / 2) * SPACING;
        const z = (r - rows / 2) * SPACING;

        result.push({
          x,
          z,
          waveX: x * 0.55,
          waveZ: z * 0.7,
        });
      }
    }

    return result;
  }, [cols, rows]);

  useFrame(({ clock, invalidate }, delta) => {
    const m = mesh.current;
    if (!m) return;

    const pointer = pointerRef.current;
    const t = animated ? clock.elapsedTime : 0;

    if (pointerActive.current && hoverStrength.current === 0) {
      smoothPointer.current.copy(pointer);
    }

    if (pointerActive.current) {
      smoothPointer.current.x = THREE.MathUtils.damp(
        smoothPointer.current.x,
        pointer.x,
        12,
        delta,
      );
      smoothPointer.current.y = THREE.MathUtils.damp(
        smoothPointer.current.y,
        pointer.y,
        12,
        delta,
      );
    }
    hoverStrength.current = THREE.MathUtils.damp(
      hoverStrength.current,
      pointerActive.current ? 1 : 0,
      10,
      delta,
    );

    if (
      !animated &&
      ((pointerActive.current &&
        (Math.abs(smoothPointer.current.x - pointer.x) > 0.001 ||
          Math.abs(smoothPointer.current.y - pointer.y) > 0.001)) ||
        Math.abs(hoverStrength.current - (pointerActive.current ? 1 : 0)) >
          0.001)
    ) {
      invalidate();
    }

    // Pointer coordinates normalized between -1 and 1.
    const px = smoothPointer.current.x * (cols * SPACING) * 0.5;
    const pz = -smoothPointer.current.y * (rows * SPACING) * 0.35;

    for (let i = 0; i < cells.length; i++) {
      const { x, z, waveX, waveZ } = cells[i];

      const wave =
        Math.sin(waveX + t * 0.9) * 0.5 + Math.cos(waveZ - t * 0.7) * 0.5;

      const dx = x - px;
      const dz = z - pz;
      const lift =
        Math.exp(-(dx * dx + dz * dz) * 0.12) *
        1.1 *
        hoverStrength.current;

      const h = Math.max(0.06, 0.28 + wave * 0.22 + lift);

      dummy.position.set(x, h / 2 - 0.5, z);
      dummy.scale.set(1, h / 0.3, 1);
      dummy.updateMatrix();

      m.setMatrixAt(i, dummy.matrix);

      color.copy(base).lerp(paper, Math.max(0, wave) * 0.18);
      color.lerp(hot, Math.min(1, lift * 1.15));

      m.setColorAt(i, color);
    }

    m.instanceMatrix.needsUpdate = true;

    if (m.instanceColor) {
      m.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, cells.length]}
      frustumCulled={false}
    >
      <boxGeometry args={[SPACING * 0.72, 0.3, SPACING * 0.72]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

export default function PixelField({
  eventSource,
  animated = true,
  isDark = true,
}) {
  const wrapRef = useRef(null);

  // Start outside the grid so there is no initial center bump.
  const pointer = useRef(new THREE.Vector2(10, 10));
  const pointerActive = useRef(false);

  const invalidateRef = useRef(null);

  const [visible, setVisible] = useState(true);

  // Reduced instance count.
  const [dims] = useState(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return { cols: 18, rows: 12 };
    }

    return { cols: 34, rows: 20 };
  });

  // Track pointer using actual element coordinates.
  useEffect(() => {
    const area = wrapRef.current;
    const target = eventSource?.current ?? area;

    if (!area || !target) return;

    const handlePointerMove = (event) => {
      if (
        event.target instanceof Element &&
        event.target.closest("[data-pixel-field-ignore]")
      ) {
        pointerActive.current = false;
        invalidateRef.current?.();
        return;
      }

      const rect = area.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      // Ignore pointer positions outside the field.
      if (x < 0 || x > 1 || y < 0 || y > 1) {
        pointerActive.current = false;
      } else {
        pointer.current.set(x * 2 - 1, 1 - y * 2);
        pointerActive.current = true;
      }

      // Required for hover updates when animated=false.
      invalidateRef.current?.();
    };

    const handlePointerLeave = () => {
      pointerActive.current = false;
      invalidateRef.current?.();
    };

    target.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    target.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      target.removeEventListener("pointermove", handlePointerMove);
      target.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [eventSource]);

  // Stop rendering when outside the viewport.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Canvas
        dpr={1}
        frameloop={visible && animated ? "always" : "demand"}
        camera={{
          position: [0, 5.2, 9.5],
          fov: 42,
          near: 0.1,
          far: 60,
        }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
        }}
        // Let HTML content receive events when using a shared parent.
        style={eventSource ? { pointerEvents: "none" } : undefined}
        onCreated={({ camera, invalidate }) => {
          camera.lookAt(0, -0.6, -1.5);
          invalidateRef.current = invalidate;
        }}
      >
        <fog attach="fog" args={[isDark ? "#08080a" : "#f7f5ef", 7, 20]} />

        <Grid
          cols={dims.cols}
          rows={dims.rows}
          animated={animated}
          isDark={isDark}
          pointerRef={pointer}
          pointerActive={pointerActive}
        />
      </Canvas>
    </div>
  );
}
