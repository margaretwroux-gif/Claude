"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { logFocusSession } from "@/app/actions";

const MODES = {
  focus: { label: "Focus", minutes: 25 },
  short: { label: "Short break", minutes: 5 },
  long: { label: "Long break", minutes: 15 },
} as const;
type Mode = keyof typeof MODES;

function fmt(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function chime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  } catch {
    // Audio is a nicety; ignore if unavailable.
  }
}

export function FocusTimer() {
  const [mode, setMode] = useState<Mode>("focus");
  const [length, setLength] = useState<number>(MODES.focus.minutes);
  const [label, setLabel] = useState("");
  // When running, `endsAt` is the wall-clock deadline; when paused, `remaining` holds the time left.
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(length * 60_000);
  const [now, setNow] = useState(() => Date.now());
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const finishing = useRef(false);

  const left = endsAt !== null ? endsAt - now : remaining;
  const elapsedMinutes = Math.floor((length * 60_000 - left) / 60_000);

  const reset = useCallback((nextMode: Mode, minutes: number) => {
    setMode(nextMode);
    setLength(minutes);
    setEndsAt(null);
    setRemaining(minutes * 60_000);
  }, []);

  const save = useCallback(
    (minutes: number) => {
      if (minutes < 1) return;
      startTransition(async () => {
        await logFocusSession(label, minutes);
        setStatus(`Logged ${minutes} min${label ? ` · ${label}` : ""}`);
      });
    },
    [label],
  );

  useEffect(() => {
    if (endsAt === null) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [endsAt]);

  useEffect(() => {
    if (endsAt === null || left > 0 || finishing.current) return;
    finishing.current = true;
    chime();
    if (mode === "focus") save(length);
    else setStatus("Break over — ready to focus?");
    reset(mode === "focus" ? "short" : "focus", mode === "focus" ? MODES.short.minutes : MODES.focus.minutes);
    finishing.current = false;
  }, [left, endsAt, mode, length, save, reset]);

  useEffect(() => {
    document.title = endsAt !== null ? `${fmt(left)} · ${MODES[mode].label}` : "Productivity Dashboard";
  }, [left, endsAt, mode]);

  const running = endsAt !== null;
  const progress = 1 - left / (length * 60_000);

  return (
    <div className="card">
      <div className="mb-5 flex flex-wrap gap-1">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => reset(m, MODES[m].minutes)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              m === mode
                ? "bg-indigo-600 text-white"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      <div className="text-center">
        <div className="font-mono text-6xl font-semibold tabular-nums sm:text-7xl" aria-live="off">
          {fmt(left)}
        </div>
        <div className="mx-auto mt-4 h-1.5 max-w-sm overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="h-full bg-indigo-600 transition-[width]" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-sm flex-col gap-2">
        {mode === "focus" && (
          <input
            className="input"
            placeholder="What are you working on?"
            value={label}
            maxLength={120}
            onChange={(e) => setLabel(e.target.value)}
          />
        )}
        <label className="flex items-center justify-between gap-2 text-sm text-zinc-500">
          Length (minutes)
          <input
            type="number"
            min={1}
            max={180}
            className="input w-24"
            value={length}
            disabled={running}
            onChange={(e) => {
              const v = Math.min(180, Math.max(1, Number(e.target.value) || 1));
              reset(mode, v);
            }}
          />
        </label>
        <div className="flex gap-2">
          {running ? (
            <button
              type="button"
              className="btn flex-1"
              onClick={() => {
                setRemaining(left);
                setEndsAt(null);
              }}
            >
              Pause
            </button>
          ) : (
            <button
              type="button"
              className="btn flex-1"
              onClick={() => {
                setStatus(null);
                setNow(Date.now());
                setEndsAt(Date.now() + remaining);
              }}
            >
              {remaining < length * 60_000 ? "Resume" : "Start"}
            </button>
          )}
          {mode === "focus" && elapsedMinutes >= 1 && (
            <button
              type="button"
              className="btn bg-zinc-700 hover:bg-zinc-600"
              disabled={isPending}
              onClick={() => {
                save(elapsedMinutes);
                reset("focus", length);
              }}
            >
              Finish &amp; log {elapsedMinutes}m
            </button>
          )}
          <button type="button" className="btn-ghost" onClick={() => reset(mode, length)}>
            Reset
          </button>
        </div>
        {status && <p className="text-center text-sm text-emerald-600 dark:text-emerald-400">{status}</p>}
      </div>
    </div>
  );
}
