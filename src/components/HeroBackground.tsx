"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

/*
 * Target encode settings for the hero assets (encode the real files to match):
 *
 *   hero.mp4   — H.264, ~1080p, CRF ~24–28, no audio (or AAC ~96kbps),
 *                yuv420p, faststart, ~5–8s seamless loop, target < 3 MB.
 *   hero.webm  — VP9 (or AV1), same clip, smaller alternate for modern browsers.
 *   hero-poster.jpg — high-quality first frame of the clip; this is the LCP.
 *
 *   ffmpeg -i src.mov -an -c:v libx264 -crf 26 -pix_fmt yuv420p \
 *     -movflags +faststart -vf scale=1920:-2 hero.mp4
 *   ffmpeg -i src.mov -an -c:v libvpx-vp9 -crf 33 -b:v 0 hero.webm
 */

type HeroBackgroundProps = {
  /** First-frame still — the LCP element. Paints instantly. */
  poster: string;
  videoMp4: string;
  /** `video` = cinemagraph clip; `kenburns` = lightweight slow-zoom still fallback. */
  mode?: "video" | "kenburns";
  /**
   * `warm` = subtle warm-dark gradient (best over a light/bright clip).
   * `light` = soft cream glow behind the centred content so the dark wordmark /
   * tagline stay legible over darker, more cinematic footage.
   */
  scrim?: "warm" | "light";
};

export function HeroBackground({
  poster,
  videoMp4,
  mode = "video",
  scrim = "warm",
}: HeroBackgroundProps) {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Decided AFTER mount so SSR / first paint is the poster only (the LCP). We
  // never autoplay against reduced-motion preferences or on constrained links.
  const [shouldPlay, setShouldPlay] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (mode !== "video") return;
    if (reduce) return; // reduced motion → poster only, no autoplay

    // Data-saver / very slow connections → poster only (Network Information API).
    const conn = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType ?? ""))) {
      return;
    }

    // One-time, post-mount decision based on client-only APIs (matchMedia via
    // useReducedMotion + Network Information API) that aren't available during
    // SSR — this is the intended "enable after first paint" pattern, not derived
    // state we could compute during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShouldPlay(true);
  }, [mode, reduce]);

  const handleCanPlay = () => {
    setVideoReady(true);
    videoRef.current?.play().catch(() => {});
  };

  const showVideo = mode === "video" && shouldPlay;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Poster = LCP. Deliberately a plain <img> with fetchPriority="high" so the
          first frame paints instantly; next/image's loader would add indirection
          on the most performance-critical element. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt=""
        aria-hidden
        fetchPriority="high"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-cover ${
          mode === "kenburns" ? "animate-ken-burns" : ""
        }`}
      />

      {showVideo && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          poster={poster}
          aria-hidden
          onCanPlay={handleCanPlay}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-out ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Enable once /hero/hero.webm is encoded — list it FIRST so VP9-capable
              browsers prefer the smaller file. Kept commented because a missing
              source 404 can abort playback. */}
          {/* <source src="/hero/hero.webm" type="video/webm" /> */}
          <source src={videoMp4} type="video/mp4" />
        </video>
      )}

      {/* Warm dark overlay: faint top tint + a deeper foot so overlaid text stays legible. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-deep/10 via-transparent to-deep/35" />

      {/* Optional light scrim: a soft cream glow behind the centred content so the
          dark wordmark / tagline stay legible over darker, more cinematic footage. */}
      {scrim === "light" && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 62% 54% at 50% 46%, color-mix(in srgb, var(--color-cream) 60%, transparent), transparent 72%)",
          }}
        />
      )}
    </div>
  );
}
