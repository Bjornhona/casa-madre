"use client";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const TARGET_VOLUME = 0.3;

export function OceanSound({ src = "/ocean-waves-pixabay-RMultimediaEU.mp3" }: { src?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const raf = useRef<number | null>(null);
  const [on, setOn] = useState(false);

  const fadeTo = (target: number, onDone?: () => void) => {
    const el = audioRef.current;
    if (!el) return;
    if (raf.current) cancelAnimationFrame(raf.current);
    const step = () => {
      const diff = target - el.volume;
      if (Math.abs(diff) < 0.02) { el.volume = target; onDone?.(); return; }
      el.volume = Math.max(0, Math.min(1, el.volume + diff * 0.08));
      raf.current = requestAnimationFrame(step);
    };
    step();
  };

  const enable = async () => {
    const el = audioRef.current;
    if (!el || on) return;
    el.volume = TARGET_VOLUME;
    // el.volume = 0;
    // try { await el.play(); setOn(true); fadeTo(TARGET_VOLUME); } catch {}
    try { await el.play(); setOn(true); } catch {}
  };

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (on) { fadeTo(0, () => el.pause()); setOn(false); }
    else enable();
  };

  // Optional: start on the first interaction so it feels ambient/automatic
  useEffect(() => {
    const events = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
    const handler = () => { enable(); events.forEach(e => window.removeEventListener(e, handler)); };
    events.forEach(e => window.addEventListener(e, handler, { once: true, passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, handler));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" />
      <button
        type="button"
        onClick={toggle}
        aria-label={on ? "Mute ocean sound" : "Play ocean sound"}
        aria-pressed={on}
        className="fixed bottom-6 right-6 z-50 grid h-11 w-11 place-items-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
      >
        {on ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </button>
    </>
  );
}
