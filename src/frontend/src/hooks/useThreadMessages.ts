import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Message as BackendMessage } from '@/backend';

export interface Message {
  id: string;
  conversationId: string;
  sender: {
    principal: string;
    handle: string;
  };
  content: string;
  timestamp: number;
  type: 'text' | 'video';
  videoUrl?: string;
  videoId?: string;
}

export function useThreadMessages(conversationId: string) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!actor || !conversationId) return [];

      try {
        const backendMessages: BackendMessage[] = await actor.listMessages(conversationId);
        
        // Map backend messages to UI format
        return backendMessages.map((msg) => ({
          id: msg.messageId.toString(),
          conversationId: msg.conversationId,
          sender: {
            principal: msg.sender.toString(),
            handle: '', // Will be resolved in the UI component
          },
          content: msg.text,
          timestamp: Number(msg.timestamp) / 1_000_000, // Convert nanoseconds to milliseconds
          type: 'text' as const,
        }));
      } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
      }
    },
    enabled: !!actor && !isActorFetching && !!conversationId,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });
}
