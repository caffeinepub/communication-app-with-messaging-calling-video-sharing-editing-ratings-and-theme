import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

export default function ActiveCallPage() {
  const navigate = useNavigate();
  const { callId } = useParams({ from: '/calls/active/$callId' });
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Simulate connection
    const timer = setTimeout(() => {
      setCallStatus('connected');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (callStatus === 'connected') {
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [callStatus]);

  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      navigate({ to: '/calls' });
    }, 1000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const otherUser = {
    handle: '@alice',
    principal: 'mock-principal-1',
  };

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-background to-muted">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-6xl space-y-6">
          {/* Remote Video */}
          <Card className="relative aspect-video bg-muted overflow-hidden">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarFallback className="bg-gradient-to-br from-accent-orange to-accent-coral text-white text-3xl">
                    {otherUser.handle.slice(1, 3).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xl font-semibold text-foreground">{otherUser.handle}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {callStatus === 'connecting' && 'Connecting...'}
                  {callStatus === 'connected' && formatDuration(callDuration)}
                  {callStatus === 'ended' && 'Call ended'}
                </p>
              </div>
            </div>
          </Card>

          {/* Local Video (Picture-in-Picture) */}
          <Card className="absolute top-8 right-8 w-48 aspect-video bg-muted overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <VideoOff className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </Card>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isMuted ? 'destructive' : 'secondary'}
              size="lg"
              onClick={() => setIsMuted(!isMuted)}
              className="h-14 w-14 rounded-full"
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>

            <Button
              variant="destructive"
              size="lg"
              onClick={handleEndCall}
              className="h-16 w-16 rounded-full"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>

            <Button
              variant={isVideoEnabled ? 'secondary' : 'destructive'}
              size="lg"
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className="h-14 w-14 rounded-full"
            >
              {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
