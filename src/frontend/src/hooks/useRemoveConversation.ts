import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { toast } from 'sonner';

export function useRemoveConversation() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!actor) {
        throw new Error('Actor not available');
      }
      
      await actor.removeConversation(conversationId);
    },
    onSuccess: () => {
      // Invalidate conversations query to refresh the list
      queryClient.invalidateQueries({ 
        queryKey: ['conversations', identity?.getPrincipal().toString()] 
      });
      toast.success('Conversation removed');
    },
    onError: (error: Error) => {
      // Handle specific error messages from backend
      if (error.message.includes('started')) {
        toast.error('Cannot remove conversations you started');
      } else if (error.message.includes('No conversations')) {
        toast.error('Conversation not found');
      } else {
        toast.error('Failed to remove conversation');
      }
    },
  });
}
