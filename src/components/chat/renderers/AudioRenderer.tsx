import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Volume1, VolumeX } from 'lucide-react';

interface AudioRendererProps {
  src: string;
  transcription?: string;
}

export default function AudioRenderer({ src, transcription }: AudioRendererProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Format time in mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Toggle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  // Toggle mute
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  // Update volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };
  
  // Handle seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    setProgress(newTime);
    audioRef.current.currentTime = newTime;
  };
  
  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      const progressPx = (progress / (duration || 1)) * width;
      
      // Draw progress background
      ctx.fillStyle = '#60a5fa'; // blue-400
      ctx.fillRect(0, 0, progressPx, height);
      
      // Draw remaining background
      ctx.fillStyle = '#e5e7eb'; // gray-200
      ctx.fillRect(progressPx, 0, width - progressPx, height);
      
      // Generate simple waveform
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      
      // Number of points to draw
      const points = 100;
      
      for (let i = 0; i < points; i++) {
        const x = (width / points) * i;
        const factor = Math.min(1, Math.max(0.1, 0.5 + Math.sin(i * 0.2) * 0.4));
        const noise = Math.random() * 0.2 + 0.8;
        const amplitude = height * 0.4 * factor * noise;
        
        ctx.lineTo(x, centerY + amplitude * Math.sin(i * 0.5));
      }
      
      for (let i = points - 1; i >= 0; i--) {
        const x = (width / points) * i;
        const factor = Math.min(1, Math.max(0.1, 0.5 + Math.sin(i * 0.2) * 0.4));
        const noise = Math.random() * 0.2 + 0.8;
        const amplitude = height * 0.4 * factor * noise;
        
        ctx.lineTo(x, centerY - amplitude * Math.sin(i * 0.5));
      }
      
      ctx.closePath();
      
      // Fill waveform with gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(96, 165, 250, 0.8)'); // blue-400
      gradient.addColorStop(1, 'rgba(96, 165, 250, 0.3)');
      ctx.fillStyle = gradient;
      ctx.fill();
    };
    
    draw();
    
    // Update animation
    const interval = setInterval(draw, 100);
    return () => clearInterval(interval);
  }, [progress, duration]);
  
  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      audio.currentTime = 0;
    };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);
  
  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Hidden audio element */}
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Waveform */}
      <div className="px-4 pt-4">
        <canvas 
          ref={canvasRef}
          height={80}
          width={600}
          className="w-full h-20 rounded cursor-pointer"
          onClick={(e) => {
            if (!audioRef.current || !canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const clickPosition = x / rect.width;
            const newTime = clickPosition * duration;
            audioRef.current.currentTime = newTime;
            setProgress(newTime);
          }}
        />
      </div>
      
      {/* Controls */}
      <div className="px-4 pb-4 pt-2 flex items-center gap-4">
        <button 
          onClick={togglePlayPause}
          className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
        </button>
        
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          
          <input 
            type="range"
            min="0"
            max={duration || 100}
            value={progress}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #60a5fa ${(progress / (duration || 1)) * 100}%, #e5e7eb ${(progress / (duration || 1)) * 100}%)`
            }}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            {isMuted ? (
              <VolumeX size={18} />
            ) : volume < 0.5 ? (
              <Volume1 size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>
          
          <input 
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #60a5fa ${volume * 100}%, #e5e7eb ${volume * 100}%)`
            }}
          />
        </div>
      </div>
      
      {/* Transcription */}
      {transcription && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transcription</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{transcription}</p>
        </div>
      )}
    </div>
  );
} 