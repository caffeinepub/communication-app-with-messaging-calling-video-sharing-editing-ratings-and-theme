import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video } from 'lucide-react';

export default function IncomingCallPage() {
  const navigate = useNavigate();
  const { callId } = useParams({ from: '/calls/incoming/$callId' });

  const caller = {
    handle: '@alice',
    principal: 'mock-principal-1',
  };

  const handleAccept = () => {
    navigate({ to: '/calls/active/$callId', params: { callId } });
  };

  const handleDecline = () => {
    navigate({ to: '/calls' });
  };

  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarFallback className="bg-gradient-to-br from-accent-orange to-accent-coral text-white text-2xl">
              {caller.handle.slice(1, 3).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">{caller.handle}</CardTitle>
          <p className="text-muted-foreground">Incoming call...</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleAccept} className="w-full gap-2 bg-green-600 hover:bg-green-700">
            <Phone className="h-5 w-5" />
            Accept
          </Button>
          <Button onClick={handleDecline} variant="destructive" className="w-full gap-2">
            <PhoneOff className="h-5 w-5" />
            Decline
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
