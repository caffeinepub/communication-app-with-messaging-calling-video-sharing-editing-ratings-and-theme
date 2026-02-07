import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useThreadMessages } from '@/hooks/useThreadMessages';
import { useSendMessage } from '@/hooks/useSendMessage';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Paperclip, Loader2, MessageSquare } from 'lucide-react';
import { LoadingView, EmptyView } from '@/components/system/StateViews';
import MessageList from '@/components/chat/MessageList';

export default function ChatThreadPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { conversationId } = useParams({ from: '/chats/$conversationId' });
  const { data: messages, isLoading } = useThreadMessages(conversationId);
  const sendMessage = useSendMessage();
  const [messageText, setMessageText] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  // Extract other participant's principal from conversationId
  // Format: "principal1:principal2" (sorted)
  const currentPrincipal = identity?.getPrincipal().toString();
  const participants = conversationId.split(':');
  const otherParticipantPrincipal = participants.find((p) => p !== currentPrincipal) || participants[0];

  // Fetch other participant's profile
  const { data: otherUserProfile } = useUserProfile(otherParticipantPrincipal);

  // Determine display name for header
  const displayLabel = otherUserProfile
    ? `@${otherUserProfile.username}`
    : otherParticipantPrincipal.substring(0, 8) + '...';

  // Check if user is near bottom of scroll
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setIsNearBottom(distanceFromBottom < 100);
  };

  // Auto-scroll to bottom when new messages arrive (only if near bottom)
  useEffect(() => {
    if (scrollContainerRef.current && isNearBottom) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isNearBottom]);

  // Initial scroll to bottom
  useEffect(() => {
    if (scrollContainerRef.current && messages && messages.length > 0) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages?.length]);

  const handleSend = async () => {
    if (!messageText.trim() || sendMessage.isPending) return;

    await sendMessage.mutateAsync({
      conversationId,
      content: messageText,
      type: 'text',
    });

    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return <LoadingView message="Loading messages..." />;
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="container mx-auto max-w-4xl flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/chats' })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{displayLabel}</p>
            <p className="text-xs text-muted-foreground">Active now</p>
          </div>
        </div>
      </div>

      {/* Messages - Scrollable Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        <div className="container mx-auto max-w-4xl p-4">
          {messages && messages.length > 0 ? (
            <MessageList
              messages={messages}
              currentUserPrincipal={currentPrincipal || ''}
              otherUserProfile={otherUserProfile}
            />
          ) : (
            <EmptyView
              icon={<MessageSquare className="h-8 w-8 text-muted-foreground" />}
              title="No messages yet"
              message="Start the conversation by sending a message below."
            />
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-card p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-end gap-2">
            <Button variant="outline" size="icon" onClick={() => navigate({ to: '/studio' })}>
              <Paperclip className="h-4 w-4" />
            </Button>
            <Textarea
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyPress}
              className="min-h-[44px] max-h-32 resize-none"
              rows={1}
            />
            <Button onClick={handleSend} disabled={!messageText.trim() || sendMessage.isPending} size="icon">
              {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
