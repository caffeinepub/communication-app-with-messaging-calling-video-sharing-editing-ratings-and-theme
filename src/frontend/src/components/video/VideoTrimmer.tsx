import { useState, useRef, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Scissors, Download, Send } from 'lucide-react';
import { toast } from 'sonner';

interface VideoTrimmerProps {
  videoFile: File;
}

export default function VideoTrimmer({ videoFile }: VideoTrimmerProps) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [videoFile]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setEndTime(dur);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);

      if (videoRef.current.currentTime >= endTime) {
        videoRef.current.pause();
        videoRef.current.currentTime = startTime;
      }
    }
  };

  const handleStartTimeChange = (value: number[]) => {
    const newStart = value[0];
    setStartTime(newStart);
    if (videoRef.current) {
      videoRef.current.currentTime = newStart;
    }
  };

  const handleEndTimeChange = (value: number[]) => {
    setEndTime(value[0]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExport = () => {
    toast.success('Video exported', {
      description: 'Your trimmed video is ready to share',
    });
  };

  const handleSendToChat = () => {
    toast.success('Video sent to chat');
    navigate({ to: '/chats' });
  };

  return (
    <div className="space-y-6">
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          controls
          className="w-full h-full object-cover"
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Start Time: {formatTime(startTime)}</Label>
          <Slider
            value={[startTime]}
            onValueChange={handleStartTimeChange}
            max={duration}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label>End Time: {formatTime(endTime)}</Label>
          <Slider
            value={[endTime]}
            onValueChange={handleEndTimeChange}
            max={duration}
            step={0.1}
            className="w-full"
          />
        </div>

        <div className="text-sm text-muted-foreground">
          Trimmed duration: {formatTime(endTime - startTime)}
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleExport} variant="outline" className="flex-1 gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button onClick={handleSendToChat} className="flex-1 gap-2">
          <Send className="h-4 w-4" />
          Send to Chat
        </Button>
      </div>
    </div>
  );
}
