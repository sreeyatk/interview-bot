import { useState, useRef, useCallback, useEffect } from "react";

interface UseVideoRecordingReturn {
  isRecording: boolean;
  isPreviewing: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  recordedChunks: Blob[];
  recordingUrl: string | null;
  startPreview: () => Promise<void>;
  stopPreview: () => void;
  startRecording: () => void;
  stopRecording: () => Promise<Blob | null>;
  resetRecording: () => void;
  error: string | null;
}

export const useVideoRecording = (): UseVideoRecordingReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startPreview = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // Prevent echo
        await videoRef.current.play();
      }

      setIsPreviewing(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to access camera";
      setError(message);
      console.error("Camera access error:", err);
    }
  }, []);

  const stopPreview = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsPreviewing(false);
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) {
      setError("No media stream available");
      return;
    }

    try {
      chunksRef.current = [];
      setRecordedChunks([]);
      
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType,
        videoBitsPerSecond: 2500000,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        setError("Recording error occurred");
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start recording";
      setError(message);
      console.error("Recording start error:", err);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
        setIsRecording(false);
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const chunks = chunksRef.current;
        setRecordedChunks(chunks);
        
        if (chunks.length > 0) {
          const blob = new Blob(chunks, { type: chunks[0].type });
          const url = URL.createObjectURL(blob);
          setRecordingUrl(url);
          resolve(blob);
        } else {
          resolve(null);
        }
        
        setIsRecording(false);
      };

      mediaRecorderRef.current.stop();
    });
  }, []);

  const resetRecording = useCallback(() => {
    if (recordingUrl) {
      URL.revokeObjectURL(recordingUrl);
    }
    chunksRef.current = [];
    setRecordedChunks([]);
    setRecordingUrl(null);
    setError(null);
  }, [recordingUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPreview();
      if (recordingUrl) {
        URL.revokeObjectURL(recordingUrl);
      }
    };
  }, [stopPreview, recordingUrl]);

  return {
    isRecording,
    isPreviewing,
    videoRef,
    recordedChunks,
    recordingUrl,
    startPreview,
    stopPreview,
    startRecording,
    stopRecording,
    resetRecording,
    error,
  };
};
