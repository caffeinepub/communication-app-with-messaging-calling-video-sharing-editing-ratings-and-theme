import { useQuery } from '@tanstack/react-query';
import { useInternetIdentity } from './useInternetIdentity';
import { useActor } from './useActor';

export interface UserProfile {
  principal: string;
  username: string;
  displayName: string;
}

export function useCurrentUser() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['currentUser', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!identity || !actor) return null;

      const principal = identity.getPrincipal();
      const profile = await actor.getUserProfile(principal);
      
      if (!profile) {
        return null;
      }

      return {
        principal: principal.toString(),
        username: profile.username,
        displayName: profile.displayName,
      };
    },
    enabled: !!identity && !!actor && !isActorFetching,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
