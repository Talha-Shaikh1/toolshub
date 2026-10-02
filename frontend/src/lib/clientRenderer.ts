// Client-Side Canvas Video Renderer (0-Upload Instant Device GPU Rendering)
// Directly renders captioned video on the user's device using Hardware-Accelerated Canvas + MediaRecorder
// Supports 1080p, 2K (1440x2560), and 4K (2160x3840) resolutions with zero server wait time!

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
  resolution?: "original" | "1080p" | "2k" | "4k";
  bgmAudioUrl?: string | null;
  bgmVolume?: number;
  sfxStyle?: string;
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
  return new Promise(async (resolve, reject) => {
    const video = document.createElement("video");
    const videoUrl = URL.createObjectURL(videoFile);
    video.src = videoUrl;
    video.muted = false;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    // Keep video inside viewport so hardware GPU decoder does not throttle frame processing
    video.style.position = "fixed";
    video.style.bottom = "0px";
    video.style.right = "0px";
    video.style.width = "320px";
    video.style.height = "180px";
    video.style.opacity = "0.02";
    video.style.pointerEvents = "none";
    video.style.zIndex = "-1";
    document.body.appendChild(video);

    const playbackSpeed = 1.0; // Strictly 1.0x to preserve audio pitch & precise word sync

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
        const rawW = video.videoWidth || 1080;
        const rawH = video.videoHeight || 1920;
        const aspect = rawW / rawH;
        const duration = video.duration || 15;

        // Determine target dimensions based on selected resolution (Original, 1080p, 2K, 4K)
        let width = rawW;
        let height = rawH;
        const selectedRes = options.resolution || "1080p";

        if (selectedRes === "1080p") {
          if (rawH >= rawW) {
            height = 1920;
            width = Math.round(height * aspect);
          } else {
            width = 1920;
            height = Math.round(width / aspect);
          }
        } else if (selectedRes === "2k") {
          if (rawH >= rawW) {
            height = 2560; // 2K Quad HD
            width = Math.round(height * aspect);
          } else {
            width = 2560;
            height = Math.round(width / aspect);
          }
        } else if (selectedRes === "4k") {
          if (rawH >= rawW) {
            height = 3840; // 4K Ultra HD
            width = Math.round(height * aspect);
          } else {
            width = 3840;
            height = Math.round(width / aspect);
          }
        }

        // Ensure even dimensions required by video encoders
        width = width % 2 === 0 ? width : width + 1;
        height = height % 2 === 0 ? height : height + 1;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) throw new Error("Could not create 2D canvas context");

        // High quality GPU image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Web Audio API destination for mixing video audio + BGM + SFX
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioCtxClass();
        const dest = audioCtx.createMediaStreamDestination();

        // 1. Source Video Audio
        const videoSource = audioCtx.createMediaElementSource(video);
        videoSource.connect(dest);

        // 2. Background Music (BGM)
        let bgmAudio: HTMLAudioElement | null = null;
        if (options.bgmAudioUrl) {
          try {
            bgmAudio = new Audio(options.bgmAudioUrl);
            bgmAudio.crossOrigin = "anonymous";
            bgmAudio.loop = true;
            const bgmSource = audioCtx.createMediaElementSource(bgmAudio);
            const bgmGain = audioCtx.createGain();
            bgmGain.gain.value = options.bgmVolume ?? 0.20;
            bgmSource.connect(bgmGain);
            bgmGain.connect(dest);
          } catch (bgmErr) {
            console.warn("Could not attach BGM to audio mix:", bgmErr);
          }
        }

        // 3. Sound Effects (SFX) Audio Buffers
        const sfxBuffers: Record<string, AudioBuffer> = {};
        if (options.sfxStyle && options.sfxStyle !== "None") {
          const loadSfxBuffer = async (name: string, url: string) => {
            try {
              const res = await fetch(url);
              if (res.ok) {
                const ab = await res.arrayBuffer();
                sfxBuffers[name] = await audioCtx.decodeAudioData(ab);
              }
            } catch {}
          };
          await Promise.allSettled([
            loadSfxBuffer("pop", "/audio/sfx/pop.wav"),
            loadSfxBuffer("ding", "/audio/sfx/ding.wav"),
            loadSfxBuffer("swoosh", "/audio/sfx/swoosh.wav")
          ]);
        }

        const triggeredWords = new Set<number>();
        const playSfx = (type: "pop" | "ding" | "swoosh") => {
          const buf = sfxBuffers[type];
          if (buf && audioCtx.state === "running") {
            try {
              const s = audioCtx.createBufferSource();
              s.buffer = buf;
              const g = audioCtx.createGain();
              g.gain.value = 0.7;
              s.connect(g);
              g.connect(dest);
              s.start();
            } catch {}
          }
        };

        // Canvas video stream (30 fps)
        const canvasStream = canvas.captureStream(30);

        // Combine canvas video + mixed audio destination
        const combinedStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...dest.stream.getAudioTracks()
        ]);

        // Supported MIME type selection
        let selectedMime = "video/webm;codecs=vp9,opus";
        if (typeof MediaRecorder !== "undefined") {
          if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1.4d002a,mp4a.40.2")) {
            selectedMime = "video/mp4;codecs=avc1.4d002a,mp4a.40.2";
          } else if (MediaRecorder.isTypeSupported("video/mp4")) {
            selectedMime = "video/mp4";
          } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
            selectedMime = "video/webm;codecs=vp9,opus";
          } else if (MediaRecorder.isTypeSupported("video/webm")) {
            selectedMime = "video/webm";
          }
        }

        // Quality Bitrate settings based on resolution
        let targetBitrate = 28_000_000; // 28 Mbps for 1080p
        if (selectedRes === "2k") {
          targetBitrate = 45_000_000; // 45 Mbps for 2K
        } else if (selectedRes === "4k") {
          targetBitrate = 75_000_000; // 75 Mbps for 4K
        }

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
            if (bgmAudio) {
              bgmAudio.pause();
              bgmAudio.src = "";
            }
            audioCtx.close().catch(() => {});
            if (video.parentNode) {
              video.parentNode.removeChild(video);
            }
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
        // Scale to 1080p standard height (1920)
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

          // 1. Draw raw video frame with high quality GPU smoothing
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
            const activeWordObj = wordsList[foundIdx];
            const rawWord = activeWordObj.word.toUpperCase();

            // Trigger SFX once per active word
            if (!triggeredWords.has(foundIdx) && options.sfxStyle && options.sfxStyle !== "None") {
              triggeredWords.add(foundIdx);
              const emoji = getWordEmoji(rawWord);
              if (options.sfxStyle.includes("Ding")) {
                if (emoji || ["WIN", "MONEY", "DOLLAR", "GOLD", "PROFIT"].some(k => rawWord.includes(k))) {
                  playSfx("ding");
                }
              } else if (options.sfxStyle.includes("Pop")) {
                if (emoji) playSfx("pop");
              } else {
                // Dynamic Auto
                if (["💰", "💵", "🤑", "💎", "🏆", "🥇"].includes(emoji) || ["WIN", "MONEY", "DOLLAR", "RICH"].some(k => rawWord.includes(k))) {
                  playSfx("ding");
                } else if (["🚀", "⚡", "🏎️", "💥", "🔥"].includes(emoji) || ["VIRAL", "FIRE", "BOOM", "FAST"].some(k => rawWord.includes(k))) {
                  playSfx("swoosh");
                } else if (emoji) {
                  playSfx("pop");
                }
              }
            }

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
                  ctx.shadowColor = "rgba(0,0,0,0.85)";
                  ctx.shadowBlur = Math.round(16 * scaleFactor);
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
                  ctx.shadowColor = "rgba(0,0,0,0.85)";
                  ctx.shadowBlur = Math.round(14 * scaleFactor);
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
                ctx.shadowColor = "rgba(0,0,0,0.65)";
                ctx.shadowBlur = Math.round(8 * scaleFactor);
                ctx.strokeText(it.display, curX, targetY);
                ctx.fillStyle = "#FFFFFF";
                ctx.fillText(it.display, curX, targetY);
                ctx.restore();
              }

              curX += w + gap;
            });
          }

          // Progress callback with resolution label
          if (onProgress && duration > 0) {
            const pct = Math.min(99, Math.round((video.currentTime / duration) * 100));
            const resLabel = selectedRes === "2k" ? "2K Quad HD (1440×2560)" : selectedRes === "4k" ? "4K Ultra HD" : "1080p Full HD";
            onProgress(pct, `⚡ GPU Rendering ${resLabel}: ${pct}% (${video.currentTime.toFixed(1)}s / ${duration.toFixed(1)}s)`);
          }

          if ("requestVideoFrameCallback" in video) {
            (video as any).requestVideoFrameCallback(drawFrame);
          } else {
            requestAnimationFrame(drawFrame);
          }
        };

        video.onended = () => {
          if (onProgress) onProgress(100, "Finalizing frames on device GPU...");
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
        if (bgmAudio) {
          bgmAudio.currentTime = 0;
          bgmAudio.play().catch(() => {});
        }

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
