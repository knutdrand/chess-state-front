/**
 * Android back button: the most recently opened dialog closes first; then
 * App.tsx falls back to the Play tab, then leaves the app.
 */
type Handler = () => void;
const handlers: Handler[] = [];

export function pushBackHandler(handler: Handler): () => void {
  handlers.push(handler);
  return () => {
    const i = handlers.lastIndexOf(handler);
    if (i >= 0) handlers.splice(i, 1);
  };
}

/** Runs the newest handler; returns false when there was none. */
export function runBackHandler(): boolean {
  const handler = handlers[handlers.length - 1];
  if (!handler) return false;
  handler();
  return true;
}
