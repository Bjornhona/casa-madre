/**
 * Long text fields are stored as one string with paragraphs separated by a
 * blank line — that is how the Studio composer joins them, and how an editor
 * types them by hand. In HTML those breaks collapse to a single space, so
 * anything printing the raw field runs every paragraph together into one block
 * of prose.
 *
 * `\s*` between the newlines absorbs \r\n endings and whitespace-only lines.
 */
const PARAGRAPH_BREAK = /\n\s*\n/;

/**
 * Every paragraph of such a field, in order, with blanks dropped — callers
 * render one <p> per entry.
 *
 * A field with no blank line anywhere is a single paragraph. Empty, blank or
 * missing input gives [], so callers can test `.length`.
 */
export function paragraphs(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(PARAGRAPH_BREAK)
    .map((block) => block.trim())
    .filter((block) => block !== "");
}

/**
 * The first paragraph only.
 *
 * Cards take it and clamp it with CSS. Splitting first is what makes the clamp
 * safe: clamping the joined string would let the visible lines run past the end
 * of the opening paragraph and cut mid-sentence somewhere in the second, which
 * reads as a fragment of a thought the reader never started. Taking paragraph
 * one means the preview always ends where the writing does, or is trimmed
 * within a passage that opened in view.
 *
 * Returns "" for empty input, so callers can keep using a plain falsy check.
 */
export function firstParagraph(text: string | null | undefined): string {
  return paragraphs(text)[0] ?? "";
}
