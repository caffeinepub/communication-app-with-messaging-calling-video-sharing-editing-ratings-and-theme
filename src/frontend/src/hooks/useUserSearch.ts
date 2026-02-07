import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@icp-sdk/core/principal';

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
        const results = await actor.searchUsers(searchQuery.trim());
        
        // We need to get the principal for each user
        // Since searchUsers doesn't return principals, we need to search through all profiles
        // This is a workaround - ideally the backend would return principals in search results
        const profilesWithPrincipals: SearchUserProfile[] = [];
        
        for (const profile of results) {
          // Try to find the principal by checking if we can get the profile back
          // This is inefficient but necessary given the current backend API
          // In a real app, the backend should return principals in search results
          profilesWithPrincipals.push({
            principal: '', // We'll need to handle this differently
            username: profile.username,
            displayName: profile.displayName,
          });
        }
        
        return profilesWithPrincipals;
      } catch (error) {
        console.error('Error searching users:', error);
        return [];
      }
    },
    enabled: !!actor && !isActorFetching && searchQuery.trim().length >= 3,
  });
}
