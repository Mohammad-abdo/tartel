import { useRef, useState, useCallback } from 'react';
import { FiUpload, FiVideo, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const STATES = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

/**
 * Video upload UI: drag & drop, progress, preview, replace/remove.
 * Tarteel-aligned, no layout shift (min-height), clear feedback.
 * API contract: onUpload(file) => Promise<{ url }>, onRemove optional.
 */
function VideoUpload({
  value = '',
  onUpload,
  onRemove,
  accept = 'video/mp4,video/webm,video/quicktime,video/x-msvideo',
  maxSizeMB = 100,
  disabled = false,
  className,
  id,
  'aria-label': ariaLabel,
}) {
  const inputRef = useRef(null);
  const [state, setState] = useState(value ? STATES.COMPLETED : STATES.IDLE);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const reset = useCallback(() => {
    setState(STATES.IDLE);
    setProgress(0);
    setError(null);
    setUploadedUrl(null);
  }, []);

  const validate = useCallback(
    (file) => {
      const allowed = accept.split(',').map((t) => t.trim());
      if (!allowed.some((t) => file.type.toLowerCase().includes(t.split('/')[0]))) {
        return { ok: false, message: 'Invalid video format' };
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        return { ok: false, message: `File too large (max ${maxSizeMB} MB)` };
      }
      return { ok: true };
    },
    [accept, maxSizeMB]
  );

  const doUpload = useCallback(
    async (file) => {
      setError(null);
      setState(STATES.UPLOADING);
      setProgress(10);
      try {
        // Simulate progress if API doesn't support it
        const t = setInterval(() => setProgress((p) => Math.min(p + 15, 90)), 200);
        const result = await onUpload(file);
        clearInterval(t);
        setProgress(100);
        setUploadedUrl(result?.url ?? null);
        setState(STATES.PROCESSING);
        setTimeout(() => setState(STATES.COMPLETED), 300);
        return result;
      } catch (err) {
        setState(STATES.FAILED);
        setError(err.message || 'Upload failed');
        throw err;
      }
    },
    [onUpload]
  );

  const handleFile = useCallback(
    async (file) => {
      if (!file || !onUpload) return;
      const v = validate(file);
      if (!v.ok) {
        setError(v.message);
        setState(STATES.FAILED);
        return;
      }
      await doUpload(file);
    },
    [onUpload, validate, doUpload]
  );

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || state === STATES.UPLOADING || state === STATES.PROCESSING) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled && state !== STATES.UPLOADING && state !== STATES.PROCESSING) setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleReplace = () => {
    reset();
    if (onRemove) onRemove();
    inputRef.current?.click();
  };

  const handleRemove = () => {
    reset();
    if (onRemove) onRemove();
  };

  const isBusy = state === STATES.UPLOADING || state === STATES.PROCESSING;
  const canDrop = state === STATES.IDLE || state === STATES.COMPLETED || state === STATES.FAILED;

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled || isBusy}
        className="sr-only"
        id={id}
        aria-label={ariaLabel}
      />

      {/* Fixed-height area to avoid layout shift */}
      <div
        className={cn(
          'relative min-h-[180px] w-full rounded-xl border-2 border-dashed transition-colors',
          isDragOver && canDrop && 'border-primary bg-primary/5',
          !isDragOver && 'border-border bg-muted/30',
          state === STATES.FAILED && 'border-destructive/50 bg-destructive/5'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {state === STATES.IDLE && !value && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="flex h-full min-h-[180px] w-full flex-col items-center justify-center gap-2 p-4 text-center focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FiUpload className="size-6" aria-hidden />
            </div>
            <span className="text-sm font-medium text-foreground">
              Drag & drop video or click to upload
            </span>
            <span className="text-xs text-muted-foreground">
              MP4, WebM, up to {maxSizeMB} MB
            </span>
          </button>
        )}

        {(state === STATES.UPLOADING || state === STATES.PROCESSING) && (
          <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-3 p-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FiVideo className="size-6 animate-pulse" aria-hidden />
            </div>
            <p className="text-sm font-medium text-foreground">
              {state === STATES.UPLOADING ? 'Uploading…' : 'Processing…'}
            </p>
            <div className="w-full max-w-xs rounded-full bg-muted h-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {state === STATES.COMPLETED && (value || uploadedUrl) && (
          <div className="flex h-full min-h-[180px] flex-col p-4">
            <div className="relative flex-1 rounded-lg bg-black/5 overflow-hidden">
              <video
                src={value || uploadedUrl}
                controls
                className="h-full max-h-[200px] w-full object-contain"
                preload="metadata"
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground truncate flex-1">Video uploaded</span>
              <div className="flex gap-2 shrink-0">
                <Button type="button" variant="secondary" size="sm" onClick={handleReplace}>
                  Replace
                </Button>
                {onRemove && (
                  <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
                    <FiX className="size-4" aria-hidden />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {state === STATES.FAILED && (
          <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-3 p-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <FiAlertCircle className="size-6" aria-hidden />
            </div>
            <p className="text-sm font-medium text-foreground">Upload failed</p>
            {error && <p className="text-xs text-muted-foreground text-center">{error}</p>}
            <Button type="button" variant="outline" size="sm" onClick={handleReplace}>
              Try again
            </Button>
          </div>
        )}

        {/* Idle but value from parent (e.g. edit mode) */}
        {state === STATES.IDLE && value && !uploadedUrl && (
          <div className="flex h-full min-h-[180px] flex-col p-4">
            <div className="relative flex-1 rounded-lg bg-black/5 overflow-hidden">
              <video
                src={value}
                controls
                className="h-full max-h-[200px] w-full object-contain"
                preload="metadata"
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground truncate flex-1">Video uploaded</span>
              <div className="flex gap-2 shrink-0">
                <Button type="button" variant="secondary" size="sm" onClick={handleReplace}>
                  Replace
                </Button>
                {onRemove && (
                  <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
                    <FiX className="size-4" aria-hidden />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoUpload;
export { STATES as VideoUploadStates };
