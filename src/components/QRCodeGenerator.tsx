import { useState, useEffect, useRef } from 'react';
import { QrCode, Upload, FileText, Image, Video, File, Share2, Download, Clock, Link, Info } from 'lucide-react';
import QRCode from 'qrcode';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { HowItWorks } from './HowItWorks';
import { DebugPanel } from './DebugPanel';

type ContentType = 'text' | 'image' | 'video' | 'file';

export function QRCodeGenerator() {
  const [activeTab, setActiveTab] = useState<ContentType>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [qrValue, setQrValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (qrValue && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrValue, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    }
  }, [qrValue]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const generateQR = async () => {
    setIsGenerating(true);
    try {
      let contentToUpload;
      let contentType = activeTab;

      if (activeTab === 'text') {
        if (!textContent.trim()) {
          toast.error('Please enter some text');
          setIsGenerating(false);
          return;
        }
        contentToUpload = textContent;
      } else {
        if (!selectedFile) {
          toast.error('Please select a file');
          setIsGenerating(false);
          return;
        }
      }

      // Upload to server
      const formData = new FormData();
      formData.append('type', contentType);
      
      if (activeTab === 'text') {
        formData.append('content', textContent);
      } else {
        formData.append('file', selectedFile!);
      }

      console.log('Uploading to server...');
      const uploadUrl = `https://${projectId}.supabase.co/functions/v1/make-server-d97a95f5/upload`;
      console.log('Upload URL:', uploadUrl);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error(`Upload failed: ${errorText}`);
      }

      const data = await response.json();
      const viewUrl = `${window.location.origin}/view/${data.id}`;
      
      console.log('Generated QR code for ID:', data.id);
      console.log('View URL:', viewUrl);
      
      setQrValue(viewUrl);
      setShareUrl(viewUrl);
      toast.success('QR Code generated! Stored in your database. Expires in 24 hours.');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!canvasRef.current) return;
    
    const url = canvasRef.current.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.download = 'qr-code.png';
    downloadLink.href = url;
    downloadLink.click();
    toast.success('QR Code downloaded!');
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QR Code',
          text: 'Scan this QR code to view the content',
          url: shareUrl,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        console.error('Error sharing:', error);
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <QrCode className="w-12 h-12 text-indigo-600" />
          <h1 className="text-indigo-900">QR Code Generator</h1>
        </div>
        <p className="text-gray-600">Generate QR codes for text, images, videos, and files</p>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="mt-4">
              <Info className="w-4 h-4 mr-2" />
              How It Works
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>How Your QR Code System Works</DialogTitle>
              <DialogDescription>
                Learn how your content is stored in your database and accessed through QR codes
              </DialogDescription>
            </DialogHeader>
            <HowItWorks />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Create QR Code</CardTitle>
            <CardDescription>Choose content type and upload your content</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContentType)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="text">
                  <FileText className="w-4 h-4 mr-1" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="image">
                  <Image className="w-4 h-4 mr-1" />
                  Image
                </TabsTrigger>
                <TabsTrigger value="video">
                  <Video className="w-4 h-4 mr-1" />
                  Video
                </TabsTrigger>
                <TabsTrigger value="file">
                  <File className="w-4 h-4 mr-1" />
                  File
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text-content">Enter Text</Label>
                  <Textarea
                    id="text-content"
                    placeholder="Enter your text here..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={6}
                  />
                </div>
              </TabsContent>

              <TabsContent value="image" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-upload">Upload Image</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="video" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="video-upload">Upload Video</Label>
                  <Input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="file" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Upload File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileSelect}
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <Button
              onClick={generateQR}
              disabled={isGenerating}
              className="w-full mt-6"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate QR Code'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your QR Code</CardTitle>
            <CardDescription>Scan or share your generated QR code</CardDescription>
          </CardHeader>
          <CardContent>
            {qrValue ? (
              <div className="space-y-4">
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Content expires in <strong>24 hours</strong>
                  </AlertDescription>
                </Alert>

                <div className="flex justify-center p-6 bg-white rounded-lg border-2 border-gray-200">
                  <canvas ref={canvasRef} />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Your Website Share Link
                  </Label>
                  <div className="flex gap-2">
                    <Input value={shareUrl} readOnly className="text-sm" />
                    <Button variant="outline" size="icon" onClick={copyToClipboard}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Data stored in your Supabase database</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={downloadQR} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={shareQR}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400">
                <QrCode className="w-24 h-24 mb-4 opacity-20" />
                <p>Your QR code will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="max-w-4xl mx-auto mt-8">
        <DebugPanel />
      </div>
    </div>
  );
}
