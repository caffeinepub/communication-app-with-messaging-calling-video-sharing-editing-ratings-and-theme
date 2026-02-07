import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { toast } from 'sonner';

export function useCreateProfile() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ username, displayName }: { username: string; displayName: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.createUserProfile(username, displayName);
    },
    onSuccess: () => {
      if (identity) {
        queryClient.invalidateQueries({ queryKey: ['currentUser', identity.getPrincipal().toString()] });
      }
    },
    onError: (error: Error) => {
      const message = error.message.toLowerCase();
      if (message.includes('already exists') || message.includes('username already exists')) {
        toast.error('Username is already taken', {
          description: 'Please choose a different username.',
        });
      } else if (message.includes('must be between 3 and 32')) {
        toast.error('Invalid username', {
          description: 'Username must be between 3 and 32 characters.',
        });
      } else if (message.includes('cannot include')) {
        toast.error('Invalid username', {
          description: 'Username cannot include restricted terms.',
        });
      } else {
        toast.error('Failed to create profile', {
          description: error.message || 'Please try again.',
        });
      }
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ username, displayName }: { username?: string; displayName?: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.updateProfile(username ?? null, displayName ?? null);
    },
    onSuccess: () => {
      if (identity) {
        queryClient.invalidateQueries({ queryKey: ['currentUser', identity.getPrincipal().toString()] });
      }
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      const message = error.message.toLowerCase();
      if (message.includes('already exists') || message.includes('username already exists')) {
        toast.error('Username is already taken', {
          description: 'Please choose a different username.',
        });
      } else if (message.includes('must be between 3 and 32')) {
        toast.error('Invalid input', {
          description: 'Username must be between 3 and 32 characters.',
        });
      } else if (message.includes('display name must be between 1 and 32')) {
        toast.error('Invalid display name', {
          description: 'Display name must be between 1 and 32 characters.',
        });
      } else if (message.includes('cannot include') || message.includes('cannot contain')) {
        toast.error('Invalid input', {
          description: 'Input contains restricted terms.',
        });
      } else if (message.includes('not found')) {
        toast.error('Profile not found', {
          description: 'Please complete onboarding first.',
        });
      } else {
        toast.error('Failed to update profile', {
          description: error.message || 'Please try again.',
        });
      }
    },
  });
}
