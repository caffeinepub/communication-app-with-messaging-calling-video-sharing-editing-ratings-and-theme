import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { useCreateProfile } from '@/hooks/useProfileMutations';

export default function HandleOnboardingPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const createProfile = useCreateProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedDisplayName = displayName.trim();

    if (!trimmedUsername) {
      toast.error('Please enter a username');
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,32}$/.test(trimmedUsername)) {
      toast.error('Invalid username', {
        description: 'Username must be 3-32 characters (letters, numbers, underscore only).',
      });
      return;
    }

    // Use username as display name if not provided
    const finalDisplayName = trimmedDisplayName || trimmedUsername;

    if (finalDisplayName.length < 1 || finalDisplayName.length > 32) {
      toast.error('Invalid display name', {
        description: 'Display name must be between 1 and 32 characters.',
      });
      return;
    }

    try {
      await createProfile.mutateAsync({
        username: trimmedUsername,
        displayName: finalDisplayName,
      });

      toast.success('Welcome to ConnectHub!', {
        description: `Your profile has been created.`,
      });

      navigate({ to: '/directory' });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent-orange to-accent-coral">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome to ConnectHub!</CardTitle>
          <CardDescription>Create your profile to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={createProfile.isPending}
              />
              <p className="text-xs text-muted-foreground">
                3-32 characters. Letters, numbers, and underscores only.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name (optional)</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Your Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={createProfile.isPending}
              />
              <p className="text-xs text-muted-foreground">
                1-32 characters. Defaults to your username if not provided.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={createProfile.isPending}>
              {createProfile.isPending ? 'Setting up...' : 'Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
