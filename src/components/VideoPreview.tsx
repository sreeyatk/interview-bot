import { motion } from "framer-motion";
import { Video, VideoOff, Circle, Square, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  playbackRef: React.RefObject<HTMLVideoElement>;
  isRecording: boolean;
  isPaused: boolean;
  recordedUrl: string | null;
  stream: MediaStream | null;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onClearRecording: () => void;
  showPlayback?: boolean;
}

export const VideoPreview = ({
  videoRef,
  playbackRef,
  isRecording,
  isPaused,
  recordedUrl,
  stream,
  onStartCamera,
  onStopCamera,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onClearRecording,
  showPlayback = false,
}: VideoPreviewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full"
    >
      {/* Live Preview */}
      <div className="relative rounded-2xl overflow-hidden bg-secondary/50 border border-white/10">
        <div className="aspect-video relative">
          {/* Live Video Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${showPlayback && recordedUrl ? "hidden" : ""}`}
          />

          {/* Playback Video */}
          {showPlayback && recordedUrl && (
            <video
              ref={playbackRef}
              src={recordedUrl}
              controls
              className="w-full h-full object-cover"
            />
          )}

          {/* No Camera Placeholder */}
          {!stream && !recordedUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <VideoOff className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Camera not started</p>
            </div>
          )}

          {/* Recording Indicator */}
          {isRecording && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/90 text-destructive-foreground"
            >
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Circle className="w-3 h-3 fill-current" />
              </motion.div>
              <span className="text-sm font-medium">
                {isPaused ? "Paused" : "Recording"}
              </span>
            </motion.div>
          )}

          {/* Camera Ready Indicator */}
          {stream && !isRecording && !showPlayback && (
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/90 text-primary-foreground">
              <Video className="w-3 h-3" />
              <span className="text-sm font-medium">Camera Ready</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 flex items-center justify-center gap-3 bg-black/20 backdrop-blur-sm">
          {!stream ? (
            <Button onClick={onStartCamera} variant="gradient" size="lg">
              <Video className="w-5 h-5 mr-2" />
              Start Camera
            </Button>
          ) : (
            <>
              {!isRecording && !recordedUrl && (
                <>
                  <Button onClick={onStartRecording} variant="gradient" size="lg">
                    <Circle className="w-5 h-5 mr-2 fill-current" />
                    Start Recording
                  </Button>
                  <Button onClick={onStopCamera} variant="glass" size="lg">
                    <VideoOff className="w-5 h-5 mr-2" />
                    Stop Camera
                  </Button>
                </>
              )}

              {isRecording && (
                <>
                  {isPaused ? (
                    <Button onClick={onResumeRecording} variant="glass" size="lg">
                      <Play className="w-5 h-5 mr-2" />
                      Resume
                    </Button>
                  ) : (
                    <Button onClick={onPauseRecording} variant="glass" size="lg">
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </Button>
                  )}
                  <Button
                    onClick={onStopRecording}
                    variant="destructive"
                    size="lg"
                  >
                    <Square className="w-5 h-5 mr-2 fill-current" />
                    Stop Recording
                  </Button>
                </>
              )}

              {recordedUrl && !isRecording && (
                <>
                  <Button onClick={onClearRecording} variant="glass" size="lg">
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Record Again
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
