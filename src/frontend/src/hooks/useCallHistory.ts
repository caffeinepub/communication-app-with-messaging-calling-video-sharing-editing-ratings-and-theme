import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { CallLogEntry } from '@/backend';

export function useCallHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<CallLogEntry[]>({
    queryKey: ['callHistory'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallHistory();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000, // Poll every 5 seconds like conversations
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}
