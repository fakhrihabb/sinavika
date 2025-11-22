'use client';
import { useEffect, useRef } from 'react';
import { Square } from 'lucide-react';

export default function AudioWaveVisualizer({ isRecording, onStop, stream }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const analyzerRef = useRef(null);
  const dataArrayRef = useRef(null);

  useEffect(() => {
    if (!stream || !isRecording) {
      // Stop animation when not recording
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      // Clear canvas
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    // Set up audio analysis
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyzer = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    analyzer.fftSize = 256;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    source.connect(analyzer);
    analyzerRef.current = analyzer;
    dataArrayRef.current = dataArray;

    // Draw waveform
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const draw = () => {
      if (!isRecording) return;

      animationRef.current = requestAnimationFrame(draw);

      analyzer.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.fillStyle = 'rgb(255, 255, 255)';
      ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      // Draw bars
      const barWidth = canvas.offsetWidth / bufferLength * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (canvas.offsetHeight * 0.8);
        
        // Create gradient from green to darker green
        const gradient = ctx.createLinearGradient(0, canvas.offsetHeight - barHeight, 0, canvas.offsetHeight);
        gradient.addColorStop(0, '#03974a');
        gradient.addColorStop(1, '#027d3e');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.offsetHeight - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [stream, isRecording]);

  return (
    <div className="mt-3 bg-white border-2 border-[#03974a] rounded-lg p-4 animate-pulse-slow">
      <div className="flex items-center gap-4">
        {/* Canvas for wave visualization */}
        <div className="flex-1 bg-gray-50 rounded-lg overflow-hidden" style={{ height: '80px' }}>
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ display: 'block' }}
          />
        </div>

        {/* Stop button */}
        <button
          onClick={onStop}
          className="flex-shrink-0 flex items-center justify-center gap-2 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all shadow-lg"
          title="Berhenti merekam"
        >
          <Square className="w-6 h-6 fill-current" />
          <span className="text-sm">Berhenti</span>
        </button>
      </div>

      {/* Recording indicator */}
      <div className="mt-3 flex items-center justify-center gap-2 text-sm text-[#03974a] font-medium">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <span>Merekam... Bicara dengan jelas</span>
      </div>
    </div>
  );
}
