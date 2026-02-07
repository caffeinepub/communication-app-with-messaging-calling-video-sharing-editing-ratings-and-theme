import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Video, Clock, Trash2, MoreVertical } from 'lucide-react';
import { EmptyView, LoadingView, ErrorView } from '@/components/system/StateViews';
import { formatDistanceToNow } from 'date-fns';
import { useCallHistory } from '@/hooks/useCallHistory';
import { useDeleteCallEntry } from '@/hooks/useDeleteCallEntry';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CallType } from '@/backend';

export default function CallsPage() {
  const navigate = useNavigate();
  const { data: callHistory, isLoading, error, refetch } = useCallHistory();
  const deleteCallMutation = useDeleteCallEntry();

  const formatDuration = (seconds: bigint) => {
    const secs = Number(seconds);
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const getCallTypeIcon = (callType: CallType) => {
    switch (callType) {
      case CallType.webcam:
        return <Video className="h-5 w-5 text-muted-foreground" />;
      case CallType.audio:
        return <Phone className="h-5 w-5 text-muted-foreground" />;
      case CallType.stream:
        return <Video className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Phone className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getCallTypeLabel = (callType: CallType) => {
    switch (callType) {
      case CallType.webcam:
        return 'Video';
      case CallType.audio:
        return 'Audio';
      case CallType.stream:
        return 'Stream';
      default:
        return 'Call';
    }
  };

  const handleDelete = (callId: bigint) => {
    deleteCallMutation.mutate(callId);
  };

  if (isLoading) {
    return <LoadingView message="Loading call history..." />;
  }

  if (error) {
    return (
      <ErrorView
        title="Failed to load calls"
        message={error instanceof Error ? error.message : 'Unable to fetch call history'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto max-w-4xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calls</h1>
            <p className="text-muted-foreground mt-1">Recent call history</p>
          </div>
          <Button onClick={() => navigate({ to: '/directory' })} className="gap-2">
            <Phone className="h-4 w-4" />
            New Call
          </Button>
        </div>

        {!callHistory || callHistory.length === 0 ? (
          <EmptyView
            icon={<Phone className="h-8 w-8 text-muted-foreground" />}
            title="No calls yet"
            message="Start a call from the directory"
            action={{
              label: 'Browse Directory',
              onClick: () => navigate({ to: '/directory' }),
            }}
          />
        ) : (
          <div className="space-y-3">
            {callHistory.map((call) => (
              <Card key={call.id.toString()}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        {getCallTypeIcon(call.callType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground truncate">
                            {call.fromUser || call.toUser || 'Unknown'}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {getCallTypeLabel(call.callType)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(Number(call.timestamp) / 1_000_000, {
                              addSuffix: true,
                            })}
                          </span>
                          <span>•</span>
                          <span>{formatDuration(call.duration)}</span>
                        </div>
                        {call.notes && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {call.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={deleteCallMutation.isPending}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDelete(call.id)}
                          className="text-destructive focus:text-destructive"
                          disabled={deleteCallMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Call
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
