import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  component: TypeAndRelease,
});

type Released = {
  id: number;
  text: string;
  left: number; // vw offset from center, -20..20
  drift: number; // additional horizontal drift
  size: "sm" | "md" | "lg";
};

const STORAGE_KEY = "type-release:count";
const RELEASE_DURATION = 5000;

function TypeAndRelease() {
  const [text, setText] = useState("");
  const [count, setCount] = useState(0);
  const [released, setReleased] = useState<Released[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const idRef = useRef(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) setCount(parseInt(stored, 10) || 0);
    setHydrated(true);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, String(count));
  }, [count, hydrated]);

  const release = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const id = ++idRef.current;
    const item: Released = {
      id,
      text: trimmed,
      left: (Math.random() - 0.5) * 24,
      drift: (Math.random() - 0.5) * 40,
      size: trimmed.length > 80 ? "sm" : trimmed.length > 30 ? "md" : "lg",
    };
    setReleased((r) => [...r, item]);
    setText("");
    setCount((c) => c + 1);
    window.setTimeout(() => {
      setReleased((r) => r.filter((x) => x.id !== id));
    }, RELEASE_DURATION + 200);
  }, [text]);

  const clearAll = useCallback(() => {
    setCount(0);
    setText("");
    setReleased([]);
    inputRef.current?.focus();
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      release();
    }
  };

  return (
    <div className="ambient-field relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 text-ink selection:bg-glow/30">
      {/* Turrell-style light wash */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[120vh] w-[120vw] -translate-x-1/2 -translate-y-1/2 opacity-20 bg-[radial-gradient(circle_at_center,var(--color-glow)_0%,transparent_60%)]" />
        <div className="absolute left-[15%] top-[20%] h-[40vh] w-[40vh] rounded-full opacity-[0.08] bg-[radial-gradient(circle,var(--color-glow)_0%,transparent_70%)] blur-2xl" />
        <div className="absolute right-[10%] bottom-[15%] h-[50vh] w-[50vh] rounded-full opacity-[0.06] bg-[radial-gradient(circle,#c4b5fd_0%,transparent_70%)] blur-2xl" />
      </div>

      {/* Top-left: Clear */}
      <div className="absolute left-8 top-8 z-20 sm:left-12 sm:top-12">
        <button
          type="button"
          onClick={clearAll}
          className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.2em] opacity-30 transition-opacity hover:opacity-100"
          aria-label="Clear all"
        >
          [ Clear Surface ]
        </button>
      </div>

      {/* Released, dissolving texts */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        {released.map((r) => (
          <p
            key={r.id}
            className={`dissolving-text absolute text-balance text-center font-serif italic text-ink/50 ${
              r.size === "lg" ? "text-3xl sm:text-5xl" : r.size === "md" ? "text-2xl sm:text-4xl" : "text-xl sm:text-2xl"
            }`}
            style={{
              left: `calc(50% + ${r.left}vw)`,
              transform: `translateX(calc(-50% + ${r.drift}px))`,
              maxWidth: "min(56ch, 80vw)",
            }}
          >
            {r.text}
          </p>
        ))}
      </div>

      {/* Writing surface */}
      <main className="relative z-10 flex w-full max-w-3xl flex-col items-center">
        <div className="relative w-full text-center">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            rows={3}
            spellCheck={false}
            placeholder="Type the truth…"
            className="surface-input w-full resize-none break-words border-none bg-transparent text-center font-sans text-3xl font-light leading-relaxed tracking-tight text-ink outline-none placeholder:font-serif placeholder:italic placeholder:text-ink/15 focus:ring-0 sm:text-5xl lg:text-6xl"
            aria-label="Write what you want to release"
          />

          <p className="mt-10 font-serif text-base italic text-ink/25 transition-opacity duration-1000 sm:text-lg">
            <span className="hint-pulse">Press Enter to release.</span>
            <span className="ml-2 opacity-50">Shift + Enter for a new line.</span>
          </p>
        </div>
      </main>

      {/* Bottom-right: Counter */}
      <div className="absolute bottom-8 right-8 z-20 flex flex-col items-end gap-1 sm:bottom-12 sm:right-12">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-30">Sent away</span>
        <span className="font-mono text-2xl tabular-nums">{count.toLocaleString()}</span>
      </div>

      {/* Bottom-left: ambient quote */}
      <div className="pointer-events-none absolute bottom-8 left-8 hidden max-w-[220px] sm:block sm:bottom-12 sm:left-12">
        <p className="font-serif text-[11px] italic leading-relaxed text-ink/15">
          "The words go back to the sea, where they were never meant to stay."
        </p>
      </div>

      {/* Top-right: wordmark */}
      <div className="absolute right-8 top-8 z-20 flex flex-col items-end sm:right-12 sm:top-12">
        <h1 className="font-serif text-sm italic text-ink/50">Type &amp; Release</h1>
        <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.25em] text-ink/25">
          a quiet place
        </span>
      </div>
    </div>
  );
}
