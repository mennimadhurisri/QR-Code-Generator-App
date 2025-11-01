import { Database, QrCode, Share2, Download, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function HowItWorks() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <QrCode className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">1. Generate QR Code</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Upload text, images, videos, or files. Your content is stored in YOUR Supabase database.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">2. Stored in Database</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">All content is saved in your own Supabase database with a unique ID. Files stored in Supabase Storage.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Share2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">3. Share QR Code</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">QR code links to YOUR website: yoursite.com/view/[id]. Anyone scanning sees your branded page.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Download className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">4. View & Download</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Users view content on your website and can download it. Images/videos display inline with download button.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-amber-600" />
            <CardTitle className="text-lg text-amber-900">24-Hour Auto-Delete</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-amber-800">All content automatically expires and deletes from your database after 24 hours for security and storage management.</p>
        </CardContent>
      </Card>

      <div className="p-6 bg-indigo-50 rounded-lg border-2 border-indigo-200">
        <h3 className="text-indigo-900 mb-4">Your Complete System:</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-indigo-600">✓</span>
            <span><strong>Your Website:</strong> QR codes link to your own domain</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600">✓</span>
            <span><strong>Your Database:</strong> All data stored in your Supabase account</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600">✓</span>
            <span><strong>Your Control:</strong> You own and manage all content</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600">✓</span>
            <span><strong>Format Support:</strong> Text, images, videos, PDFs, documents, any file type</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600">✓</span>
            <span><strong>Download Options:</strong> All content can be downloaded by viewers</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
