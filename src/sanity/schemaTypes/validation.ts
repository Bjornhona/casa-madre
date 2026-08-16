/**
 * Soft-required validation.
 *
 * `rule.required().warning(msg)` would show the same warning in the Studio, but
 * `sanity schema extract --enforce-required-fields` (see the `typegen` script)
 * reads the `required` flag regardless of its level and emits a non-nullable
 * type. Existing documents predate these fields and genuinely have no value, so
 * that type would be a lie — and the frontend guards that omit an empty legal
 * number would look dead while still being load-bearing at runtime.
 *
 * A custom rule warns just as loudly and keeps the generated type nullable.
 */
export const warnIfEmpty =
  (message: string) =>
  (value: unknown): true | string =>
    value === undefined || value === null || value === "" ? message : true;
