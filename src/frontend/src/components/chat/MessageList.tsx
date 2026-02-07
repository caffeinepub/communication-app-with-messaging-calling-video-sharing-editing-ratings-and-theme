import { Message } from '@/hooks/useThreadMessages';
import { Card } from '@/components/ui/card';
import VideoMessageCard from './VideoMessageCard';
import { formatDistanceToNow } from 'date-fns';
import { PublicUserProfile } from '@/hooks/useUserProfile';

interface MessageListProps {
  messages: Message[];
  currentUserPrincipal: string;
  otherUserProfile: PublicUserProfile | null | undefined;
}

export default function MessageList({ messages, currentUserPrincipal, otherUserProfile }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isCurrentUser = message.sender.principal === currentUserPrincipal;
        
        // Determine sender display name
        const senderLabel = isCurrentUser
          ? 'You'
          : otherUserProfile
          ? `@${otherUserProfile.username}`
          : message.sender.principal.substring(0, 8) + '...';

        return (
          <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] space-y-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
              {!isCurrentUser && (
                <p className="text-xs font-medium text-muted-foreground px-3">{senderLabel}</p>
              )}

              {message.type === 'video' ? (
                <VideoMessageCard message={message} isCurrentUser={isCurrentUser} />
              ) : (
                <Card className={`p-3 ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                </Card>
              )}

              <p className="text-xs text-muted-foreground px-3">
                {formatDistanceToNow(message.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
