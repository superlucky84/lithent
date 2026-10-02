/**
 * Value-container shapes, declared here rather than imported from
 * `lithent/helper`.
 *
 * They are structurally identical to that package's `State` / `Computed`, so
 * anything produced here is assignable where those are expected — TypeScript is
 * structural. Declaring them locally keeps this package's dependency on the
 * base core's helper at zero, which matters because the two ship separately and
 * build in an order that would otherwise have to be pinned.
 */
export type State<T> = {
  value: T;
  v: T;
};

export type Computed<T> = {
  readonly value: T;
  readonly v: T;
};
