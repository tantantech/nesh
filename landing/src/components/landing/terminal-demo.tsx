"use client";

import { useState, useEffect, useRef } from "react";

interface TerminalLine {
  type: "prompt" | "command" | "output" | "tool" | "ai" | "blank";
  text: string;
  delay: number;
}

const DEMO_LINES: TerminalLine[] = [
  { type: "prompt", text: "  claudeshell   ~/Projects   main  ", delay: 0 },
  { type: "command", text: "ls", delay: 600 },
  { type: "output", text: "README.md  package.json  src/  tests/", delay: 300 },
  { type: "blank", text: "", delay: 200 },
  { type: "prompt", text: "  claudeshell   ~/Projects   main  ", delay: 100 },
  { type: "command", text: "a find all typescript files larger than 100 lines", delay: 1200 },
  { type: "tool", text: "  \u2192 Reading src/...", delay: 400 },
  { type: "tool", text: "  \u2192 Running wc -l src/*.ts...", delay: 600 },
  { type: "blank", text: "", delay: 200 },
  { type: "ai", text: "Found 3 TypeScript files over 100 lines:", delay: 300 },
  { type: "ai", text: "  src/shell.ts    163 lines", delay: 150 },
  { type: "ai", text: "  src/ai.ts       179 lines", delay: 150 },
  { type: "ai", text: "  src/config.ts   106 lines", delay: 150 },
  { type: "blank", text: "", delay: 400 },
  { type: "prompt", text: "  claudeshell   ~/Projects   main  ", delay: 100 },
  { type: "command", text: "a explain the last error", delay: 1000 },
  { type: "tool", text: "  \u2192 Analyzing error context...", delay: 500 },
  { type: "blank", text: "", delay: 200 },
  { type: "ai", text: "The TypeScript compiler found a type mismatch in", delay: 200 },
  { type: "ai", text: "src/handler.ts:42. You're passing a `string` where", delay: 150 },
  { type: "ai", text: "the function expects `RequestConfig`. Fix:", delay: 150 },
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
      // Restart after a pause
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
      // Type out commands character by character
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
      // Done typing
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
        return "text-foreground font-semibold";
      case "output":
        return "text-muted-foreground";
      case "tool":
        return "text-primary/60 italic text-sm";
      case "ai":
        return "text-primary";
      case "blank":
        return "";
      default:
        return "text-foreground";
    }
  };

  const renderPrompt = (text: string) => (
    <span className="flex items-center gap-0">
      <span className="bg-primary text-primary-foreground px-2 py-0.5 text-xs font-bold rounded-l-md">
        {text.split("   ")[0]?.trim()}
      </span>
      <span className="bg-foreground/10 dark:bg-white/10 text-foreground/70 px-2 py-0.5 text-xs rounded-r-md">
        ~/Projects
      </span>
      <span className="text-muted-foreground/60 mx-1 text-xs">main</span>
      <span className="text-primary ml-1">&gt;</span>
    </span>
  );

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative rounded-2xl border border-border bg-card glass terminal-glow scanlines overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <span className="flex-1 text-center text-xs text-muted-foreground font-mono">
            claudeshell &mdash; zsh
          </span>
        </div>

        {/* Terminal body */}
        <div
          ref={containerRef}
          className="p-4 font-mono text-sm leading-relaxed h-[320px] overflow-hidden"
        >
          {DEMO_LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i} className={`${getLineClasses(line)} min-h-[1.375rem]`}>
              {line.type === "prompt" ? (
                <span className="flex items-center gap-2">
                  {renderPrompt(line.text)}
                  {/* Show typed text for the command that follows */}
                  {i === visibleLines - 1 && isTyping && (
                    <span className="text-foreground font-semibold">
                      {currentTyped}
                      <span className="cursor-blink text-primary">|</span>
                    </span>
                  )}
                </span>
              ) : (
                line.text
              )}
            </div>
          ))}
          {visibleLines < DEMO_LINES.length &&
            DEMO_LINES[visibleLines]?.type === "prompt" &&
            !isTyping && (
              <div className="min-h-[1.375rem] flex items-center gap-2">
                {renderPrompt(DEMO_LINES[visibleLines].text)}
                <span className="cursor-blink text-primary">|</span>
              </div>
            )}
        </div>
      </div>

      {/* Reflection glow under the terminal */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-primary/10 dark:bg-primary/5 blur-2xl rounded-full" />
    </div>
  );
}
