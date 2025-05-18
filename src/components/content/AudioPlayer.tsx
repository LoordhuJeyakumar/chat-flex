'use client';
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  transcription?: string;
  keyMoments?: Array<{
    time: number;
    label: string;
  }>;
}

export default function AudioPlayer({ audioUrl, transcription, keyMoments = [] }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Generate mock waveform data on initialization
  useEffect(() => {
    // In a real application, you would analyze the audio file
    // For now, we'll generate random data for visualization
    const mockWaveform = Array(100).fill(0).map(() => Math.random() * 0.8 + 0.2);
    setWaveformData(mockWaveform);
  }, [audioUrl]);
  
  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
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
  
  // Draw waveform on canvas when data changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    const barWidth = canvasWidth / waveformData.length;
    const barGap = 1;
    const actualBarWidth = barWidth - barGap;
    
    // Calculate progress position based on current time
    const progressPosition = (currentTime / duration) * canvasWidth;
    
    // Draw waveform
    waveformData.forEach((amplitude, index) => {
      const x = index * barWidth;
      const height = amplitude * canvasHeight;
      const y = (canvasHeight - height) / 2;
      
      // Set color based on whether this part has been played
      if (x <= progressPosition) {
        ctx.fillStyle = '#4f46e5'; // played part
      } else {
        ctx.fillStyle = '#d1d5db'; // unplayed part 
      }
      
      ctx.fillRect(x, y, actualBarWidth, height);
    });
  }, [waveformData, currentTime, duration]);
  
  // Play/pause toggle
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };
  
  // Seek to position in audio
  const handleSeek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas || !audio) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const seekPosition = (x / rect.width) * duration;
    
    audio.currentTime = seekPosition;
    setCurrentTime(seekPosition);
  };
  
  // Skip forward/backward
  const skipTime = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = Math.max(0, Math.min(audio.currentTime + seconds, duration));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  // Toggle mute
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audio.volume = newVolume;
    
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    } else if (newVolume === 0 && !isMuted) {
      setIsMuted(true);
    }
  };
  
  // Format time in MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        preload="metadata"
      />
      
      {/* Waveform visualization */}
      <div className="relative px-4 pt-4 pb-2">
        <canvas 
          ref={canvasRef} 
          height={60} 
          width={600} 
          className="w-full cursor-pointer" 
          onClick={handleSeek}
        />
        
        {/* Key moments markers */}
        {keyMoments.map((moment, index) => {
          const position = (moment.time / duration) * 100;
          return (
            <div 
              key={index}
              className="absolute bottom-2 w-1 h-8 bg-yellow-500"
              style={{ left: `calc(${position}% + 1rem)` }}
              title={moment.label}
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-yellow-100 text-yellow-800 text-xs px-1 py-0.5 rounded whitespace-nowrap">
                {moment.label}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center space-x-2">
          {/* Time display */}
          <div className="text-sm text-gray-500 dark:text-gray-400 w-16">
            {formatTime(currentTime)}
          </div>
          
          {/* Play controls */}
          <button 
            onClick={() => skipTime(-10)} 
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <SkipBack size={20} />
          </button>
          
          <button 
            onClick={togglePlayPause}
            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          
          <button 
            onClick={() => skipTime(10)} 
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <SkipForward size={20} />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Volume control */}
          <button 
            onClick={toggleMute}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume}
            onChange={handleVolumeChange}
            className="w-20"
          />
          
          {/* Duration */}
          <div className="text-sm text-gray-500 dark:text-gray-400 w-16">
            {formatTime(duration)}
          </div>
        </div>
      </div>
      
      {/* Transcription */}
      {transcription && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transcription</h4>
          <div className="text-sm text-gray-600 dark:text-gray-400 max-h-32 overflow-y-auto">
            {transcription}
          </div>
        </div>
      )}
    </div>
  );
} 