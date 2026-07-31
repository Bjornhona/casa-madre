"use client";

import { useTranslations } from "next-intl";
import { posterUrl, videoUrl } from "@/lib/cloudinary";
import type { JOURNAL_POST_BY_SLUG_QUERY_RESULT } from "@/sanity/types.gen";

type Post = NonNullable<JOURNAL_POST_BY_SLUG_QUERY_RESULT>;

type JournalVideoProps = {
  video: NonNullable<Post["video"]>;
  caption: Post["videoCaption"];
  /** Article title, used to build the accessible label. */
  title: Post["title"];
  /**
   * Tailwind max-width cap for portrait clips. Owned by the caller so the
   * component doesn't assume one context — the hero band is tighter than a
   * full editorial measure would be.
   */
  portraitMaxWidth: string;
};

/**
 * The owner-interview video for a Journal article.
 *
 * These are filmed vertically for Instagram and carry sound, so they're
 * click-to-play with native controls: browsers block autoplay with audio, which
 * means there's no autoplay behaviour to build and nothing to gate behind
 * reduced-motion. Scrub, volume and fullscreen all matter, and the native
 * control bar gives them for free.
 *
 * Width is derived from the stored dimensions rather than chosen by the editor.
 * A 9:16 clip at a full editorial measure would stand over 1200px tall, so
 * portrait clips are capped and centred instead.
 *
 * It renders on the dark hero band, hence the light caption and focus tones.
 */
export function JournalVideo({
  video,
  caption,
  title,
  portraitMaxWidth,
}: JournalVideoProps) {
  const t = useTranslations("journal");

  const publicId = video.publicId;
  if (!publicId) return null;

  const { width, height } = video;
  const ratio = width && height ? width / height : null;
  const isPortrait = ratio !== null && ratio < 1;

  // Reserve the real aspect ratio so the poster swap causes no layout shift.
  // Portrait is the safe default for the rare asset missing its dimensions —
  // these are vertical interviews.
  const aspectRatio = ratio !== null ? `${width} / ${height}` : "9 / 16";

  const label = title ? t("videoLabel", { title }) : t("videoLabelGeneric");

  return (
    <figure
      className={isPortrait ? `mx-auto w-full ${portraitMaxWidth}` : "w-full"}
    >
      <div
        className="overflow-hidden rounded-card bg-cream"
        style={{ aspectRatio }}
      >
        <video
          src={videoUrl(publicId)}
          poster={posterUrl(publicId)}
          controls
          playsInline
          preload="none"
          aria-label={label}
          // Ring offset sits against the band rather than the backdrop image,
          // so focus stays legible however bright the editor's cover photo is.
          className="h-full w-full object-cover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-deep"
        />
      </div>

      {caption && (
        <figcaption className="mt-3 text-[14px] font-light leading-[1.6] text-sand">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
