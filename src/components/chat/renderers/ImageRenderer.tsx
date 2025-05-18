import { useState } from 'react';
import { ZoomIn, ZoomOut, X } from 'lucide-react';

interface ImageRendererProps {
  src: string;
  caption?: string;
}

export default function ImageRenderer({ src, caption }: ImageRendererProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const handleZoomIn = () => {
    if (zoomLevel < 3) {
      setZoomLevel(prev => prev + 0.5);
    }
  };
  
  const handleZoomOut = () => {
    if (zoomLevel > 0.5) {
      setZoomLevel(prev => prev - 0.5);
    }
  };
  
  const toggleFullScreen = () => {
    setIsZoomed(!isZoomed);
    setZoomLevel(1);
  };
  
  if (isZoomed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={toggleFullScreen}>
        <div className="relative" onClick={e => e.stopPropagation()}>
          <img 
            src={src} 
            alt={caption || "Image"} 
            className="max-w-full max-h-[90vh] object-contain"
            style={{ transform: `scale(${zoomLevel})` }}
          />
          
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button 
              onClick={handleZoomIn}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white"
            >
              <ZoomIn size={20} />
            </button>
            <button 
              onClick={handleZoomOut}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white"
            >
              <ZoomOut size={20} />
            </button>
            <button 
              onClick={toggleFullScreen}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-full overflow-hidden">
      <img 
        src={src} 
        alt={caption || "Image"} 
        className="w-full h-auto rounded cursor-pointer hover:opacity-90 transition-opacity"
        onClick={toggleFullScreen}
      />
      {caption && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{caption}</p>
      )}
    </div>
  );
}