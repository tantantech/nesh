"use client";

import { useState, useEffect, useRef } from "react";

interface TerminalLine {
  type: "prompt" | "command" | "output" | "tool" | "ai" | "blank";
  text: string;
  delay: number;
}

const DEMO_LINES: TerminalLine[] = [
  { type: "prompt", text: "claudeshell", delay: 0 },
  { type: "command", text: "ls", delay: 600 },
  { type: "output", text: "README.md  package.json  src/  tests/", delay: 300 },
  { type: "blank", text: "", delay: 300 },
  { type: "prompt", text: "claudeshell", delay: 100 },
  { type: "command", text: "a find all typescript files larger than 100 lines", delay: 1200 },
  { type: "tool", text: "  \u2192 Reading src/...", delay: 400 },
  { type: "tool", text: "  \u2192 Running wc -l src/*.ts...", delay: 600 },
  { type: "blank", text: "", delay: 200 },
  { type: "ai", text: "Found 3 TypeScript files over 100 lines:", delay: 300 },
  { type: "ai", text: "  src/shell.ts    163 lines", delay: 150 },
  { type: "ai", text: "  src/ai.ts       179 lines", delay: 150 },
  { type: "ai", text: "  src/config.ts   106 lines", delay: 150 },
  { type: "blank", text: "", delay: 600 },
  { type: "prompt", text: "claudeshell", delay: 100 },
  { type: "command", text: "a explain the last error", delay: 1000 },
  { type: "tool", text: "  \u2192 Analyzing error context...", delay: 500 },
  { type: "blank", text: "", delay: 200 },
  { type: "ai", text: "The TypeScript compiler found a type mismatch in", delay: 200 },
  { type: "ai", text: "src/handler.ts:42 \u2014 passing `string` where it", delay: 150 },
  { type: "ai", text: "expects `RequestConfig`. Quick fix:", delay: 150 },
  { type: "ai", text: "  const config: RequestConfig = { url: endpoint };", delay: 200 },
];

export function TerminalDemo() {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [typingIndex, setTypingIndex] = useState(0);
  const [currentTyped, setCurrentTyped] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visibleLines >= DEMO_LINES.length) {
      const timeout = setTimeout(() => {
        setVisibleLines(0);
        setTypingIndex(0);
        setCurrentTyped("");
        setIsTyping(false);
      }, 4000);
      return () => clearTimeout(timeout);
    }

    const line = DEMO_LINES[visibleLines];

    if (line.type === "command" && !isTyping) {
      setIsTyping(true);
      setCurrentTyped("");
      setTypingIndex(0);
      return;
    }

    if (isTyping) {
      const cmd = DEMO_LINES[visibleLines].text;
      if (typingIndex < cmd.length) {
        const timeout = setTimeout(() => {
          setCurrentTyped(cmd.slice(0, typingIndex + 1));
          setTypingIndex(typingIndex + 1);
        }, 25 + Math.random() * 45);
        return () => clearTimeout(timeout);
      }
      setIsTyping(false);
      const timeout = setTimeout(() => {
        setVisibleLines((v) => v + 1);
      }, 200);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setVisibleLines((v) => v + 1);
    }, line.delay);

    return () => clearTimeout(timeout);
  }, [visibleLines, isTyping, typingIndex]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines, currentTyped]);

  const getLineClasses = (line: TerminalLine) => {
    switch (line.type) {
      case "prompt":
        return "text-muted-foreground";
      case "command":
        return "text-foreground font-medium";
      case "output":
        return "text-muted-foreground/80";
      case "tool":
        return "text-primary/50 text-[13px]";
      case "ai":
        return "text-primary/90";
      case "blank":
        return "";
      default:
        return "text-foreground";
    }
  };

  const renderPrompt = () => (
    <span className="flex items-center gap-0 shrink-0">
      <span className="bg-primary/90 text-primary-foreground px-2 py-0.5 text-[11px] font-bold rounded-l">
        claudeshell
      </span>
      <span className="bg-foreground/8 dark:bg-white/8 text-foreground/60 px-1.5 py-0.5 text-[11px]">
        ~/Projects
      </span>
      <span className="bg-foreground/5 dark:bg-white/5 text-foreground/40 px-1.5 py-0.5 text-[11px] rounded-r">
        main
      </span>
      <span className="text-primary/70 ml-2 text-xs">&gt;</span>
    </span>
  );

  return (
    <div className="relative w-full max-w-[640px] mx-auto">
      <div className="relative rounded-xl border border-white/[0.06] bg-[#0c1210] dark:bg-[#050a08] overflow-hidden shadow-2xl shadow-black/30 dark:shadow-black/50">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.02]">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="flex-1 text-center text-[11px] text-white/30 font-mono">
            claudeshell
          </span>
          <div className="w-[52px]" /> {/* Balance the dots */}
        </div>

        {/* Terminal body */}
        <div
          ref={containerRef}
          className="p-4 font-mono text-[13px] leading-[1.7] min-h-[180px] overflow-hidden"
          style={{ color: "#e8f5ee" }}
        >
          {DEMO_LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i} className={`${getLineClasses(line)} min-h-[1.5rem]`}>
              {line.type === "prompt" ? (
                <span className="flex items-center gap-2">
                  {renderPrompt()}
                  {i === visibleLines - 1 && isTyping && (
                    <span className="text-white/90 font-medium">
                      {currentTyped}
                      <span className="cursor-blink text-primary/80">&#9608;</span>
                    </span>
                  )}
                </span>
              ) : (
                <span>{line.text}</span>
              )}
            </div>
          ))}
          {visibleLines < DEMO_LINES.length &&
            DEMO_LINES[visibleLines]?.type === "prompt" &&
            !isTyping && (
              <div className="min-h-[1.5rem] flex items-center gap-2">
                {renderPrompt()}
                <span className="cursor-blink text-primary/80">&#9608;</span>
              </div>
            )}
        </div>
      </div>

      {/* Subtle reflection */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-10 bg-primary/6 blur-3xl rounded-full" />
    </div>
  );
}
