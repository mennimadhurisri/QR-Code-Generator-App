import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, FileText, Image, Video, File, Loader2, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

type ContentData = {
  type: 'text' | 'image' | 'video' | 'file';
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  expiresAt?: string;
};

export function QRViewer() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [contentData, setContentData] = useState<ContentData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchContent(id);
    }
  }, [id]);

  const fetchContent = async (contentId: string) => {
    try {
      console.log('Fetching content for ID:', contentId);
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-d97a95f5/content/${contentId}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Content not found');
      }

      const data = await response.json();
      console.log('Content data received:', data);
      setContentData(data);
    } catch (error) {
      console.error('Error fetching content:', error);
      setError(error.message || 'Failed to load content');
      toast.error(error.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!contentData) return;

    try {
      if (contentData.type === 'text' && contentData.content) {
        const blob = new Blob([contentData.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'content.txt';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Downloaded successfully!');
      } else if (contentData.fileUrl) {
        const a = document.createElement('a');
        a.href = contentData.fileUrl;
        a.download = contentData.fileName || 'download';
        a.target = '_blank';
        a.click();
        toast.success('Download started!');
      }
    } catch (error) {
      console.error('Error downloading:', error);
      toast.error('Failed to download');
    }
  };

  const getIcon = () => {
    if (!contentData) return null;
    switch (contentData.type) {
      case 'text':
        return <FileText className="w-8 h-8 text-blue-600" />;
      case 'image':
        return <Image className="w-8 h-8 text-green-600" />;
      case 'video':
        return <Video className="w-8 h-8 text-purple-600" />;
      case 'file':
        return <File className="w-8 h-8 text-orange-600" />;
    }
  };

  const getTimeRemaining = () => {
    if (!contentData?.expiresAt) return '';
    const now = new Date();
    const expiry = new Date(contentData.expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || !contentData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Content Not Found</CardTitle>
            <CardDescription className="space-y-2">
              <p>{error || 'Content not found or has expired'}</p>
              <p className="text-xs text-gray-500">ID: {id}</p>
              {error?.includes('expired') && (
                <p className="text-sm">This content was only available for 24 hours after creation.</p>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Create New QR Code
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <div>
              <CardTitle>Shared Content</CardTitle>
              <CardDescription>
                {contentData.type.charAt(0).toUpperCase() + contentData.type.slice(1)} content
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {contentData.expiresAt && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                This content will expire in 24 hours. Time remaining: <strong>{getTimeRemaining()}</strong>
              </AlertDescription>
            </Alert>
          )}

          {contentData.type === 'text' && contentData.content && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <pre className="whitespace-pre-wrap break-words">{contentData.content}</pre>
            </div>
          )}

          {contentData.type === 'image' && contentData.fileUrl && (
            <div className="rounded-lg overflow-hidden border">
              <img
                src={contentData.fileUrl}
                alt="Shared content"
                className="w-full h-auto"
              />
            </div>
          )}

          {contentData.type === 'video' && contentData.fileUrl && (
            <div className="rounded-lg overflow-hidden border">
              <video
                src={contentData.fileUrl}
                controls
                className="w-full h-auto"
              />
            </div>
          )}

          {contentData.type === 'file' && (
            <div className="p-6 bg-gray-50 rounded-lg border text-center">
              <File className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-700">{contentData.fileName}</p>
              {contentData.fileType && (
                <p className="text-sm text-gray-500">{contentData.fileType}</p>
              )}
            </div>
          )}

          <Button onClick={handleDownload} className="w-full" size="lg">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
