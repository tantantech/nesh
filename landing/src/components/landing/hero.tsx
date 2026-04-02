"use client";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Terminal, ArrowRight, Copy, Check } from "lucide-react";
import { GithubIcon } from "./github-icon";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Hero() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText("npm install -g claudeshell");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-4 sm:px-6 pt-20">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 dark:bg-primary/4 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative flex flex-col items-center gap-8 max-w-3xl text-center">
        {/* Version badge */}
        <Badge
          variant="secondary"
          className="px-4 py-1.5 font-mono text-xs border border-primary/20 bg-primary/5 text-primary gap-2 rounded-full"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          v0.1.0 &mdash; AI-native shell
        </Badge>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter leading-[0.95]">
          <span className="block text-foreground">Your terminal,</span>
          <span className="block text-glow text-primary mt-1">supercharged</span>
          <span className="block text-foreground mt-1">with AI.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
          Type commands as usual. Prefix with{" "}
          <code className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono text-base font-semibold border border-primary/15">
            a
          </code>{" "}
          to invoke Claude. Full filesystem & terminal access via the Agent SDK.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Install command */}
          <button
            onClick={handleCopy}
            className="group relative flex items-center gap-3 h-12 px-5 rounded-xl border border-border bg-card glass font-mono text-sm transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_20px_var(--glow)] cursor-pointer w-full sm:w-auto"
          >
            <Terminal className="h-4 w-4 text-primary shrink-0" />
            <span className="text-muted-foreground">$</span>
            <span className="text-foreground">npm install -g claudeshell</span>
            {copied ? (
              <Check className="h-4 w-4 text-primary shrink-0 ml-2" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground shrink-0 ml-2 group-hover:text-primary transition-colors" />
            )}
          </button>

          <a
            href="https://github.com/tantantech/claudeshell"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 px-6 rounded-xl font-semibold pulse-glow bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
            )}
          >
            <GithubIcon className="h-4 w-4 mr-2" />
            View on GitHub
            <ArrowRight className="h-4 w-4 ml-2" />
          </a>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8 pt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-foreground">12</span>
            <span>modules</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-foreground">~650</span>
            <span>lines</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-foreground">111</span>
            <span>tests</span>
          </div>
        </div>
      </div>
    </section>
  );
}
