import { useNavigate, useParams } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Phone, ArrowLeft } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAddConversation } from '@/hooks/useAddConversation';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { LoadingView, ErrorView } from '@/components/system/StateViews';
import { createConversationId } from '@/utils/conversationMeta';

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { userId } = useParams({ from: '/user/$userId' });
  const { data: user, isLoading, error } = useUserProfile(userId);
  const addConversation = useAddConversation();

  const getInitials = (displayName: string, username: string) => {
    if (displayName) {
      const parts = displayName.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return displayName.slice(0, 2).toUpperCase();
    }
    return username.slice(0, 2).toUpperCase();
  };

  const handleStartChat = async () => {
    if (!user || !identity) return;
    
    const currentPrincipal = identity.getPrincipal().toString();
    const conversationId = createConversationId(currentPrincipal, userId);
    
    try {
      await addConversation.mutateAsync(conversationId);
      navigate({ to: '/chats/$conversationId', params: { conversationId } });
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  if (isLoading) {
    return <LoadingView message="Loading profile..." />;
  }

  if (error || !user) {
    return (
      <ErrorView
        message="Failed to load profile"
        onRetry={() => navigate({ to: '/directory' })}
      />
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto max-w-2xl p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate({ to: '/directory' })} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Button>

        <Card>
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarFallback className="bg-gradient-to-br from-accent-orange to-accent-coral text-white text-2xl">
                {getInitials(user.displayName, user.username)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{user.displayName}</CardTitle>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full gap-2"
              onClick={handleStartChat}
              disabled={addConversation.isPending}
            >
              <MessageSquare className="h-4 w-4" />
              Start Chat
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => navigate({ to: '/calls/active/$callId', params: { callId: `call-${userId}` } })}
            >
              <Phone className="h-4 w-4" />
              Start Call
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
