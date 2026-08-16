// Phone formatting — shared by the Sanity `agent` documents and LEGAL_DATA.
//
// Stored numbers are inconsistent by design: the agent schema's regex allows an
// optional leading "+", and CLIENT_CONTACT_PHONE may or may not carry one. Both
// used to be displayed by string-concatenating a "+", which produces "++34…"
// when the value already had one and "+undefined" when it was missing entirely.
// These helpers normalise to digits first, so neither is possible.

/** Bare international digits, no "+" and no separators. Empty when there is
 *  nothing usable — callers use this for `wa.me` links. */
export const agentPhoneDigits = (phone?: string | null): string =>
  (phone ?? "").replace(/\D/g, "");

/** Display / `tel:` form: exactly one leading "+", or "" when there is no
 *  number. Never "+undefined", never "++34…". */
export const formatAgentPhone = (phone?: string | null): string => {
  const digits = agentPhoneDigits(phone);
  return digits ? `+${digits}` : "";
};
