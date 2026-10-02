// Client-Side Canvas Video Renderer (0-Upload Instant Device Rendering)
// Directly renders captioned video on the user's device using GPU Canvas + MediaRecorder
// Completely eliminates 100MB upload across oceanic cables!

export interface ClientRenderOptions {
  styleName: string;
  fontChoice: string;
  fontSize: number;
  position: string;
  wordsPerChunk: number;
  enableEmojis: boolean;
  activeStyle: {
    badge: string;
    text: string;
    desc: string;
  };
  customFontFamily?: string | null;
  playbackRate?: number;
}

const EMOJI_KEYWORDS: Record<string, string> = {
  MONEY: "💰", CASH: "💵", RICH: "🤑", PROFIT: "📈", DOLLAR: "💵", WEALTH: "💎",
  FIRE: "🔥", VIRAL: "🚀", ROCKET: "🚀", FAST: "⚡", SPEED: "🏎️", BOOM: "💥",
  STOP: "🛑", NEVER: "⛔", WARNING: "⚠️", DANGER: "🚨", SECRET: "🤫",
  BRAIN: "🧠", SMART: "💡", IDEA: "💡", MIND: "🧠", TRUTH: "🎯",
  WIN: "🏆", BEST: "🥇", KING: "👑", CHAMPION: "🏅",
  HEART: "❤️", LOVE: "💖", POWER: "💪", STRONG: "🥊",
  CRY: "😭", SAD: "💔", SHOCK: "😱", OMG: "🤯", CRAZY: "🤪"
};

function getWordEmoji(word: string): string {
  const clean = word.toUpperCase().replace(/[^A-Z]/g, "");
  for (const [key, emoji] of Object.entries(EMOJI_KEYWORDS)) {
    if (clean.includes(key)) return emoji;
  }
  return "";
}

export function renderCaptionedVideoClientSide(
  videoFile: File,
  wordsList: Array<{ word: string; start: number; end: number }>,
  options: ClientRenderOptions,
  onProgress?: (pct: number, step: string) => void
): Promise<{ blob: Blob; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const videoUrl = URL.createObjectURL(videoFile);
    video.src = videoUrl;
    video.muted = false;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    // Keep video inside visible browser viewport bounds so Chrome GPU decoder does NOT throttle frames
    video.style.position = "fixed";
    video.style.bottom = "0px";
    video.style.right = "0px";
    video.style.width = "320px";
    video.style.height = "180px";
    video.style.opacity = "0.02";
    video.style.pointerEvents = "none";
    video.style.zIndex = "-1";
    document.body.appendChild(video);

    const playbackSpeed = 1.0; // Strictly 1.0x to preserve 100% natural duration, audio pitch & word sync

    let cleanup = () => {
      try {
        video.pause();
        video.src = "";
        URL.revokeObjectURL(videoUrl);
        if (video.parentNode) {
          video.parentNode.removeChild(video);
        }
      } catch {}
    };

    video.onloadedmetadata = async () => {
      try {
        const width = video.videoWidth || 1080;
        const height = video.videoHeight || 1920;
        const duration = video.duration || 15;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) throw new Error("Could not create 2D canvas context");

        // Audio capture using Web Audio API
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioCtxClass();
        const source = audioCtx.createMediaElementSource(video);
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);

        // Canvas video stream (30 fps)
        const canvasStream = canvas.captureStream(30);

        // Combine canvas video + element audio
        const combinedStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...dest.stream.getAudioTracks()
        ]);

        // Supported MIME type selection
        let selectedMime = "video/webm;codecs=vp9,opus";
        if (typeof MediaRecorder !== "undefined") {
          if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1,mp4a.40.2")) {
            selectedMime = "video/mp4;codecs=avc1,mp4a.40.2";
          } else if (MediaRecorder.isTypeSupported("video/mp4")) {
            selectedMime = "video/mp4";
          } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
            selectedMime = "video/webm;codecs=vp9,opus";
          } else if (MediaRecorder.isTypeSupported("video/webm")) {
            selectedMime = "video/webm";
          }
        }

        // Calculate exact bitrate from original file size to preserve exact MBs without compression loss
        const computedBitrate = Math.round((videoFile.size * 8) / Math.max(1, duration));
        const targetBitrate = Math.max(25_000_000, computedBitrate);

        const recorder = new MediaRecorder(combinedStream, {
          mimeType: selectedMime,
          videoBitsPerSecond: targetBitrate
        });

        const recordedChunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunks.push(e.data);
          }
        };

        cleanup = () => {
          try {
            video.pause();
            video.src = "";
            URL.revokeObjectURL(videoUrl);
            audioCtx.close().catch(() => {});
          } catch {}
        };

        recorder.onerror = (err) => {
          cleanup();
          reject(err);
        };

        recorder.onstop = () => {
          const finalBlob = new Blob(recordedChunks, { type: selectedMime });
          cleanup();
          resolve({ blob: finalBlob, mimeType: selectedMime });
        };

        // Subtitle font settings
        let fontFamily = "'Arial Black', 'Impact', sans-serif";
        if (options.customFontFamily) {
          fontFamily = `'${options.customFontFamily}', sans-serif`;
        } else if (options.fontChoice.includes("Georgia") || options.fontChoice.includes("Times")) {
          fontFamily = "'Georgia', 'Times New Roman', serif";
        } else if (options.fontChoice.includes("Impact")) {
          fontFamily = "'Impact', 'Arial Black', sans-serif";
        } else if (options.fontChoice.includes("Trebuchet")) {
          fontFamily = "'Trebuchet MS', 'Arial', sans-serif";
        }

        const baseFontSize = options.fontSize || 70;
        // Scale to 1080p native height standard (1920)
        const scaleFactor = height / 1920;
        const renderFontSize = Math.max(36, Math.round(baseFontSize * scaleFactor));
        const wordsPerChunk = options.wordsPerChunk || 3;

        // Position Y
        let targetY = height * 0.82; // Lower Third default
        if (options.position === "Top") targetY = height * 0.15;
        if (options.position === "Center") targetY = height * 0.50;

        let isRendering = true;

        const drawFrame = () => {
          if (!isRendering) return;

          // 1. Draw raw video frame
          ctx.drawImage(video, 0, 0, width, height);

          // 2. Find active word and chunk
          const curTime = video.currentTime;
          let foundIdx = wordsList.findIndex((w) => curTime >= w.start && curTime <= (w.end + 0.18));

          if (foundIdx === -1 && wordsList.length > 0) {
            if (curTime >= wordsList[wordsList.length - 1].end) {
              foundIdx = wordsList.length - 1;
            } else {
              foundIdx = wordsList.findIndex((w) => curTime <= w.start);
              if (foundIdx === -1) foundIdx = 0;
            }
          }

          if (wordsList.length > 0 && foundIdx >= 0) {
            const chunkIdx = Math.floor(foundIdx / wordsPerChunk);
            const startIdx = chunkIdx * wordsPerChunk;
            const chunk = wordsList.slice(startIdx, startIdx + wordsPerChunk);
            const activeIdxInChunk = Math.max(0, Math.min(foundIdx - startIdx, chunk.length - 1));

            // Format items
            const items = chunk.map((item, idx) => {
              const isActive = idx === activeIdxInChunk;
              const emoji = options.enableEmojis ? (getWordEmoji(item.word) || (isActive ? "🔥" : "")) : "";
              const display = emoji ? `${item.word.toUpperCase()} ${emoji}` : item.word.toUpperCase();
              return { display, isActive };
            });

            ctx.font = `900 ${renderFontSize}px ${fontFamily}`;
            ctx.textBaseline = "middle";

            const gap = Math.round(18 * scaleFactor);
            const padX = Math.round(20 * scaleFactor);
            const padY = Math.round(12 * scaleFactor);

            // Measure widths
            const itemWidths = items.map((it) => ctx.measureText(it.display).width);
            const totalChunkWidth = itemWidths.reduce((a, b) => a + b, 0) + (items.length - 1) * gap;

            let curX = (width - totalChunkWidth) / 2;

            items.forEach((it, idx) => {
              const w = itemWidths[idx];
              const isBoxed = options.styleName.includes("Boxed") || options.styleName.includes("Pop");

              if (it.isActive) {
                if (isBoxed) {
                  // Draw boxed rounded background
                  const bx = curX - padX / 2;
                  const by = targetY - renderFontSize / 2 - padY / 2;
                  const bw = w + padX;
                  const bh = renderFontSize + padY;
                  const radius = Math.round(10 * scaleFactor);

                  ctx.save();
                  ctx.fillStyle = options.activeStyle.badge;
                  ctx.shadowColor = "rgba(0,0,0,0.8)";
                  ctx.shadowBlur = Math.round(15 * scaleFactor);
                  ctx.beginPath();
                  if (ctx.roundRect) {
                    ctx.roundRect(bx, by, bw, bh, radius);
                  } else {
                    ctx.rect(bx, by, bw, bh);
                  }
                  ctx.fill();
                  ctx.restore();

                  // Draw text inside box
                  ctx.save();
                  ctx.fillStyle = options.activeStyle.text;
                  ctx.fillText(it.display, curX, targetY);
                  ctx.restore();
                } else {
                  // Active without box (Stroke + Highlight text)
                  ctx.save();
                  ctx.lineWidth = Math.round(12 * scaleFactor);
                  ctx.strokeStyle = "rgba(0,0,0,0.95)";
                  ctx.shadowColor = "rgba(0,0,0,0.8)";
                  ctx.shadowBlur = Math.round(12 * scaleFactor);
                  ctx.strokeText(it.display, curX, targetY);
                  ctx.fillStyle = options.activeStyle.badge;
                  ctx.fillText(it.display, curX, targetY);
                  ctx.restore();
                }
              } else {
                // Inactive word (Thick black outline + White text)
                ctx.save();
                ctx.lineWidth = Math.round(10 * scaleFactor);
                ctx.strokeStyle = "rgba(0,0,0,0.95)";
                ctx.shadowColor = "rgba(0,0,0,0.6)";
                ctx.shadowBlur = Math.round(8 * scaleFactor);
                ctx.strokeText(it.display, curX, targetY);
                ctx.fillStyle = "#FFFFFF";
                ctx.fillText(it.display, curX, targetY);
                ctx.restore();
              }

              curX += w + gap;
            });
          }

          // Progress callback
          if (onProgress && duration > 0) {
            const pct = Math.min(99, Math.round((video.currentTime / duration) * 100));
            onProgress(pct, `Rendering frame: ${video.currentTime.toFixed(1)}s / ${duration.toFixed(1)}s`);
          }

          if ("requestVideoFrameCallback" in video) {
            (video as any).requestVideoFrameCallback(drawFrame);
          } else {
            requestAnimationFrame(drawFrame);
          }
        };

        video.onended = () => {
          if (onProgress) onProgress(100, "Finalizing final frames...");
          setTimeout(() => {
            isRendering = false;
            if (recorder.state === "recording") {
              recorder.stop();
            }
          }, 800);
        };

        // Start recording and fast playback
        recorder.start(100);
        video.playbackRate = playbackSpeed;
        video.currentTime = 0;
        await video.play();

        if ("requestVideoFrameCallback" in video) {
          (video as any).requestVideoFrameCallback(drawFrame);
        } else {
          requestAnimationFrame(drawFrame);
        }
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = () => {
      reject(new Error("Failed to load video file for client-side rendering"));
    };
  });
}
