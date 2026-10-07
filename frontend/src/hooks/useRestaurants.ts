import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { RestaurantSummary } from '../lib/restaurants';
import { listRestaurants } from '../lib/restaurants';
import { useAuth } from '../demo/auth-context';

export interface UseRestaurantsResult {
  /** The logged-in user's restaurants, exactly as returned by the backend. */
  restaurants: RestaurantSummary[];
  /** True while the first fetch is in flight. */
  isLoading: boolean;
  /** True when the backend call failed. */
  isError: boolean;
  /** The underlying error, when `isError` is true. */
  error: Error | null;
  /** Drop the cached list and refetch. */
  refresh: () => void;
}

/**
 * Load the logged-in user's restaurants via react-query, so the list is
 * cached (and de-duplicated across components) instead of refetched on every
 * navigation.
 */
export function useRestaurants(): UseRestaurantsResult {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['restaurants', token],
    queryFn: listRestaurants,
    enabled: Boolean(token),
  });

  return {
    restaurants: data ?? [],
    isLoading,
    isError,
    error,
    refresh: () =>
      queryClient.invalidateQueries({ queryKey: ['restaurants', token] }),
  };
}
