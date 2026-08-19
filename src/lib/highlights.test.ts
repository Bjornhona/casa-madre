import assert from "node:assert/strict";
import test, { describe } from "node:test";

import { dropRestatedHighlights, type PropertyFacts } from "./highlights.ts";

/**
 * Unit tests for the highlight filter. Run with `pnpm test:unit` — plain
 * `node:test` with Node's type stripping, no test framework: the module under
 * test is a pure function with a single type-only import, so nothing needs
 * transpiling or mocking.
 *
 * The governing rule is asymmetric, and the cases below are grouped to make it
 * visible: dropping a real feature loses information the client wrote by hand,
 * while keeping a duplicate is a cosmetic blemish. Every "keeps" case is
 * therefore load-bearing — when in doubt the filter must fail towards keeping.
 */

/** The brief's worked example: a 320 m² house in Sarrià. */
const CASA: PropertyFacts = {
  bedrooms: 5,
  bathrooms: 4,
  surface: 320,
  surfaceUtil: 295,
  propertyType: "casa",
  neighbourhood: "Sarrià",
};

const filter = (highlights: string[], facts: PropertyFacts = CASA) =>
  dropRestatedHighlights(highlights, facts);

/** Asserts one tag at a time, so a failure names the exact string. */
const assertDropped = (highlights: string[], facts: PropertyFacts = CASA) => {
  for (const highlight of highlights) {
    assert.deepEqual(
      filter([highlight], facts),
      [],
      `expected ${JSON.stringify(highlight)} to be dropped`,
    );
  }
};

const assertKept = (highlights: string[], facts: PropertyFacts = CASA) => {
  for (const highlight of highlights) {
    assert.deepEqual(
      filter([highlight], facts),
      [highlight],
      `expected ${JSON.stringify(highlight)} to be kept`,
    );
  }
};

describe("dropRestatedHighlights", () => {
  describe("the brief's example property (es)", () => {
    test("drops tags that restate a structured field", () => {
      assertDropped(["5 dormitorios", "320 m²", "4 baños", "Sarrià", "Casa"]);
    });

    test("keeps tags that carry information of their own", () => {
      assertKept([
        "Reformada 2022",
        "Piscina",
        "Zona de juegos",
        "Terraza orientada al sur",
        "Vistas al parque",
      ]);
    });

    test("filters a whole list in one pass, preserving order", () => {
      assert.deepEqual(
        filter([
          "5 dormitorios",
          "Piscina",
          "320 m²",
          "Reformada 2022",
          "Sarrià",
          "Vistas al parque",
        ]),
        ["Piscina", "Reformada 2022", "Vistas al parque"],
      );
    });
  });

  describe("the same property in English", () => {
    const facts: PropertyFacts = { ...CASA, neighbourhood: "Sarrià" };

    test("drops tags that restate a structured field", () => {
      assertDropped(
        ["5 bedrooms", "320 m²", "4 bathrooms", "Sarrià", "House"],
        facts,
      );
    });

    test("keeps tags that carry information of their own", () => {
      assertKept(
        [
          "Renovated 2022",
          "Swimming pool",
          "Playground",
          "South-facing terrace",
          "Park views",
        ],
        facts,
      );
    });
  });

  describe("counted rooms", () => {
    test("accepts the vocabulary of both languages", () => {
      assertDropped([
        "5 dormitorios",
        "5 habitaciones",
        "5 bedrooms",
        "5 beds",
        "4 baños",
        "4 bathrooms",
        "4 baths",
      ]);
    });

    test("matches the singular when the property has one", () => {
      const studio: PropertyFacts = {
        bedrooms: 1,
        bathrooms: 1,
        propertyType: "estudio",
      };
      assertDropped(["1 dormitorio", "1 bedroom", "1 baño", "1 bathroom"], studio);
    });

    test("keeps a count that does not match the structured value", () => {
      // Contradicting the datos table is information, even if it is wrong
      // information — silently deleting it hides the discrepancy from the editor.
      assertKept(["3 dormitorios", "2 baños", "6 bedrooms"]);
    });

    test("keeps a matching count that has been qualified", () => {
      assertKept([
        "5 dormitorios dobles",
        "5 dormitorios en suite",
        "4 baños completos",
        "4 bathrooms en suite",
      ]);
    });

    test("keeps a bare number and a bare noun", () => {
      assertKept(["5", "Dormitorios", "Bedrooms"]);
    });
  });

  describe("surface areas", () => {
    test("matches either surface field and the usual unit spellings", () => {
      assertDropped([
        "320 m²",
        "320m²",
        "320 m2",
        "320 metros cuadrados",
        "320 sqm",
        "295 m²",
        "295 m2",
      ]);
    });

    test("drops a surface qualified as built or usable", () => {
      // "320 m² construidos" restates the same field under its own label.
      assertDropped([
        "320 m² construidos",
        "295 m² útiles",
        "320 m² built",
        "295 m² usable",
      ]);
    });

    test("keeps a surface that measures something else", () => {
      // The number coincides with the built area, but the subject is a garden.
      assertKept(["320 m² de jardín", "320 m² de terraza", "Jardín de 320 m²"]);
    });

    test("understands a thousands separator", () => {
      assertDropped(["1.200 m²", "1200 m²"], { surface: 1200 });
    });

    test("keeps a plain year, which is not a measurement", () => {
      assertKept(["Reformada 2022", "Construida en 1920"], { surface: 2022 });
    });
  });

  describe("neighbourhood", () => {
    test("ignores case and accents", () => {
      assertDropped(["Sarrià", "sarrià", "SARRIÀ", "Sarria"]);
    });

    test("matches either half of a compound district name", () => {
      const facts: PropertyFacts = { neighbourhood: "Sarrià-Sant Gervasi" };
      assertDropped(["Sarrià-Sant Gervasi", "Sarrià", "Sant Gervasi"], facts);
    });

    test("keeps a phrase that merely mentions the neighbourhood", () => {
      assertKept(["Corazón de Sarrià", "En lo alto de Sarrià", "Sarrià views"]);
    });
  });

  describe("property type", () => {
    test("matches the labels used on the site and the ficha", () => {
      assertDropped(["Casa", "casa", "Chalet", "House"]);
      assertDropped(["Piso", "Apartment", "Flat"], { propertyType: "piso" });
      assertDropped(["Ático", "Atico", "Penthouse"], { propertyType: "atico" });
      assertDropped(["Dúplex", "Duplex"], { propertyType: "duplex" });
      assertDropped(["Estudio", "Studio"], { propertyType: "estudio" });
      assertDropped(["Local comercial", "Local"], { propertyType: "local" });
    });

    test("keeps the name of a different type", () => {
      assertKept(["Piso", "Ático", "Estudio"]);
    });

    test("keeps a phrase built around the type", () => {
      assertKept(["Casa con jardín", "Casa de pueblo", "House with garden"]);
    });
  });

  describe("input handling", () => {
    test("returns the original strings, not normalized ones", () => {
      assert.deepEqual(filter(["  Piscina  "]), ["  Piscina  "]);
    });

    test("drops empty and whitespace-only tags", () => {
      assert.deepEqual(filter(["", "   ", "Piscina"]), ["Piscina"]);
    });

    test("tolerates a missing highlights array", () => {
      assert.deepEqual(dropRestatedHighlights(null, CASA), []);
      assert.deepEqual(dropRestatedHighlights(undefined, CASA), []);
    });

    test("keeps everything when nothing is known about the property", () => {
      const empty: PropertyFacts = {};
      assertKept(["5 dormitorios", "320 m²", "Sarrià", "Casa"], empty);
    });

    test("ignores trailing punctuation", () => {
      assertDropped(["Sarrià.", "5 dormitorios,"]);
    });
  });
});
