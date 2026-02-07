import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { getConversationDisplayLabel } from '@/utils/conversationMeta';

export interface Conversation {
  id: string;
  otherUser: {
    principal: string;
    handle: string;
  };
  lastMessage?: {
    content: string;
    timestamp: number;
    isVideo: boolean;
  };
  unreadCount: number;
}

export function useConversations() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<Conversation[]>({
    queryKey: ['conversations', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];

      const conversationIds = await actor.getUserConversations();
      
      // Map conversation IDs to UI-friendly format
      return conversationIds.map((id) => ({
        id,
        otherUser: {
          principal: '', // Not available from backend yet
          handle: getConversationDisplayLabel(id, 'Unknown'),
        },
        lastMessage: undefined, // Not available from backend yet
        unreadCount: 0, // Not available from backend yet
      }));
    },
    enabled: !!actor && !!identity && !isActorFetching,
    refetchInterval: 5000, // Poll every 5 seconds
  });
}
