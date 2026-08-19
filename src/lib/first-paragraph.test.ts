import assert from "node:assert/strict";
import test, { describe } from "node:test";

import { firstParagraph } from "./first-paragraph.ts";

describe("firstParagraph", () => {
  test("takes the opening paragraph of a composer-written description", () => {
    const description = [
      "Una casa de 1928 en la parte alta de Sarrià, con jardín orientado al sur.",
      "La planta principal conserva el suelo hidráulico original.",
      "El jardín, de 320 m², rodea la casa por tres lados.",
    ].join("\n\n");

    assert.equal(
      firstParagraph(description),
      "Una casa de 1928 en la parte alta de Sarrià, con jardín orientado al sur.",
    );
  });

  test("returns a single-paragraph description unchanged", () => {
    assert.equal(firstParagraph("Un piso luminoso."), "Un piso luminoso.");
  });

  test("keeps soft line breaks inside the paragraph", () => {
    // A lone newline is a break within one paragraph, not between two: cutting
    // there would truncate a sentence the writer did not end.
    assert.equal(
      firstParagraph("Primera línea\nsegunda línea\n\nSegundo párrafo."),
      "Primera línea\nsegunda línea",
    );
  });

  test("handles Windows line endings and padded blank lines", () => {
    assert.equal(firstParagraph("Uno.\r\n\r\nDos."), "Uno.");
    assert.equal(firstParagraph("Uno.\n   \nDos."), "Uno.");
  });

  test("skips leading blank lines", () => {
    assert.equal(firstParagraph("\n\n  \n\nUno.\n\nDos."), "Uno.");
  });

  test("returns an empty string for empty input", () => {
    assert.equal(firstParagraph(""), "");
    assert.equal(firstParagraph(null), "");
    assert.equal(firstParagraph(undefined), "");
    assert.equal(firstParagraph("   \n\n  "), "");
  });
});
