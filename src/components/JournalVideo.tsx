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
 * The article measure is ~65ch; a 9:16 clip at that width would stand over
 * 1200px tall, so portrait clips are capped and centred instead.
 */
export function JournalVideo({ video, caption, title }: JournalVideoProps) {
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
    <figure className={isPortrait ? "mx-auto w-full max-w-[420px]" : "w-full"}>
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
          className="h-full w-full object-cover"
        />
      </div>

      {caption && (
        <figcaption className="mt-3 text-[14px] font-light leading-[1.6] text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
