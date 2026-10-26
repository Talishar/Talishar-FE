// Lowercase key a hotkey should match: digits by their physical row (AZERTY
// types symbols there), letters by their printed label (AZERTY/QWERTZ move Z
// and M), and non-Latin letters by their physical position.
export const shortcutKey = (event: KeyboardEvent): string => {
  const digit = /^Digit(\d)$/.exec(event.code);
  if (digit) return digit[1];
  const key = event.key ?? '';
  const letter = /^Key([A-Z])$/.exec(event.code);
  if (letter && key.length === 1 && key.charCodeAt(0) > 127)
    return letter[1].toLowerCase();
  return key.toLowerCase();
};
