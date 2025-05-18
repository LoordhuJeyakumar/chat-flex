'use client';
import WaveSurfer from 'wavesurfer.js';
import { useEffect, useRef } from 'react';
export function AudioContent({ url }: { url: string }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (container.current) {
      const ws = WaveSurfer.create({ container: container.current, waveColor: '#ddd', progressColor: '#555' });
      ws.load(url);
    }
  }, [url]);
  return <div ref={container} className="h-16" />;
}