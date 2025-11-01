import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QRCodeGenerator } from './components/QRCodeGenerator';
import { QRViewer } from './components/QRViewer';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Routes>
          <Route path="/" element={<QRCodeGenerator />} />
          <Route path="/preview_page.html" element={<QRCodeGenerator />} />
          <Route path="/view/:id" element={<QRViewer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}
