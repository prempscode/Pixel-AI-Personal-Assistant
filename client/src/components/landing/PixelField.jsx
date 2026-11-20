import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SPACING = 0.5;

function Grid({ cols, rows, animated, pointer }) {
  const mesh = useRef(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  const base = useMemo(() => new THREE.Color("#1b1b21"), []);
  const hot = useMemo(() => new THREE.Color("#ff5a2c"), []);
  const paper = useMemo(() => new THREE.Color("#ece8e1"), []);

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

  useFrame(({ clock }) => {
    const m = mesh.current;
    if (!m) return;

    const t = animated ? clock.elapsedTime : 0;

    // Pointer coordinates normalized between -1 and 1.
    const px = pointer.x * (cols * SPACING) * 0.5;
    const pz = -pointer.y * (rows * SPACING) * 0.35;

    for (let i = 0; i < cells.length; i++) {
      const { x, z, waveX, waveZ } = cells[i];

      const wave =
        Math.sin(waveX + t * 0.9) * 0.5 + Math.cos(waveZ - t * 0.7) * 0.5;

      const dx = x - px;
      const dz = z - pz;
      const lift = Math.exp(-(dx * dx + dz * dz) * 0.12) * 1.1;

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

export default function PixelField({ eventSource, animated = true }) {
  const wrapRef = useRef(null);

  // Start outside the grid so there is no initial center bump.
  const pointer = useRef(new THREE.Vector2(10, 10));

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
      const rect = area.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      // Ignore pointer positions outside the field.
      if (x < 0 || x > 1 || y < 0 || y > 1) {
        pointer.current.set(10, 10);
      } else {
        pointer.current.set(x * 2 - 1, 1 - y * 2);
      }

      // Required for hover updates when animated=false.
      invalidateRef.current?.();
    };

    const handlePointerLeave = () => {
      pointer.current.set(10, 10);
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
        <fog attach="fog" args={["#08080a", 7, 20]} />

        <Grid
          cols={dims.cols}
          rows={dims.rows}
          animated={animated}
          pointer={pointer.current}
        />
      </Canvas>
    </div>
  );
}
