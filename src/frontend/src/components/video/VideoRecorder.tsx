import { useState } from 'react';
import { useCamera } from '@/camera/useCamera';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Video, Square, Camera, AlertCircle, Loader2 } from 'lucide-react';

interface VideoRecorderProps {
  onVideoRecorded: (file: File) => void;
}

export default function VideoRecorder({ onVideoRecorded }: VideoRecorderProps) {
  const {
    isActive,
    isSupported,
    error,
    isLoading,
    startCamera,
    stopCamera,
    videoRef,
    canvasRef,
  } = useCamera({ facingMode: 'user' });

  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const handleStartRecording = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;

    const stream = videoRef.current.srcObject as MediaStream;
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp8,opus',
    });

    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'video/webm' });
      onVideoRecorded(file);
      stopCamera();
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  if (isSupported === false) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Camera is not supported in your browser. Please use a modern browser with camera support.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.type === 'permission'
              ? 'Camera permission denied. Please allow camera access to record videos.'
              : error.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {!isActive && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="h-16 w-16 text-muted-foreground" />
          </div>
        )}

        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-full">
            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span className="text-sm font-medium">Recording</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
        {!isActive ? (
          <Button onClick={startCamera} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Video className="h-4 w-4" />
                Start Camera
              </>
            )}
          </Button>
        ) : !isRecording ? (
          <>
            <Button onClick={handleStartRecording} className="gap-2">
              <Video className="h-4 w-4" />
              Start Recording
            </Button>
            <Button onClick={stopCamera} variant="outline">
              Cancel
            </Button>
          </>
        ) : (
          <Button onClick={handleStopRecording} variant="destructive" className="gap-2">
            <Square className="h-4 w-4" />
            Stop Recording
          </Button>
        )}
      </div>
    </div>
  );
}
