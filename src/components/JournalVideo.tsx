"use client";

import { useId } from "react";
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
 * It renders on the dark hero band, hence the light focus tones.
 *
 * The caption is kept in a <figcaption> but visually hidden. These interviews
 * have no subtitles or transcript, so it's the only text description of what
 * the video contains — it has to survive for assistive tech and for crawlers,
 * and sr-only keeps it real text in the server-rendered HTML rather than an
 * attribute. It's wired to the <video> with aria-describedby so it's announced
 * as the video's description, leaving aria-label short: the label already
 * carries the article title, and appending the caption would make it a
 * paragraph read out on every focus.
 */
export function JournalVideo({
  video,
  caption,
  title,
  portraitMaxWidth,
}: JournalVideoProps) {
  const t = useTranslations("journal");
  const captionId = useId();

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

  // Most articles have no caption. Treating whitespace as absent keeps the
  // empty case to a single state: no <figcaption>, and aria-describedby is
  // omitted entirely rather than pointing at an id that isn't in the document.
  const captionText = caption?.trim() ? caption.trim() : null;

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
          aria-describedby={captionText ? captionId : undefined}
          // Ring offset sits against the band rather than the backdrop image,
          // so focus stays legible however bright the editor's cover photo is.
          className="h-full w-full object-cover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream focus-visible:ring-offset-2 focus-visible:ring-offset-deep"
        />
      </div>

      {captionText && (
        <figcaption id={captionId} className="sr-only">
          {captionText}
        </figcaption>
      )}
    </figure>
  );
}
