import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import VideoRecorder from '@/components/video/VideoRecorder';
import VideoUploader from '@/components/video/VideoUploader';
import VideoTrimmer from '@/components/video/VideoTrimmer';

export default function VideoStudioPage() {
  const [activeTab, setActiveTab] = useState('record');
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleVideoRecorded = (file: File) => {
    setVideoFile(file);
    setActiveTab('edit');
  };

  const handleVideoUploaded = (file: File) => {
    setVideoFile(file);
    setActiveTab('edit');
  };

  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto max-w-6xl p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Video Studio</h1>
          <p className="text-muted-foreground mt-1">Create and edit videos to share</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="record">Record</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="edit" disabled={!videoFile}>
              Edit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="record" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Record Video</CardTitle>
                <CardDescription>Use your camera to record a new video</CardDescription>
              </CardHeader>
              <CardContent>
                <VideoRecorder onVideoRecorded={handleVideoRecorded} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Video</CardTitle>
                <CardDescription>Choose a video file from your device</CardDescription>
              </CardHeader>
              <CardContent>
                <VideoUploader onVideoUploaded={handleVideoUploaded} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="edit" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Edit Video</CardTitle>
                <CardDescription>Trim and preview your video</CardDescription>
              </CardHeader>
              <CardContent>
                {videoFile && <VideoTrimmer videoFile={videoFile} />}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
