import { useState } from 'react';
import { Message } from '@/hooks/useThreadMessages';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import StarRating from '@/components/video/StarRating';
import { useVideoRating, useSetVideoRating } from '@/hooks/useVideoRating';

interface VideoMessageCardProps {
  message: Message;
  isCurrentUser: boolean;
}

export default function VideoMessageCard({ message, isCurrentUser }: VideoMessageCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = message.videoId || 'default-video';
  const { data: rating } = useVideoRating(videoId);
  const setRating = useSetVideoRating();

  const handleRatingChange = (newRating: number) => {
    setRating.mutate({ videoId, rating: newRating });
  };

  return (
    <Card className={isCurrentUser ? 'bg-card' : 'bg-card'}>
      <CardContent className="p-3 space-y-3">
        <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
          {message.videoUrl ? (
            <video
              src={message.videoUrl}
              controls
              className="w-full h-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Video preview</p>
            </div>
          )}
        </div>

        {message.content && <p className="text-sm">{message.content}</p>}

        {rating && (
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-border">
            <StarRating
              value={rating.userRating || 0}
              onChange={handleRatingChange}
              readonly={false}
            />
            <div className="text-xs text-muted-foreground">
              {rating.averageRating.toFixed(1)} ({rating.ratingCount})
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
