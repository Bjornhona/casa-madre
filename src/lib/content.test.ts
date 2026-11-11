import assert from "node:assert/strict";
import test, { describe } from "node:test";

import { filled, isEmpty, splitLabel } from "./content.ts";

describe("isEmpty", () => {
  test("treats every shape of blank catalog copy as empty", () => {
    // The exact set a section must refuse to render a heading for.
    assert.equal(isEmpty(""), true);
    assert.equal(isEmpty("   "), true);
    assert.equal(isEmpty([]), true);
    assert.equal(isEmpty([""]), true);
    assert.equal(isEmpty(["  ", ""]), true);
  });

  test("treats missing values as empty", () => {
    assert.equal(isEmpty(null), true);
    assert.equal(isEmpty(undefined), true);
  });

  test("is not fooled by truthiness", () => {
    // Both of these are truthy; neither has anything to show.
    assert.ok("   ");
    assert.ok([""].length);
    assert.equal(isEmpty("   "), true);
    assert.equal(isEmpty([""]), true);
  });

  test("copy with any real content is not empty", () => {
    assert.equal(isEmpty("Hola"), false);
    assert.equal(isEmpty(["Hola"]), false);
    assert.equal(isEmpty(["", "Hola"]), false);
    assert.equal(isEmpty(["  ", "Hola", ""]), false);
  });
});

describe("filled", () => {
  test("wraps a single string into one entry", () => {
    assert.deepEqual(filled("Un párrafo."), ["Un párrafo."]);
  });

  test("keeps multi-paragraph copy in order", () => {
    assert.deepEqual(filled(["Uno.", "Dos.", "Tres."]), [
      "Uno.",
      "Dos.",
      "Tres.",
    ]);
  });

  test("drops blank entries but keeps the real ones", () => {
    // A section with some blanks renders only the non-blank ones.
    assert.deepEqual(filled(["Uno.", "", "   ", "Dos."]), ["Uno.", "Dos."]);
  });

  test("returns nothing for blank or missing values", () => {
    assert.deepEqual(filled(""), []);
    assert.deepEqual(filled("   "), []);
    assert.deepEqual(filled([]), []);
    assert.deepEqual(filled([""]), []);
    assert.deepEqual(filled(["  ", ""]), []);
    assert.deepEqual(filled(null), []);
    assert.deepEqual(filled(undefined), []);
  });

  test("leaves surviving copy exactly as authored", () => {
    assert.deepEqual(filled([" Uno. "]), [" Uno. "]);
  });
});

describe("splitLabel", () => {
  test("splits the concierge pattern into label and body", () => {
    assert.deepEqual(
      splitLabel("En casa — limpieza puntual, mantenimiento, jardinería."),
      { label: "En casa", rest: "limpieza puntual, mantenimiento, jardinería." },
    );
  });

  test("returns an entry with no em-dash unchanged", () => {
    assert.deepEqual(splitLabel("Análisis de rentabilidad"), {
      rest: "Análisis de rentabilidad",
    });
  });

  test("ignores dashes that are not a spaced em-dash", () => {
    // Hyphens and en-dashes are punctuation here, not a label marker.
    assert.deepEqual(splitLabel("Compra-venta de activos"), {
      rest: "Compra-venta de activos",
    });
    assert.deepEqual(splitLabel("Horario 9–14 h"), { rest: "Horario 9–14 h" });
    // An em-dash without the surrounding spaces is not the separator either.
    assert.deepEqual(splitLabel("Uno—dos"), { rest: "Uno—dos" });
  });

  test("splits only on the first separator", () => {
    assert.deepEqual(splitLabel("Label — body — with a dash inside"), {
      label: "Label",
      rest: "body — with a dash inside",
    });
  });

  test("leaves degenerate entries alone rather than emptying either side", () => {
    assert.deepEqual(splitLabel(" — body"), { rest: " — body" });
    assert.deepEqual(splitLabel("Label — "), { rest: "Label — " });
  });
});
