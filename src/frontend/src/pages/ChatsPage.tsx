import { useNavigate } from '@tanstack/react-router';
import { useConversations } from '@/hooks/useConversations';
import { useRemoveConversation } from '@/hooks/useRemoveConversation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MessageSquare, Video, Search, MoreVertical, Trash2 } from 'lucide-react';
import { LoadingView, EmptyView } from '@/components/system/StateViews';
import { formatDistanceToNow } from 'date-fns';

export default function ChatsPage() {
  const navigate = useNavigate();
  const { data: conversations, isLoading } = useConversations();
  const removeConversation = useRemoveConversation();

  const handleRemoveConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeConversation.mutateAsync(conversationId);
  };

  if (isLoading) {
    return <LoadingView message="Loading conversations..." />;
  }

  if (!conversations || conversations.length === 0) {
    return (
      <EmptyView
        icon={<MessageSquare className="h-8 w-8 text-muted-foreground" />}
        title="No conversations yet"
        message="Start a conversation from the directory"
        action={{
          label: 'Browse Directory',
          onClick: () => navigate({ to: '/directory' }),
        }}
      />
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto max-w-4xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Chats</h1>
            <p className="text-muted-foreground mt-1">Your conversations</p>
          </div>
          <Button variant="outline" onClick={() => navigate({ to: '/directory' })} className="gap-2">
            <Search className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        <div className="space-y-2">
          {conversations.map((conversation) => (
            <Card
              key={conversation.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate({ to: '/chats/$conversationId', params: { conversationId: conversation.id } })}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-accent-orange to-accent-coral text-white">
                      {conversation.otherUser.handle.slice(1, 3).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-foreground">{conversation.otherUser.handle}</p>
                      {conversation.lastMessage && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(conversation.lastMessage.timestamp, { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <div className="flex items-center gap-2 mt-1">
                        {conversation.lastMessage.isVideo && <Video className="h-3 w-3 text-muted-foreground" />}
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                    )}
                  </div>

                  {conversation.unreadCount > 0 && (
                    <Badge className="bg-accent-coral text-white">{conversation.unreadCount}</Badge>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => handleRemoveConversation(conversation.id, e)}
                        disabled={removeConversation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
