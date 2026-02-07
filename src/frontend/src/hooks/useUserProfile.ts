import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@icp-sdk/core/principal';

export interface PublicUserProfile {
  principal: string;
  username: string;
  displayName: string;
}

export function useUserProfile(principalString: string) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<PublicUserProfile | null>({
    queryKey: ['userProfile', principalString],
    queryFn: async () => {
      if (!actor) return null;

      try {
        const principal = Principal.fromText(principalString);
        const profile = await actor.getUserProfile(principal);
        
        if (!profile) {
          return null;
        }

        return {
          principal: principalString,
          username: profile.username,
          displayName: profile.displayName,
        };
      } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
    },
    enabled: !!actor && !isActorFetching && !!principalString,
  });
}
