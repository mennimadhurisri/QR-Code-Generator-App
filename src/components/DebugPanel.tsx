import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

export function DebugPanel() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d97a95f5/debug/health`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      console.log('Health check:', data);
      setDebugInfo({ type: 'health', data });
      toast.success('Backend is reachable!');
    } catch (error) {
      console.error('Health check failed:', error);
      toast.error('Backend is not reachable');
      setDebugInfo({ type: 'error', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const listAllContent = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d97a95f5/debug/list`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      console.log('All content:', data);
      setDebugInfo({ type: 'list', data });
      toast.success(`Found ${data.count} items`);
    } catch (error) {
      console.error('List failed:', error);
      toast.error('Failed to list content');
      setDebugInfo({ type: 'error', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testTextUpload = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', 'text');
      formData.append('content', 'Test message from debug panel');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d97a95f5/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      console.log('Upload response:', data);
      
      if (response.ok) {
        setDebugInfo({ type: 'upload', data });
        toast.success(`Created content with ID: ${data.id}`);
        
        // Now try to fetch it back
        setTimeout(async () => {
          const fetchResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-d97a95f5/content/${data.id}`,
            {
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
              },
            }
          );
          const fetchData = await fetchResponse.json();
          console.log('Fetch back response:', fetchData);
          setDebugInfo({ type: 'roundtrip', upload: data, fetch: fetchData });
        }, 1000);
      } else {
        toast.error('Upload failed');
        setDebugInfo({ type: 'error', error: data });
      }
    } catch (error) {
      console.error('Test upload failed:', error);
      toast.error('Test upload failed');
      setDebugInfo({ type: 'error', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Debug Panel</CardTitle>
        <CardDescription>Test backend connectivity and data storage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={testHealth} disabled={loading} variant="outline">
            Test Backend Health
          </Button>
          <Button onClick={testTextUpload} disabled={loading} variant="outline">
            Test Text Upload & Fetch
          </Button>
          <Button onClick={listAllContent} disabled={loading} variant="outline">
            List All Content
          </Button>
        </div>

        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg overflow-auto max-h-96">
            <pre className="text-xs">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Project ID:</strong> {projectId}</p>
          <p><strong>Backend URL:</strong> https://{projectId}.supabase.co/functions/v1/make-server-d97a95f5</p>
        </div>
      </CardContent>
    </Card>
  );
}
