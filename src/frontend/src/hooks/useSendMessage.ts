import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { toast } from 'sonner';
import { MessageRequest } from '@/backend';

interface SendMessageParams {
  conversationId: string;
  content: string;
  type: 'text' | 'video';
  videoUrl?: string;
}

export function useSendMessage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SendMessageParams) => {
      if (!actor) throw new Error('Not authenticated');
      if (!identity) throw new Error('No identity available');

      const principal = identity.getPrincipal();

      const request: MessageRequest = {
        conversationId: params.conversationId,
        sender: principal,
        text: params.content,
      };

      const reply = await actor.sendMessage(request);

      return {
        messageId: reply.messageId,
        timestamp: reply.timestamp,
      };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      toast.error('Failed to send message', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });
}
