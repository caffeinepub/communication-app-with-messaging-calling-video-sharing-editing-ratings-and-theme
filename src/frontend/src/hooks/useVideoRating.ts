import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { toast } from 'sonner';

export interface VideoRating {
  videoId: string;
  averageRating: number;
  ratingCount: number;
  userRating?: number;
}

export function useVideoRating(videoId: string) {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<VideoRating>({
    queryKey: ['videoRating', videoId, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !videoId) {
        return {
          videoId,
          averageRating: 0,
          ratingCount: 0,
        };
      }

      // Mock data since backend is not implemented
      return {
        videoId,
        averageRating: 4.5,
        ratingCount: 12,
        userRating: identity ? 4.0 : undefined,
      };
    },
    enabled: !!actor && !isActorFetching && !!videoId,
  });
}

export function useSetVideoRating() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, rating }: { videoId: string; rating: number }) => {
      if (!actor) throw new Error('Not authenticated');

      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 300));

      return { videoId, rating };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['videoRating', data.videoId] });
      toast.success('Rating saved');
    },
    onError: (error) => {
      toast.error('Failed to save rating', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });
}
