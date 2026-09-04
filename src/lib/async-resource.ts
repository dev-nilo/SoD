/**
 * Runs an async fetch with the load → cancel-on-unmount → settle shape every
 * "composition root" hook in this codebase needs. No React: hooks call this
 * from a useEffect and return the cancel function as its cleanup.
 */
export function loadResource<T>(
  fetcher: () => Promise<T>,
  handlers: {
    onData: (data: T) => void;
    onError: (err: unknown) => void;
    onSettled: () => void;
  }
): () => void {
  let cancelled = false;

  fetcher()
    .then((data) => {
      if (cancelled) return;
      handlers.onData(data);
    })
    .catch((err) => {
      if (cancelled) return;
      handlers.onError(err);
    })
    .finally(() => {
      if (!cancelled) handlers.onSettled();
    });

  return () => {
    cancelled = true;
  };
}
