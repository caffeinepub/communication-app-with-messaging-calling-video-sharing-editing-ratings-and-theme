import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { toast } from 'sonner';

export function useAddConversation() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!actor) {
        throw new Error('Actor not available');
      }
      
      await actor.addConversation(conversationId);
    },
    onSuccess: () => {
      // Invalidate conversations query to refresh the list
      queryClient.invalidateQueries({ 
        queryKey: ['conversations', identity?.getPrincipal().toString()] 
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to start conversation');
      console.error('Add conversation error:', error);
    },
  });
}
