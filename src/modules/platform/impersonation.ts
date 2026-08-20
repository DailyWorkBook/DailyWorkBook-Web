/** Where a redeemed bypass ticket lands. */
export const IMPERSONATION_CALLBACK_PATH = '/platform/impersonate';

/**
 * Opens a bypass session in a new tab.
 *
 * The new tab is the whole point: the operator's console session lives in
 * `localStorage` and the workspace session in the new tab's `sessionStorage`,
 * so the two coexist and neither can overwrite the other.
 *
 * The ticket travels in the URL because a tab that has not loaded yet has no
 * other channel — the callback spends it immediately and strips it from the
 * address bar. It is single-use and expires in under a minute.
 *
 * Returns false when the browser blocked the pop-up, so the caller can say so
 * rather than leaving the operator staring at a button that did nothing.
 */
export function openImpersonationTab(ticket: string): boolean {
  const url = `${window.location.origin}${IMPERSONATION_CALLBACK_PATH}?ticket=${encodeURIComponent(ticket)}`;
  const opened = window.open(url, '_blank', 'noopener');
  return opened !== null;
}
