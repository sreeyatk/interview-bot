import { motion } from "framer-motion";
import { Video, VideoOff, Circle } from "lucide-react";
import { forwardRef } from "react";

interface VideoPreviewProps {
  isPreviewing: boolean;
  isRecording: boolean;
  error?: string | null;
}

export const VideoPreview = forwardRef<HTMLVideoElement, VideoPreviewProps>(
  ({ isPreviewing, isRecording, error }, ref) => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl bg-secondary/30 border border-white/10"
      >
        {/* Video element */}
        <div className="relative aspect-video w-full max-w-[320px] overflow-hidden">
          <video
            ref={ref}
            className="w-full h-full object-cover mirror-video"
            playsInline
            muted
          />

          {/* Recording indicator */}
          {isRecording && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/90 backdrop-blur-sm"
            >
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Circle className="w-3 h-3 fill-current text-white" />
              </motion.div>
              <span className="text-xs font-medium text-white">REC</span>
            </motion.div>
          )}

          {/* No preview state */}
          {!isPreviewing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/80">
              <VideoOff className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Camera off</span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/20 backdrop-blur-sm p-4">
              <VideoOff className="w-8 h-8 text-destructive mb-2" />
              <span className="text-sm text-destructive text-center">{error}</span>
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="px-3 py-2 bg-secondary/50 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPreviewing ? (
              <Video className="w-4 h-4 text-primary" />
            ) : (
              <VideoOff className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground">
              {isPreviewing ? "Camera active" : "Camera inactive"}
            </span>
          </div>
          {isRecording && (
            <span className="text-xs text-destructive font-medium">Recording...</span>
          )}
        </div>
      </motion.div>
    );
  }
);

VideoPreview.displayName = "VideoPreview";
