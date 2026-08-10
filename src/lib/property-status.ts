/**
 * Property status — one stored value, two possible labels.
 *
 * Sanity stores a single `status` ("disponible" | "reservado" | "vendido") so
 * the client has one control to think about. "vendido" covers both closed
 * operations, but a rented flat must not read "Vendido", so the display label
 * is derived here from `operation` rather than stored as a fourth option.
 *
 * `status` is typed non-nullable (typegen runs with --enforce-required-fields)
 * but documents created before the field existed return null at runtime, hence
 * the tolerant input type: anything unrecognised is treated as available.
 */

export type PropertyStatus = "disponible" | "reservado" | "vendido";

/** Message key under `propertyPage.status`, or null when nothing should show. */
export function statusLabelKey(
  status: PropertyStatus | string | null | undefined,
  operation: string | null | undefined,
): "reservado" | "vendido" | "alquilado" | null {
  if (status === "reservado") return "reservado";
  if (status === "vendido") {
    return operation === "alquiler" ? "alquilado" : "vendido";
  }
  return null;
}

/** True once the operation is closed — the only case that softens the card. */
export function isClosed(
  status: PropertyStatus | string | null | undefined,
): boolean {
  return status === "vendido";
}
