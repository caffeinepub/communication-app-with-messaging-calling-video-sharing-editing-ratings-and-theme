import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import type { CallLogEntry } from '@/backend';

export function useDeleteCallEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (callId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteCallEntry(callId);
    },
    onMutate: async (callId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['callHistory'] });

      // Snapshot previous value
      const previousCalls = queryClient.getQueryData<CallLogEntry[]>(['callHistory']);

      // Optimistically update
      queryClient.setQueryData<CallLogEntry[]>(['callHistory'], (old) =>
        old ? old.filter((call) => call.id !== callId) : []
      );

      return { previousCalls };
    },
    onError: (error, _callId, context) => {
      // Rollback on error
      if (context?.previousCalls) {
        queryClient.setQueryData(['callHistory'], context.previousCalls);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete call entry';
      toast.error('Delete Failed', {
        description: errorMessage,
      });
    },
    onSuccess: () => {
      toast.success('Call Deleted', {
        description: 'Call entry has been removed from your history',
      });
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['callHistory'] });
    },
  });
}
