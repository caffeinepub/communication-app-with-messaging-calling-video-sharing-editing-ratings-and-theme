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
      
      if (!identity) {
        throw new Error('Not authenticated');
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
      // Only show toast for unexpected errors
      // The DirectoryPage will handle navigation for known errors
      if (!error.message.includes('already exists') && !error.message.includes('Unauthorized')) {
        toast.error('Failed to start conversation');
      }
      console.error('Add conversation error:', error);
    },
  });
}
