'use client';
import { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize, Minimize, Move } from 'lucide-react';
import { ImageContent } from '@/types/core';
import Image from 'next/image';

interface ImageViewerProps {
  content: ImageContent;
  onAnnotate?: (annotations: Array<{x: number, y: number, text: string}>) => void;
}

export default function ImageViewer({ content, onAnnotate }: ImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showHotspots, setShowHotspots] = useState(true);
  const [annotations, setAnnotations] = useState<Array<{x: number, y: number, text: string}>>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Hotspots can be AI-generated or manually added
  const demoHotspots = [
    { x: 30, y: 20, text: "Point of interest" },
    { x: 70, y: 60, text: "Notable element" }
  ];

  // Handle zoom in/out
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Handle image panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add new annotation
  const handleAddAnnotation = (e: React.MouseEvent) => {
    if (!containerRef.current || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newAnnotation = {
      x,
      y,
      text: "New annotation"
    };
    
    const updatedAnnotations = [...annotations, newAnnotation];
    setAnnotations(updatedAnnotations);
    
    if (onAnnotate) {
      onAnnotate(updatedAnnotations);
    }
  };

  // Clean up event listeners
  useEffect(() => {
    const handleMouseUpGlobal = () => {
      setIsDragging(false);
    };

    document.addEventListener('mouseup', handleMouseUpGlobal);
    return () => {
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, []);
  
  return (
    <div className="relative w-full overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-lg">
      {/* Image caption if available */}
      {content.caption && (
        <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 z-10">
          {content.caption}
        </div>
      )}
      
      {/* Image container */}
      <div 
        ref={containerRef}
        className={`relative overflow-hidden ${scale !== 1 || (position.x !== 0 || position.y !== 0) ? 'cursor-move' : ''}`}
        style={{ height: '400px' }}
        onDoubleClick={handleAddAnnotation}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s',
            transformOrigin: '0 0'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="select-none"
        >
          <Image
            ref={imageRef}
            src={content.data}
            alt={content.caption || "Image"}
            className="max-w-full h-auto"
            style={{ maxHeight: '400px' }}
          />
          
          {/* Render hotspots when enabled */}
          {showHotspots && demoHotspots.map((hotspot, index) => (
            <div 
              key={index}
              className="absolute w-6 h-6 rounded-full bg-blue-500 bg-opacity-50 border-2 border-blue-600 cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
              style={{ 
                left: `${hotspot.x}%`, 
                top: `${hotspot.y}%`,
              }}
              title={hotspot.text}
            />
          ))}
          
          {/* User annotations */}
          {annotations.map((annotation, index) => (
            <div 
              key={`annotation-${index}`}
              className="absolute w-6 h-6 rounded-full bg-green-500 bg-opacity-50 border-2 border-green-600 cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
              style={{ 
                left: `${annotation.x}%`, 
                top: `${annotation.y}%`,
              }}
              title={annotation.text}
            />
          ))}
        </div>
      </div>
      
      {/* Image controls */}
      <div className="absolute bottom-2 right-2 flex bg-white dark:bg-gray-700 rounded-full shadow-md overflow-hidden">
        <button 
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600"
          title="Zoom in"
        >
          <ZoomIn size={18} />
        </button>
        <button 
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600"
          title="Zoom out"
        >
          <ZoomOut size={18} />
        </button>
        <button 
          onClick={handleResetZoom}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600"
          title="Reset view"
        >
          {scale > 1 ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
        <button 
          onClick={() => setShowHotspots(!showHotspots)}
          className={`p-2 ${showHotspots ? 'bg-blue-100 dark:bg-blue-800' : 'hover:bg-gray-100 dark:hover:bg-gray-600'}`}
          title="Toggle hotspots"
        >
          <Move size={18} />
        </button>
      </div>
    </div>
  );
} 