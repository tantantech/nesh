"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = "01アイウエオカキクケコ";
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    // Only use ~30% of columns for a sparse, elegant rain
    const activeColumns = new Set<number>();
    while (activeColumns.size < Math.floor(columns * 0.25)) {
      activeColumns.add(Math.floor(Math.random() * columns));
    }
    const drops: number[] = Array.from({ length: columns }, () =>
      Math.random() * -80
    );

    let animId: number;

    const draw = () => {
      const isDark = resolvedTheme === "dark";

      // Faster fade = shorter trails
      ctx.fillStyle = isDark
        ? "rgba(3, 8, 6, 0.12)"
        : "rgba(248, 250, 249, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px JetBrains Mono, monospace`;

      for (const i of activeColumns) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Very subtle alpha
        const alpha = isDark
          ? 0.03 + Math.random() * 0.06
          : 0.015 + Math.random() * 0.03;

        ctx.fillStyle = isDark
          ? `rgba(0, 255, 65, ${alpha})`
          : `rgba(13, 150, 104, ${alpha})`;

        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      id="matrix-canvas"
      className="opacity-60"
      aria-hidden="true"
    />
  );
}
