import assert from "node:assert/strict";
import test, { describe } from "node:test";

import { gridColumns } from "./services.ts";

describe("gridColumns", () => {
  test("picks a column count that leaves no orphan cell", () => {
    assert.equal(gridColumns(8), 4); // 2 rows of 4
    assert.equal(gridColumns(6), 3); // 2 rows of 3
    assert.equal(gridColumns(9), 3); // 3 rows of 3
    assert.equal(gridColumns(4), 4); // 1 row of 4
    assert.equal(gridColumns(10), 2); // 5 rows of 2
  });

  test("prefers the widest option when several divide evenly", () => {
    // 12 divides by 4, 3 and 2 — the widest wins.
    assert.equal(gridColumns(12), 4);
  });

  test("falls back to the widest option for a count with no clean split", () => {
    // Primes can't avoid a gap; don't contort the layout trying.
    assert.equal(gridColumns(7), 4);
    assert.equal(gridColumns(5), 4);
  });

  test("honours a custom candidate list, widest-first", () => {
    assert.equal(gridColumns(8, [2, 3]), 2);
    assert.equal(gridColumns(9, [2, 3]), 3);
  });
});
