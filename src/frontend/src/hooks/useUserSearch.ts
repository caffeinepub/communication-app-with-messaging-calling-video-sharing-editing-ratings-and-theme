import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export interface SearchUserProfile {
  principal: string;
  username: string;
  displayName: string;
}

export function useUserSearch(searchQuery: string) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<SearchUserProfile[]>({
    queryKey: ['userSearch', searchQuery],
    queryFn: async () => {
      if (!actor || !searchQuery.trim()) return [];

      // Backend requires at least 3 characters
      if (searchQuery.trim().length < 3) {
        return [];
      }

      try {
        const results = await actor.searchDirectoryUsers(searchQuery.trim());
        
        // Map backend DirectoryUserResult to SearchUserProfile
        return results.map((result) => ({
          principal: result.principal.toString(),
          username: result.username,
          displayName: result.displayName,
        }));
      } catch (error) {
        console.error('Error searching users:', error);
        return [];
      }
    },
    enabled: !!actor && !isActorFetching && searchQuery.trim().length >= 3,
  });
}
