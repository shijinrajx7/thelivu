export const DATA_CHANGED = 'thelivu:data-changed';
export function announceDataChange(): void {
  window.dispatchEvent(new CustomEvent(DATA_CHANGED));
}
