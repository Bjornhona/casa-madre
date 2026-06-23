"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Volume2, VolumeX } from "lucide-react";

const TARGET_VOLUME = 0.3;

export function OceanSound({ src = "/ocean-waves-pixabay-RMultimediaEU.mp3" }: { src?: string }) {
  const t = useTranslations("hero.sound");
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
      {/* Lives inside the hero (the section is `relative`) so it scrolls away with
          it, rather than persisting as a fixed control over the whole page. */}
      <button
        type="button"
        onClick={toggle}
        aria-label={on ? t("mute") : t("unmute")}
        aria-pressed={on}
        className="absolute bottom-6 left-6 z-10 grid h-11 w-11 place-items-center rounded-full bg-deep/30 text-cream backdrop-blur-sm transition-colors hover:bg-deep/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70"
      >
        {on ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </button>
    </>
  );
}
