export type DashboardInitialStatsResult<T> =
  | { status: 'success'; stats: T }
  | { status: 'error'; message: string };
