/** Instance ownership. Creation itself starts no external work. */
export type Cleanup = () => void;
export type CleanupErrorReporter = (error: unknown) => void;

export interface OwnerScope {
  readonly disposed: boolean;
  own(cleanup: Cleanup): Cleanup;
  dispose(): void;
}

export const createOwnerScope = (): OwnerScope => {
  let disposed = false;
  const cleanups = new Set<Cleanup>();

  const own = (cleanup: Cleanup): Cleanup => {
    let live = true;
    const release = () => {
      if (!live) return;
      live = false;
      cleanups.delete(release);
      cleanup();
    };
    if (disposed) release();
    else cleanups.add(release);
    return release;
  };

  return {
    get disposed() {
      return disposed;
    },
    own,
    dispose() {
      if (disposed) return;
      disposed = true;
      const pending = [...cleanups];
      cleanups.clear();
      const errors: unknown[] = [];
      for (const cleanup of pending) {
        try {
          cleanup();
        } catch (error) {
          errors.push(error);
        }
      }
      if (errors.length)
        throw new AggregateError(errors, 'Owner cleanup failed');
    },
  };
};
