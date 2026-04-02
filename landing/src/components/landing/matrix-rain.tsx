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

    const chars = "abcdefghijklmnopqrstuvwxyz01234567890@#$%^&*()アイウエオカキクケコサシスセソ";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array.from({ length: columns }, () =>
      Math.random() * -100
    );

    let animId: number;

    const draw = () => {
      const isDark = resolvedTheme === "dark";

      ctx.fillStyle = isDark
        ? "rgba(3, 8, 6, 0.06)"
        : "rgba(248, 250, 249, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px JetBrains Mono, monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Gradient fade: brighter at the head
        const alpha = isDark
          ? 0.05 + Math.random() * 0.12
          : 0.03 + Math.random() * 0.06;

        ctx.fillStyle = isDark
          ? `rgba(0, 255, 65, ${alpha})`
          : `rgba(13, 150, 104, ${alpha})`;

        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
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
      aria-hidden="true"
    />
  );
}
