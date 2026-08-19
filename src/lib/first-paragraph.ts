/**
 * The first paragraph of a multi-paragraph text field.
 *
 * Property descriptions are stored as one string with paragraphs separated by a
 * blank line — that is how the Studio composer joins them, and how an editor
 * types them by hand. In HTML those breaks collapse to a single space, so a
 * card that prints the whole field runs every paragraph together into one
 * block of prose.
 *
 * Cards take the first paragraph and clamp it with CSS. Splitting first is what
 * makes the clamp safe: clamping the joined string would let the visible lines
 * run past the end of the opening paragraph and cut mid-sentence somewhere in
 * the second, which reads as a fragment of a thought the reader never started.
 * Taking paragraph one means the preview always ends where the writing does or
 * is trimmed within a passage that opened in view.
 *
 * Returns "" for empty input, so callers can keep using a plain falsy check.
 */
export function firstParagraph(text: string | null | undefined): string {
  if (!text) return "";

  // `\s*` between the newlines absorbs \r\n endings and whitespace-only lines.
  for (const block of text.split(/\n\s*\n/)) {
    const trimmed = block.trim();
    if (trimmed !== "") return trimmed;
  }

  // No blank line anywhere: the whole field is one paragraph.
  return text.trim();
}
