import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, AlertCircle, FileVideo } from 'lucide-react';

interface VideoUploaderProps {
  onVideoUploaded: (file: File) => void;
}

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

export default function VideoUploader({ onVideoUploaded }: VideoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Unsupported file format. Please upload MP4, WebM, MOV, or AVI files.');
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      setError(`File size exceeds ${MAX_VIDEO_SIZE / (1024 * 1024)}MB limit. Please choose a smaller file.`);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onVideoUploaded(selectedFile);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
      >
        <FileVideo className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground mb-1">
          {selectedFile ? selectedFile.name : 'Click to select a video file'}
        </p>
        <p className="text-xs text-muted-foreground">
          MP4, WebM, MOV, or AVI (max {MAX_VIDEO_SIZE / (1024 * 1024)}MB)
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {selectedFile && (
        <Button onClick={handleUpload} className="w-full gap-2">
          <Upload className="h-4 w-4" />
          Use This Video
        </Button>
      )}
    </div>
  );
}
