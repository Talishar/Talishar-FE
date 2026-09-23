import Button from 'features/Button';

const SHORTCUT_KEYS: { [popupId: string]: { [buttonInput: string]: string } } =
  {
    YESNO: { YES: 'Y', NO: 'N' },
    OK: { OK: 'Enter' }
  };

const TEXT_ENTRY_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

export const promptShortcutKey = (
  popupId: string,
  button: Button
): string | undefined => SHORTCUT_KEYS[popupId]?.[String(button.buttonInput)];

export const shortcutBlockedByFocus = (event: KeyboardEvent): boolean => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable || TEXT_ENTRY_TAGS.has(target.tagName))
    return true;
  return (
    event.key === 'Enter' && !!target.closest('button, a, [role="button"]')
  );
};
