import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useUserSearch } from '@/hooks/useUserSearch';
import { useAddConversation } from '@/hooks/useAddConversation';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, MessageSquare, Phone } from 'lucide-react';
import { LoadingView, EmptyView } from '@/components/system/StateViews';
import { createConversationId, isValidPrincipal } from '@/utils/conversationMeta';
import { toast } from 'sonner';

export default function DirectoryPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: users, isLoading } = useUserSearch(searchQuery);
  const addConversation = useAddConversation();

  const handleStartChat = async (userPrincipal: string) => {
    if (!identity) {
      toast.error('Please log in to start a chat');
      return;
    }

    if (!userPrincipal || !isValidPrincipal(userPrincipal)) {
      toast.error('Invalid user principal');
      console.error('Invalid principal:', userPrincipal);
      return;
    }
    
    const currentPrincipal = identity.getPrincipal().toString();
    const conversationId = createConversationId(currentPrincipal, userPrincipal);
    
    try {
      await addConversation.mutateAsync(conversationId);
      navigate({ to: '/chats/$conversationId', params: { conversationId } });
    } catch (error: any) {
      console.error('Failed to start chat:', error);
      
      // If the conversation already exists, navigate anyway
      if (error?.message?.includes('already exists') || error?.message?.includes('Unauthorized')) {
        navigate({ to: '/chats/$conversationId', params: { conversationId } });
      } else {
        toast.error('Failed to start chat. Please try again.');
      }
    }
  };

  const handleStartCall = (userPrincipal: string) => {
    if (!userPrincipal || !isValidPrincipal(userPrincipal)) {
      toast.error('Invalid user principal');
      return;
    }
    navigate({ to: '/calls/active/$callId', params: { callId: `call-${userPrincipal}` } });
  };

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

  // Filter out users with invalid principals
  const validUsers = users?.filter(user => user.principal && isValidPrincipal(user.principal)) || [];

  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto max-w-4xl p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Directory</h1>
          <p className="text-muted-foreground mt-1">Find and connect with people</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by username or display name (min 3 characters)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading && <LoadingView message="Searching..." />}

        {!isLoading && searchQuery.trim().length > 0 && searchQuery.trim().length < 3 && (
          <EmptyView
            title="Type at least 3 characters to search"
            message="Enter a username or display name to find people"
          />
        )}

        {!isLoading && searchQuery.trim().length >= 3 && validUsers.length === 0 && (
          <EmptyView
            title="No users found"
            message="Try a different search term"
          />
        )}

        {!isLoading && validUsers.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {validUsers.map((user) => (
              <Card key={user.username} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-accent-orange to-accent-coral text-white">
                        {getInitials(user.displayName, user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{user.displayName}</p>
                      <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 gap-1"
                      onClick={() => handleStartChat(user.principal)}
                      disabled={addConversation.isPending}
                    >
                      <MessageSquare className="h-3 w-3" />
                      {addConversation.isPending ? 'Starting...' : 'Chat'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1"
                      onClick={() => handleStartCall(user.principal)}
                    >
                      <Phone className="h-3 w-3" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
