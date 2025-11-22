import { useState, useRef, useEffect, useCallback } from 'react';

export function useVoiceInteraction() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Text-to-Speech function
  const speak = useCallback(async (text) => {
    try {
      setAudioError(null);
      
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const startTime = performance.now();

      // Fetch audio from TTS API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('TTS API Error:', errorData);
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      const data = await response.json();
      
      const fetchTime = performance.now() - startTime;
      console.log(`TTS fetch took ${fetchTime.toFixed(0)}ms`);
      
      if (!data.audioContent) {
        throw new Error('No audio content received');
      }
      
      // Convert base64 to audio blob (optimized)
      const audioBlob = base64ToBlob(data.audioContent, 'audio/mp3');
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create audio element
      const audio = new Audio();
      audioRef.current = audio;

      // Set up event handlers before setting src
      audio.oncanplaythrough = () => {
        const totalTime = performance.now() - startTime;
        console.log(`Audio ready to play in ${totalTime.toFixed(0)}ms`);
      };

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsPlaying(false);
        setAudioError('Gagal memutar audio');
        URL.revokeObjectURL(audioUrl);
      };

      // Set source and load
      audio.src = audioUrl;
      audio.load();

      // Try to play audio immediately
      try {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      } catch (playError) {
        console.error('Autoplay error:', playError);
        // If autoplay is blocked, just set up the audio but don't show error
        if (playError.name === 'NotAllowedError') {
          console.log('Autoplay blocked by browser - user can manually play');
          // Don't throw error, audio is ready to play when user clicks
        } else {
          throw playError;
        }
      }
      
    } catch (error) {
      console.error('TTS Error:', error);
      setAudioError(error.message || 'Gagal membuat suara');
      setIsPlaying(false);
    }
  }, []);

  // Pause audio playback
  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Resume audio playback
  const resumeAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        console.error('Resume error:', err);
        setAudioError('Gagal melanjutkan audio');
      });
    }
  }, []);

  // Stop audio playback
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setAudioError(null);
      
      // Pause TTS if playing
      if (isPlaying) {
        pauseAudio();
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      // Store stream for visualization
      setAudioStream(stream);

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

    } catch (error) {
      console.error('Recording error:', error);
      setAudioError('Gagal mengakses mikrofon. Pastikan Anda memberikan izin.');
      setAudioStream(null);
    }
  }, [isPlaying, pauseAudio]);

  // Stop recording and get transcript
  const stopRecording = useCallback(async () => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        reject(new Error('No active recording'));
        return;
      }

      const handleStop = async () => {
        setIsRecording(false);
        setIsTranscribing(true);

        try {
          // Create audio blob from chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
          
          console.log('Audio blob size:', audioBlob.size);
          
          if (audioBlob.size === 0) {
            throw new Error('No audio data captured');
          }
          
          // Send to STT API
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          console.log('Sending audio to STT API...');
          
          const response = await fetch('/api/stt', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('STT API Error:', errorData);
            throw new Error(errorData.error || 'Failed to transcribe audio');
          }

          const data = await response.json();
          console.log('STT Response:', data);
          
          setIsTranscribing(false);
          
          if (!data.transcript || data.transcript.trim() === '') {
            setAudioError('Tidak ada suara terdeteksi. Silakan coba lagi.');
            resolve('');
          } else {
            resolve(data.transcript);
          }

        } catch (error) {
          console.error('Transcription error:', error);
          setIsTranscribing(false);
          setAudioError(error.message || 'Gagal membuat transkrip');
          reject(error);
        }
      };

      mediaRecorderRef.current.onstop = handleStop;
      mediaRecorderRef.current.stop();
    });
  }, []);

  return {
    // States
    isPlaying,
    isRecording,
    isTranscribing,
    audioError,
    audioStream,
    
    // TTS functions
    speak,
    pauseAudio,
    resumeAudio,
    stopAudio,
    
    // STT functions
    startRecording,
    stopRecording,
  };
}

// Helper function to convert base64 to blob
function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}
