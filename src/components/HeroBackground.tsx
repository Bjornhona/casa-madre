"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

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

type SoundLabel = { unmute: string; mute: string };

type HeroBackgroundProps = {
  /** First-frame still — the LCP element. Paints instantly. */
  poster: string;
  videoMp4: string;
  /** Smaller VP9 alternate. Enable the <source> below once the file exists. */
  videoWebm?: string;
  /** `video` = cinemagraph clip; `kenburns` = lightweight slow-zoom still fallback. */
  mode?: "video" | "kenburns";
  /**
   * `warm` = subtle warm-dark gradient (best over a light/bright clip).
   * `light` = soft cream glow behind the centred content so the dark wordmark /
   * tagline stay legible over darker, more cinematic footage.
   */
  scrim?: "warm" | "light";
  soundLabel: SoundLabel;
};

export function HeroBackground({
  poster,
  videoMp4,
  videoWebm,
  mode = "video",
  scrim = "warm",
  soundLabel,
}: HeroBackgroundProps) {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Decided AFTER mount so SSR / first paint is the poster only (the LCP). We
  // never autoplay against reduced-motion preferences or on constrained links.
  const [shouldPlay, setShouldPlay] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [muted, setMuted] = useState(true);
  const [hasAudio, setHasAudio] = useState(false);

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

    setShouldPlay(true);
  }, [mode, reduce]);

  // Best-effort detection of whether the loaded clip carries an audio track;
  // the sound toggle stays hidden until there's actually something to unmute.
  const detectAudio = () => {
    const v = videoRef.current as
      | (HTMLVideoElement & {
          mozHasAudio?: boolean;
          webkitAudioDecodedByteCount?: number;
          audioTracks?: { length: number };
        })
      | null;
    if (!v) return;
    const audible =
      v.mozHasAudio === true ||
      (typeof v.webkitAudioDecodedByteCount === "number" &&
        v.webkitAudioDecodedByteCount > 0) ||
      (v.audioTracks != null && v.audioTracks.length > 0);
    if (audible) setHasAudio(true);
  };

  const handleCanPlay = () => {
    setVideoReady(true);
    detectAudio();
    videoRef.current?.play().catch(() => {});
  };

  const toggleSound = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    if (!next) v.play().catch(() => {});
    setMuted(next);
  };

  const showVideo = mode === "video" && shouldPlay;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Poster = LCP. Plain <img> with high fetch priority so it paints first. */}
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
          onLoadedData={detectAudio}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-out ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Enable once /hero/hero.webm is encoded — list it FIRST so VP9-capable
              browsers prefer the smaller file. Kept commented because a missing
              source 404 can abort playback. */}
          {/* {videoWebm && <source src={videoWebm} type="video/webm" />} */}
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

      {/* Opt-in sound toggle (OFF by default). Hidden until a clip with audio loads. */}
      {showVideo && hasAudio && (
        <motion.button
          type="button"
          onClick={toggleSound}
          aria-pressed={!muted}
          aria-label={muted ? soundLabel.unmute : soundLabel.mute}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute bottom-6 left-6 z-30 grid h-11 w-11 place-items-center rounded-full bg-deep/30 text-cream backdrop-blur-sm transition-colors hover:bg-deep/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/70"
        >
          <motion.span
            key={muted ? "off" : "on"}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {muted ? (
              <VolumeX className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <Volume2 className="h-5 w-5" strokeWidth={1.5} />
            )}
          </motion.span>
        </motion.button>
      )}
    </div>
  );
}
