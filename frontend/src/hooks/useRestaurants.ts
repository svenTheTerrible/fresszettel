import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Restaurant } from '../types';
import { listRestaurants, toRestaurant } from '../lib/restaurants';
import { useAuth } from '../demo/auth-context';

export interface UseRestaurantsResult {
  /** The logged-in user's restaurants, mapped onto the shared shape. */
  restaurants: Restaurant[];
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
    queryFn: () => listRestaurants().then((list) => list.map(toRestaurant)),
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
