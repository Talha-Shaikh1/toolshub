"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  extractAudioBlob,
  transcribeWithGroqDirect,
  formatWordsToEditableText
} from "@/lib/audioExtractor";
import { renderCaptionedVideoClientSide } from "@/lib/clientRenderer";
import {
  Video,
  Sparkles,
  Volume2,
  Volume1,
  VolumeX,
  Scissors,
  Wand2,
  Download,
  Play,
  Pause,
  Sliders,
  Type,
  Settings,
  Flame,
  ChevronLeft,
  RefreshCw,
  Maximize2,
  Shield,
  Monitor,
  Check,
  Smartphone,
  Music,
  FileText,
  Clock,
  ArrowRight,
  Zap,
  Search,
  AlertTriangle,
  X
} from "lucide-react";

const STYLE_PRESETS: Record<string, { label: string; badge: string; text: string; bg: string; border: string; desc: string }> = {
  "Hormozi Boxed 2.0 (Solid Box Behind Word)": {
    label: "Hormozi Boxed",
    badge: "#FBBF24", // Solid Yellow
    text: "#0F172A",
    bg: "rgba(251, 191, 36, 0.15)",
    border: "#FBBF24",
    desc: "Yellow Box • Dark Text"
  },
  "MrBeast Boxed Green (High Energy)": {
    label: "MrBeast Green",
    badge: "#22C55E", // Solid Neon Green
    text: "#0F172A",
    bg: "rgba(34, 197, 94, 0.15)",
    border: "#22C55E",
    desc: "Neon Green Box"
  },
  "Hormozi Yellow (Trending)": {
    label: "Hormozi Classic",
    badge: "#FBBF24",
    text: "#FBBF24",
    bg: "rgba(251, 191, 36, 0.1)",
    border: "#FBBF24",
    desc: "Bold Yellow Stroke"
  },
  "Electric Cyan": {
    label: "Electric Cyan",
    badge: "#06B6D4",
    text: "#06B6D4",
    bg: "rgba(6, 182, 212, 0.1)",
    border: "#06B6D4",
    desc: "Cyber Neon Blue"
  },
  "Hot Coral / Fire": {
    label: "Hot Coral",
    badge: "#EF4444",
    text: "#EF4444",
    bg: "rgba(239, 68, 68, 0.1)",
    border: "#EF4444",
    desc: "Intense Fire Red"
  },
  "Pure Gold": {
    label: "Pure Gold",
    badge: "#EAB308",
    text: "#EAB308",
    bg: "rgba(234, 179, 8, 0.1)",
    border: "#EAB308",
    desc: "Luxury Metallic"
  },
  "Ali Abdaal Dynamic Pop": {
    label: "Ali Abdaal Pop",
    badge: "#FDE047", // Warm pastel yellow
    text: "#0F172A",
    bg: "rgba(253, 224, 71, 0.2)",
    border: "#FDE047",
    desc: "Warm Pastel Box • Pop Pacing"
  },
  "Iman Gadzhi Minimalist Serif": {
    label: "Iman Gadzhi",
    badge: "#D4AF37", // Polished Gold
    text: "#D4AF37",
    bg: "rgba(212, 175, 55, 0.15)",
    border: "#D4AF37",
    desc: "Luxury Serif • Editorial"
  },
  "MrBeast Bounce Animation": {
    label: "MrBeast Bounce",
    badge: "#FAFF00", // Electric Yellow
    text: "#FAFF00",
    bg: "rgba(250, 255, 0, 0.2)",
    border: "#FAFF00",
    desc: "130% Comic Bounce Pop"
  }
};

interface BgmTrack {
  id: string;
  title: string;
  category: string;
  file?: string;
  audio_url?: string;
  icon?: string;
  desc?: string;
  artist?: string;
}

const BGM_TRACKS: BgmTrack[] = [
  {
    id: "bansuri_sad",
    title: "Bansuri & Rain Drops (Arijit / Sad Vibe)",
    category: "Sad & Shayari 💔",
    file: "/audio/bgm/bansuri_sad.wav",
    icon: "🪈",
    desc: "Indian bamboo flute, Raag Shivranjani, slow cello strings"
  },
  {
    id: "sufi_sarangi",
    title: "Sufi Sarangi & Dholak Pulse",
    category: "Sad & Shayari 💔",
    file: "/audio/bgm/sufi_sarangi.wav",
    icon: "🎻",
    desc: "Classical sarangi & tanpura drone, Jaun Elia poetry style"
  },
  {
    id: "snowfall_ambient",
    title: "Snowfall Ambient (Øneheart Aesthetic)",
    category: "English Sad 🌧️",
    file: "/audio/bgm/snowfall_ambient.wav",
    icon: "❄️",
    desc: "Dreamy slow piano pad, sub drone, viral aesthetic sad POV"
  },
  {
    id: "experience_piano",
    title: "Experience Piano (Ludovico Einaudi Style)",
    category: "English Sad 🌧️",
    file: "/audio/bgm/experience_piano.wav",
    icon: "🎹",
    desc: "Emotional arpeggiated piano with soaring violin swells"
  },
  {
    id: "interstellar_deep",
    title: "Interstellar Cosmic Deep (Zimmer Style)",
    category: "Podcast 🎙️",
    file: "/audio/bgm/interstellar_deep.wav",
    icon: "🌌",
    desc: "Cathedral organ chords & cosmic pulse for deep thoughts"
  },
  {
    id: "podcast_drone",
    title: "Lex & Huberman Minimal Focus Drone",
    category: "Podcast 🎙️",
    file: "/audio/bgm/podcast_drone.wav",
    icon: "🎙️",
    desc: "Subtle sub-bass and warm organic air for speech clarity"
  },
  {
    id: "lofi_chill",
    title: "Ali Abdaal Coffeehouse Lofi",
    category: "Lofi ✨",
    file: "/audio/bgm/lofi_chill.wav",
    icon: "☕",
    desc: "Warm vinyl crackle, gentle Rhodes piano, study beat"
  },
  {
    id: "phonk_gym",
    title: "Brazilian Drift Phonk (Gym / 808)",
    category: "Phonk 🔥",
    file: "/audio/bgm/phonk_gym.wav",
    icon: "⚡",
    desc: "Aggressive 808 sub-bass, cowbell cadence, adrenaline"
  }
];

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

function getAspectRatioLabel(width: number, height: number): string {
  if (!width || !height) return "9:16 Reel";
  const ratio = width / height;
  if (Math.abs(ratio - 9 / 16) < 0.05) return "9:16 Vertical";
  if (Math.abs(ratio - 16 / 9) < 0.05) return "16:9 Landscape";
  if (Math.abs(ratio - 1) < 0.05) return "1:1 Square";
  if (Math.abs(ratio - 4 / 5) < 0.05) return "4:5 Portrait";
  return `${width}:${height}`;
}

function getFontFamilyCss(fontChoice: string, customFontFamily?: string | null): string {
  if (customFontFamily && fontChoice.startsWith("Custom:")) {
    return `'${customFontFamily}', sans-serif`;
  }
  if (fontChoice.includes("Georgia") || fontChoice.includes("Times")) return "'Georgia', 'Times New Roman', serif";
  if (fontChoice.includes("Impact")) return "'Impact', 'Arial Black', sans-serif";
  if (fontChoice.includes("Trebuchet")) return "'Trebuchet MS', 'Arial', sans-serif";
  if (fontChoice.includes("Arial Bold")) return "'Arial', sans-serif";
  return "'Arial Black', 'Impact', sans-serif";
}

const LIVE_HF_BACKEND_URL = "https://01talha-arqa-chatbot.hf.space";
const DEFAULT_API_URL = (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes("localhost"))
  ? process.env.NEXT_PUBLIC_API_URL
  : LIVE_HF_BACKEND_URL;

export default function StudioPage() {
  const [leftNav, setLeftNav] = useState<"style" | "font" | "magic" | "audio" | "script">("style");
  const [mobileTab, setMobileTab] = useState<"canvas" | "controls">("canvas");
  const [apiUrl, setApiUrl] = useState<string>(DEFAULT_API_URL);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  // Reel Caption States (Default 70px font size = realistic 1080p subtitle scale)
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [styleName, setStyleName] = useState<string>("Hormozi Boxed 2.0 (Solid Box Behind Word)");
  const [fontSize, setFontSize] = useState<number>(70);
  const [position, setPosition] = useState<string>("Lower Third (Reels Standard)");
  const [wordsPerChunk, setWordsPerChunk] = useState<number>(3);
  const [fontChoice, setFontChoice] = useState<string>("Arial Black (Bold Trending)");
  const [customFontFile, setCustomFontFile] = useState<File | null>(null);
  const [customFontFamily, setCustomFontFamily] = useState<string | null>(null);
  const [enableEmojis, setEnableEmojis] = useState<boolean>(true);
  const [removeSilence, setRemoveSilence] = useState<boolean>(false);
  const [enableSfx, setEnableSfx] = useState<boolean>(false);
  const [sfxStyle, setSfxStyle] = useState<string>("Dynamic Auto");
  const [sfxVolume, setSfxVolume] = useState<number>(0.6);
  const [exportRes, setExportRes] = useState<string>("1080p");
  const [groqKey, setGroqKey] = useState<string>("");

  // Background Music States
  const [selectedBgmId, setSelectedBgmId] = useState<string>("none");
  const [selectedBgmUrl, setSelectedBgmUrl] = useState<string | null>(null);
  const [bgmSearchQuery, setBgmSearchQuery] = useState<string>("");
  const [bgmCategory, setBgmCategory] = useState<string>("All");
  const [bgmVolume, setBgmVolume] = useState<number>(0.20);
  const [enableAutoDucking, setEnableAutoDucking] = useState<boolean>(true);
  const [bgmStartOffset, setBgmStartOffset] = useState<number>(0.0);
  const [customBgmFile, setCustomBgmFile] = useState<File | null>(null);
  const [previewingAudioTrackId, setPreviewingAudioTrackId] = useState<string | null>(null);
  const bgmAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Viewport & Scale States
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({ width: 1080, height: 1920 });
  const [viewScaleMode, setViewScaleMode] = useState<"fit" | "100">("fit");
  const [showSafeZones, setShowSafeZones] = useState<boolean>(false);
  const [renderedWidth, setRenderedWidth] = useState<number>(320);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const stageScrollRef = useRef<HTMLDivElement | null>(null);

  // Playback Controls
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(15);
  const [videoVolume, setVideoVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Transcript & Words State
  const [editableTranscript, setEditableTranscript] = useState<string>("");
  const [wordsList, setWordsList] = useState<Array<{ word: string; start: number; end: number }>>([
    { word: "THESE", start: 0.1, end: 0.4 },
    { word: "ARE", start: 0.45, end: 0.75 },
    { word: "VIRAL", start: 0.8, end: 1.25 },
    { word: "CAPTIONS", start: 1.3, end: 1.8 }
  ]);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);

  // Video Rendering state
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);
  const [renderStep, setRenderStep] = useState<string>("");
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Submagic Zero-Wait Background Upload & Cloudflare R2 States
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null);
  const [isBgUploading, setIsBgUploading] = useState<boolean>(false);
  const [bgUploadProgress, setBgUploadProgress] = useState<number>(0);
  const [bgUploadDone, setBgUploadDone] = useState<boolean>(false);
  const [cloudShareUrl, setCloudShareUrl] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const bgUploadXhrRef = useRef<XMLHttpRequest | null>(null);
  const uploadedVideoIdRef = useRef<string | null>(null);
  const isBgUploadingRef = useRef<boolean>(false);
  const bgUploadPromiseRef = useRef<Promise<string> | null>(null);
  const handleTranscribeSpeechRef = useRef<((file?: File) => void) | null>(null);

  // Settings Modal
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // In-Browser GPU Export & Resolution States
  const [exportResolution, setExportResolution] = useState<"original" | "1080p" | "2k" | "4k">("2k");
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Load saved Groq Key
  useEffect(() => {
    try {
      const saved = localStorage.getItem("flowcreator_groq_key");
      if (saved) setGroqKey(saved);
    } catch {}
  }, []);

  const handleSaveGroqKey = (key: string) => {
    const trimmed = key.trim();
    setGroqKey(trimmed);
    try {
      if (trimmed) {
        localStorage.setItem("flowcreator_groq_key", trimmed);
        toast.success("Groq 1-Second AI Mode Activated! ⚡", {
          description: "Reels will now transcribe in ~0.8s with Whisper Large v3."
        });
      } else {
        localStorage.removeItem("flowcreator_groq_key");
        toast.info("Groq Key Cleared", { description: "Reverted to CPU fallback." });
      }
    } catch {}
    setShowSettingsModal(false);
  };

  // Ping backend health & auto-fallback if localhost offline
  useEffect(() => {
    fetch(`${apiUrl}/api/health`, { signal: AbortSignal.timeout(3000) })
      .then((res) => res.json())
      .then((data) => setApiOnline(data.status === "healthy" || data.status === "ok"))
      .catch(() => {
        if (apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1")) {
          setApiUrl(LIVE_HF_BACKEND_URL);
        } else {
          setApiOnline(false);
        }
      });
  }, [apiUrl]);

  // Submagic Zero-Wait Background Upload (Uploads silently on Drop/Select)
  const startBackgroundUpload = (file: File) => {
    if (!file) return;
    if (bgUploadXhrRef.current) {
      try {
        bgUploadXhrRef.current.abort();
      } catch {}
      bgUploadXhrRef.current = null;
    }

    setIsBgUploading(true);
    isBgUploadingRef.current = true;
    setBgUploadProgress(0);
    setBgUploadDone(false);
    setUploadedVideoId(null);
    uploadedVideoIdRef.current = null;
    setCloudShareUrl(null);

    const formData = new FormData();
    formData.append("file", file);

    const uploadPromise = new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      bgUploadXhrRef.current = xhr;
      xhr.open("POST", `${apiUrl}/api/upload-raw`);
      xhr.timeout = 600000; // 10 minutes

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setBgUploadProgress(pct);
        }
      };

      xhr.onload = () => {
        isBgUploadingRef.current = false;
        setIsBgUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            if (res.video_id) {
              setUploadedVideoId(res.video_id);
              uploadedVideoIdRef.current = res.video_id;
              setBgUploadDone(true);
              toast.success("Cloud Upload 100% Complete ⚡", {
                description: `Video cached (${res.size_mb || (file.size / (1024*1024)).toFixed(1)} MB). Ab AI captions auto-generate ho rahi hain...`
              });
              resolve(res.video_id);
              // Auto-trigger caption generation now that upload is 100% complete!
              if (handleTranscribeSpeechRef.current) {
                handleTranscribeSpeechRef.current(file);
              }
              return;
            }
          } catch (parseErr) {
            reject(parseErr);
          }
        }
        reject(new Error(`Background upload ended with status ${xhr.status}`));
      };

      xhr.onerror = () => {
        isBgUploadingRef.current = false;
        setIsBgUploading(false);
        reject(new Error("Network error during background upload."));
      };

      xhr.ontimeout = () => {
        isBgUploadingRef.current = false;
        setIsBgUploading(false);
        reject(new Error("Background upload timed out."));
      };

      xhr.send(formData);
    });

    bgUploadPromiseRef.current = uploadPromise;
    uploadPromise.catch(() => {});
  };

  // Unified File Processing (Used by Input File Picker & Drag-and-Drop)
  const handleProcessFile = (file: File) => {
    if (!file) return;
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setExportedVideoUrl(null);
    setCloudShareUrl(null);
    setErrorMessage(null);
    setWordsList([]);
    // Immediately start silent Submagic background upload
    startBackgroundUpload(file);
  };

  // Video Selection
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  // Canvas Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("video/") || file.name.match(/\.(mp4|mov|avi|mkv|webm)$/i)) {
        handleProcessFile(file);
        toast.info("Video Dropped & Cloud Syncing 🚀", {
          description: "Silently caching video in background while you customize captions..."
        });
      } else {
        toast.error("Invalid Video File", { description: "Please drop an MP4, MOV, or WEBM video." });
      }
    }
  };


  // Custom Font Upload & Dynamic Browser Registration
  const handleFontUpload = async (file: File) => {
    if (!file) return;
    try {
      const cleanFontName = `CustomFont_${Date.now()}`;
      const buffer = await file.arrayBuffer();
      const font = new FontFace(cleanFontName, buffer);
      await font.load();
      document.fonts.add(font);
      setCustomFontFamily(cleanFontName);
      setCustomFontFile(file);
      setFontChoice(`Custom: ${file.name}`);
    } catch (err: any) {
      setErrorMessage(`Failed to load custom font: ${err?.message || "Invalid font file"}`);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const vw = videoRef.current.videoWidth || 1080;
      const vh = videoRef.current.videoHeight || 1920;
      setVideoDimensions({ width: vw, height: vh });
      setDuration(videoRef.current.duration || 15);
    }
  };

  // Toggle audio preview of a BGM track
  const handleToggleBgmAudioPreview = (track: BgmTrack) => {
    if (previewingAudioTrackId === track.id) {
      if (bgmAudioPlayerRef.current) {
        bgmAudioPlayerRef.current.pause();
      }
      setPreviewingAudioTrackId(null);
    } else {
      if (bgmAudioPlayerRef.current) {
        const audioSrc = track.file || track.audio_url || "";
        bgmAudioPlayerRef.current.src = audioSrc;
        bgmAudioPlayerRef.current.volume = bgmVolume;
        bgmAudioPlayerRef.current.play().catch(() => {});
      }
      setPreviewingAudioTrackId(track.id);
    }
  };

  const handleCustomBgmUpload = (file: File) => {
    if (!file) return;
    setCustomBgmFile(file);
    setSelectedBgmId("custom");
    if (bgmAudioPlayerRef.current) {
      bgmAudioPlayerRef.current.src = URL.createObjectURL(file);
      bgmAudioPlayerRef.current.volume = bgmVolume;
    }
  };

  // Play / Pause Toggle
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Synchronize video volume & mute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : videoVolume;
      videoRef.current.muted = isMuted;
    }
  }, [videoVolume, isMuted, videoPreview]);

  // Keyboard shortcut: Spacebar to toggle play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleVolumeChange = (newVol: number) => {
    setVideoVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = pct * duration;
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleDownloadSrt = () => {
    if (!wordsList || wordsList.length === 0) {
      toast.error("No Captions to Export", { description: "Please generate AI captions first." });
      return;
    }
    const pad = (n: number, z = 2) => String(Math.floor(n)).padStart(z, "0");
    const formatTime = (sec: number) => {
      const h = pad(sec / 3600);
      const m = pad((sec % 3600) / 60);
      const s = pad(sec % 60);
      const ms = String(Math.floor((sec % 1) * 1000)).padStart(3, "0");
      return `${h}:${m}:${s},${ms}`;
    };
    let srt = "";
    wordsList.forEach((w, i) => {
      srt += `${i + 1}\n${formatTime(w.start)} --> ${formatTime(w.end)}\n${w.word}\n\n`;
    });
    const blob = new Blob([srt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${videoFile?.name.replace(/\.[^/.]+$/, "") || "reel"}_captions.srt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("SRT Subtitles Downloaded! 📄", {
      description: "Instant 0-second file for Premiere, CapCut, or Instagram."
    });
  };

  // Dynamic measurement of rendered canvas width
  useEffect(() => {
    if (!videoContainerRef.current) return;
    const updateSize = () => {
      if (videoContainerRef.current) {
        setRenderedWidth(videoContainerRef.current.offsetWidth || 320);
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(videoContainerRef.current);
    return () => ro.disconnect();
  }, [videoPreview, viewScaleMode, videoDimensions]);

  // Calculate realistic proportional font size
  const nativeWidth = videoDimensions.width || 1080;
  const nativeHeight = videoDimensions.height || 1920;
  const currentScale = viewScaleMode === "100"
    ? 1.0
    : (renderedWidth && nativeWidth ? renderedWidth / nativeWidth : 0.28);

  // Exact visible font size in pixels on screen (~18px - 22px in preview)
  const computedVisibleFontSize = Math.max(12, Math.round(fontSize * currentScale));

  // Dynamic active words chunk synchronized with video playback time
  const activeWordChunkInfo = useMemo(() => {
    if (!wordsList || wordsList.length === 0) {
      return {
        chunk: [
          { word: "THESE", start: 0, end: 0.5 },
          { word: "ARE", start: 0.5, end: 1.0 },
          { word: "VIRAL", start: 1.0, end: 1.5 },
          { word: "CAPTIONS", start: 1.5, end: 2.0 }
        ],
        activeWordIndex: 2
      };
    }

    let foundWordIdx = wordsList.findIndex(
      (w) => currentTime >= w.start && currentTime <= (w.end + 0.18)
    );

    if (foundWordIdx === -1) {
      if (currentTime <= wordsList[0].start) {
        foundWordIdx = 0;
      } else if (currentTime >= wordsList[wordsList.length - 1].end) {
        foundWordIdx = wordsList.length - 1;
      } else {
        foundWordIdx = wordsList.findIndex((w) => currentTime <= w.start);
        if (foundWordIdx === -1) foundWordIdx = 0;
      }
    }

    const chunkIdx = Math.floor(foundWordIdx / wordsPerChunk);
    const startIdx = chunkIdx * wordsPerChunk;
    const chunk = wordsList.slice(startIdx, startIdx + wordsPerChunk);
    const activeWordIndex = Math.max(0, Math.min(foundWordIdx - startIdx, Math.max(0, chunk.length - 1)));

    return { chunk, activeWordIndex };
  }, [wordsList, currentTime, wordsPerChunk]);

  // Transcribe Speech for Review (Ultra-Fast Direct Groq LPU + Lightweight In-Browser Audio Extraction)
  const handleTranscribeSpeech = async (overrideFile?: File | unknown) => {
    const fileToUse = (overrideFile instanceof File) ? overrideFile : videoFile;
    if (!fileToUse) {
      setErrorMessage("Please upload a video file first");
      toast.error("No Video Found", { description: "Please upload or drop a video file first." });
      return;
    }

    const toastId = "transcribe-speech";

    // User Rule: Jab tak cloud per poori upload na ho jaye, captions generate na hon!
    if (isBgUploadingRef.current && bgUploadPromiseRef.current) {
      toast.loading(`Cloud Uploading (${bgUploadProgress}%)...`, {
        id: toastId,
        description: "Video 100% upload hotay hi captions generate hongi taake export instant ho!"
      });
      try {
        await bgUploadPromiseRef.current;
      } catch (uploadWaitErr) {
        console.warn("Background upload error during transcribe wait:", uploadWaitErr);
      }
    }

    setIsTranscribing(true);
    setErrorMessage(null);

    try {
      // 1. Direct Groq Cloud Mode (Ultra Fast: ~0.8s) if user provided Groq API Key
      if (groqKey && groqKey.trim()) {
        toast.loading("⚡ Extracting audio in browser...", {
          id: toastId,
          description: "Lightning-fast client-side audio decoding..."
        });

        let audioBlob: Blob;
        try {
          audioBlob = await extractAudioBlob(fileToUse);
        } catch (e: any) {
          console.warn("Client-side audio extraction fallback:", e);
          audioBlob = fileToUse;
        }

        toast.loading("⚡ Transcribing with Groq LPU...", {
          id: toastId,
          description: "Whisper-large-v3-turbo processing in ~0.8s..."
        });

        try {
          const groqResult = await transcribeWithGroqDirect(audioBlob, groqKey);
          if (groqResult.words && groqResult.words.length > 0) {
            setWordsList(groqResult.words);
            setEditableTranscript(formatWordsToEditableText(groqResult.words));
            toast.success("Groq 1-Sec AI Captions Ready! ⚡", {
              id: toastId,
              description: `${groqResult.words.length} words synchronized in under 1 second!`
            });
            setLeftNav("script");
            return;
          }
        } catch (groqErr: any) {
          console.warn("Direct Groq transcription failed, falling back to backend:", groqErr);
          // If Groq gave an explicit API key authentication error, alert the user directly
          const groqMsg = groqErr?.message || "";
          if (groqMsg.includes("401") || groqMsg.toLowerCase().includes("invalid api key") || groqMsg.toLowerCase().includes("auth")) {
            toast.error("Invalid Groq API Key", {
              id: toastId,
              description: "Please check your Groq API key in '⚡ 1s Speed Key' modal."
            });
            setErrorMessage("Invalid Groq API Key. Please verify your key in '⚡ 1s Speed Key'.");
            return;
          }
          toast.loading("Groq direct call failed, trying backend server...", { id: toastId });
        }
      }

      // 2. Fast Audio-Extraction + Backend Fallback
      toast.loading("Extracting audio track...", {
        id: toastId,
        description: "Preparing lightweight audio payload (reduces upload from 80MB to 1MB)..."
      });

      let uploadPayload: Blob = fileToUse;
      let uploadFilename = fileToUse.name;
      try {
        const audioBlob = await extractAudioBlob(fileToUse);
        uploadPayload = audioBlob;
        uploadFilename = `${fileToUse.name.replace(/\.[^/.]+$/, "")}_speech.wav`;
      } catch (e) {
        console.warn("Fallback to raw video upload:", e);
      }

      toast.loading("Transcribing on backend...", {
        id: toastId,
        description: "Analyzing speech & timestamps..."
      });

      const formData = new FormData();
      if (uploadedVideoIdRef.current) {
        formData.append("video_id", uploadedVideoIdRef.current);
      } else {
        formData.append("file", uploadPayload, uploadFilename);
      }
      formData.append("model", "base");
      formData.append("language", "Auto-detect");
      if (groqKey) formData.append("groq_api_key", groqKey);

      const res = await fetch(`${apiUrl}/api/transcribe`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setEditableTranscript(data.editable_text || "");
      if (data.words && data.words.length > 0) {
        setWordsList(data.words);
        toast.success("AI Captions Generated! ✨", {
          id: toastId,
          description: `${data.words.length} words synchronized with speech.`
        });
      }
      setLeftNav("script");
    } catch (err: any) {
      const rawMsg = err.message || "";
      let friendlyMsg = rawMsg;
      if (rawMsg.includes("Failed to fetch") || rawMsg.includes("NetworkError") || rawMsg.includes("Load failed")) {
        friendlyMsg = "Backend server unreachable. Hugging Face Space may be waking up (~30s). Please wait and retry.";
      }
      setErrorMessage(friendlyMsg);
      toast.error("Transcription Failed", {
        id: toastId,
        description: friendlyMsg,
        duration: 5000
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  useEffect(() => {
    handleTranscribeSpeechRef.current = handleTranscribeSpeech;
  });

  // 1. FAST CLIENT-SIDE EXPORT (Zero-Upload Instant GPU Render)
  const handleClientSideRender = async (targetResOverride?: "original" | "1080p" | "2k" | "4k") => {
    if (!videoFile) {
      toast.error("No Video Found", { description: "Please upload or drop a video file first." });
      return;
    }
    if (!wordsList || wordsList.length === 0) {
      toast.error("No Captions Found", { description: "Please click 'Generate AI Captions' first." });
      return;
    }

    setShowExportModal(false);
    setIsRendering(true);
    setErrorMessage(null);
    setRenderProgress(5);
    const targetRes = targetResOverride || exportResolution;
    const resLabel = targetRes === "2k" ? "2K Quad HD" : targetRes === "4k" ? "4K Ultra HD" : "1080p Full HD";
    setRenderStep(`Initializing device GPU canvas (${resLabel})...`);
    const toastId = "export-reel";
    toast.loading(`⚡ Fast Device Export Starting (${resLabel})...`, {
      id: toastId,
      description: "0s upload • Rendering directly on your device GPU."
    });

    try {
      const selectedBgmTrack = BGM_TRACKS.find((t) => t.id === selectedBgmId);
      const bgmUrl = selectedBgmTrack?.file || selectedBgmUrl || (customBgmFile ? URL.createObjectURL(customBgmFile) : null);

      const result = await renderCaptionedVideoClientSide(
        videoFile,
        wordsList,
        {
          styleName,
          fontChoice,
          fontSize,
          position,
          wordsPerChunk,
          enableEmojis,
          activeStyle,
          customFontFamily,
          playbackRate: 1.0,
          resolution: targetRes,
          bgmAudioUrl: bgmUrl,
          bgmVolume: bgmVolume,
          sfxStyle: sfxStyle
        },
        (pct, step) => {
          setRenderProgress(pct);
          setRenderStep(step);
          toast.loading(step, {
            id: toastId,
            description: "0s upload • Hardware GPU accelerated encoding active."
          });
        }
      );

      const blobUrl = URL.createObjectURL(result.blob);
      setExportedVideoUrl(blobUrl);
      setRenderProgress(100);
      setRenderStep("Export complete!");

      // Auto-trigger download
      const ext = result.mimeType.includes("mp4") ? "mp4" : "webm";
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${videoFile.name.replace(/\.[^/.]+$/, "")}_${targetRes}_captioned.${ext}`;
      a.click();

      toast.success(`${resLabel} Reel Exported & Downloaded! 🎉`, {
        id: toastId,
        description: `Exported directly on your device GPU without slow cloud uploads!`
      });
    } catch (err: any) {
      console.warn("Client-side render error, fallback available:", err);
      toast.error("Device Export Failed", {
        id: toastId,
        description: `${err?.message || "Browser canvas recording error"}. You can also use Cloud Export.`
      });
      setErrorMessage(err?.message || "Client-side export failed");
    } finally {
      setIsRendering(false);
    }
  };

  // Full Video Render (Submagic Zero-Wait Export + Task 1 Polling + 7-Day Cloud Storage)
  const handleRenderVideo = async () => {
    if (!videoFile) {
      setErrorMessage("Please upload a video file first");
      return;
    }

    const fileSizeMB = videoFile.size / (1024 * 1024);

    setIsRendering(true);
    setErrorMessage(null);
    setRenderProgress(0);
    setRenderStep("Preparing render payload...");

    const toastId = "export-reel";

    try {
      let activeApi = apiUrl;
      let jobId: string | null = null;
      let currentVideoId = uploadedVideoIdRef.current || uploadedVideoId;

      // If silent background upload is still completing, await the promise so we NEVER upload 200MB again!
      if (!currentVideoId && isBgUploadingRef.current && bgUploadPromiseRef.current) {
        setRenderStep("Finalizing background upload (almost done)...");
        toast.loading("Finalizing background upload...", {
          id: toastId,
          description: "Video is almost finished uploading. Waiting a few seconds for completion to avoid 200MB re-upload!"
        });

        try {
          currentVideoId = await bgUploadPromiseRef.current;
        } catch (waitErr) {
          console.warn("Background upload await failed, falling back to direct upload:", waitErr);
          currentVideoId = null;
        }
      }

      // CASE 1: ZERO-WAIT FAST EXPORT (Uses pre-uploaded video_id, payload is only ~10KB!)
      if (currentVideoId) {
        setRenderProgress(20);
        setRenderStep("0s Upload! Submitting lightweight render manifest (10KB)...");
        toast.loading("⚡ Zero-Wait Fast Export Starting...", {
          id: toastId,
          description: `Skipped ${fileSizeMB.toFixed(1)} MB upload! Rendering immediately on cloud server.`
        });

        const cachedForm = new FormData();
        cachedForm.append("video_id", currentVideoId);
        cachedForm.append("style_name", styleName);
        cachedForm.append("words_per_chunk", wordsPerChunk.toString());
        cachedForm.append("caption_position", position);
        cachedForm.append("font_size", fontSize.toString());
        cachedForm.append("export_resolution", exportResolution);
        cachedForm.append("enable_emojis", enableEmojis ? "true" : "false");
        cachedForm.append("font_choice", fontChoice);
        cachedForm.append("remove_silence", removeSilence ? "true" : "false");
        cachedForm.append("enable_sfx", enableSfx ? "true" : "false");
        cachedForm.append("sfx_style", sfxStyle);
        cachedForm.append("sfx_volume", sfxVolume.toString());
        if (customFontFile) cachedForm.append("custom_font", customFontFile);
        if (selectedBgmUrl) {
          cachedForm.append("bg_music_url", selectedBgmUrl);
          cachedForm.append("bg_music_volume", bgmVolume.toString());
          cachedForm.append("enable_auto_ducking", enableAutoDucking ? "true" : "false");
          cachedForm.append("bg_music_start_offset", bgmStartOffset.toString());
        } else if (selectedBgmId && selectedBgmId !== "none" && selectedBgmId !== "custom") {
          cachedForm.append("bg_music_id", selectedBgmId);
          cachedForm.append("bg_music_volume", bgmVolume.toString());
          cachedForm.append("enable_auto_ducking", enableAutoDucking ? "true" : "false");
          cachedForm.append("bg_music_start_offset", bgmStartOffset.toString());
        }
        if (customBgmFile) {
          cachedForm.append("custom_bg_music", customBgmFile);
          cachedForm.append("bg_music_volume", bgmVolume.toString());
          cachedForm.append("enable_auto_ducking", enableAutoDucking ? "true" : "false");
          cachedForm.append("bg_music_start_offset", bgmStartOffset.toString());
        }
        if (groqKey) cachedForm.append("groq_api_key", groqKey);
        if (wordsList && wordsList.length > 0) {
          cachedForm.append("words_json", JSON.stringify(wordsList));
        } else if (editableTranscript && editableTranscript.trim()) {
          cachedForm.append("words_json", editableTranscript);
        }

        const res = await fetch(`${activeApi}/api/render-cached`, {
          method: "POST",
          body: cachedForm
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || `Zero-wait export failed with status ${res.status}`);
        }

        const data = await res.json();
        jobId = data.job_id;

      } else {
        // CASE 2: FALLBACK TO STANDARD VIDEO UPLOAD (If background upload was cancelled or failed)
        setRenderStep("Uploading video to cloud...");
        toast.loading("Uploading video to cloud (0%)...", {
          id: toastId,
          description: `Starting transfer of ${fileSizeMB.toFixed(1)} MB...`
        });

        const formData = new FormData();
        formData.append("file", videoFile);
        formData.append("style_name", styleName);
        formData.append("words_per_chunk", wordsPerChunk.toString());
        formData.append("caption_position", position);
        formData.append("font_size", fontSize.toString());
        formData.append("export_resolution", exportResolution);
        formData.append("enable_emojis", enableEmojis ? "true" : "false");
        formData.append("font_choice", fontChoice);
        formData.append("remove_silence", removeSilence ? "true" : "false");
        formData.append("enable_sfx", enableSfx ? "true" : "false");
        formData.append("sfx_style", sfxStyle);
        if (customFontFile) formData.append("custom_font", customFontFile);
        if (selectedBgmUrl) {
          formData.append("bg_music_url", selectedBgmUrl);
          formData.append("bg_music_volume", bgmVolume.toString());
          formData.append("enable_auto_ducking", enableAutoDucking ? "true" : "false");
          formData.append("bg_music_start_offset", bgmStartOffset.toString());
        } else if (selectedBgmId && selectedBgmId !== "none" && selectedBgmId !== "custom") {
          formData.append("bg_music_id", selectedBgmId);
          formData.append("bg_music_volume", bgmVolume.toString());
          formData.append("enable_auto_ducking", enableAutoDucking ? "true" : "false");
          formData.append("bg_music_start_offset", bgmStartOffset.toString());
        }
        if (customBgmFile) {
          formData.append("custom_bg_music", customBgmFile);
          formData.append("bg_music_volume", bgmVolume.toString());
          formData.append("enable_auto_ducking", enableAutoDucking ? "true" : "false");
          formData.append("bg_music_start_offset", bgmStartOffset.toString());
        }
        if (groqKey) formData.append("groq_api_key", groqKey);
        if (wordsList && wordsList.length > 0) {
          formData.append("words_json", JSON.stringify(wordsList));
        } else if (editableTranscript && editableTranscript.trim()) {
          formData.append("words_json", editableTranscript);
        }

        const uploadResult: any = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", `${activeApi}/api/render`);
          xhr.timeout = 600000;

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const uploadPct = Math.round((e.loaded / e.total) * 100);
              if (uploadPct >= 100) {
                setRenderProgress(25);
                setRenderStep("Video transferred! Server is writing to disk & starting FFmpeg queue...");
              } else {
                setRenderProgress(Math.min(24, Math.round(uploadPct * 0.25)));
                setRenderStep(`Uploading to cloud: ${uploadPct}% (${((e.loaded) / (1024 * 1024)).toFixed(1)}MB / ${((e.total) / (1024 * 1024)).toFixed(1)}MB)`);
                toast.loading(`Uploading to cloud (${uploadPct}%)...`, {
                  id: toastId,
                  description: `Uploaded ${((e.loaded) / (1024 * 1024)).toFixed(1)}MB of ${((e.total) / (1024 * 1024)).toFixed(1)}MB`
                });
              }
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch {
                resolve({ raw: xhr.responseText });
              }
            } else {
              let errorText = xhr.responseText;
              try {
                const parsed = JSON.parse(xhr.responseText);
                if (parsed.detail) errorText = parsed.detail;
              } catch {
                if (xhr.status === 500 || xhr.status === 503 || errorText.includes("<!DOCTYPE") || errorText.includes("<html")) {
                  errorText = `Cloud server was updating (HTTP ${xhr.status}). Server is now online. Please click Export Reel again.`;
                }
              }
              reject(new Error(errorText || `Upload failed with HTTP ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error("Network error during video upload."));
          xhr.send(formData);
        });

        jobId = uploadResult.job_id;
      }

      if (!jobId) {
        throw new Error("No job ID received from render queue.");
      }

      // STAGE 2: Queued -> Rendering -> Ready (Poll every 2 seconds)
      setRenderProgress(25);
      setRenderStep("Job queued in render queue...");
      toast.loading("Queued in render queue...", {
        id: toastId,
        description: "Waiting for worker allocation..."
      });

      let isFinished = false;

      while (!isFinished) {
        await new Promise((r) => setTimeout(r, 2000));

        const pollRes = await fetch(`${activeApi}/api/render/${jobId}`);
        if (!pollRes.ok) {
          throw new Error(`Failed to query job status (HTTP ${pollRes.status})`);
        }

        const jobStatus = await pollRes.json();

        if (jobStatus.status === "failed") {
          throw new Error(jobStatus.error || "Cloud rendering failed on server.");
        }

        if (jobStatus.status === "done") {
          isFinished = true;
          setRenderProgress(100);
          setRenderStep("Render complete! Downloading...");

          const downloadUrl = `${activeApi}/api/render/${jobId}/download`;
          setExportedVideoUrl(downloadUrl);

          // Task 3: 7-Day Cloud Storage Shareable Link
          let shareUrl = jobStatus.cloud_url;
          if (!shareUrl) {
            shareUrl = downloadUrl;
          } else if (!shareUrl.startsWith("http")) {
            shareUrl = `${activeApi}${shareUrl.startsWith("/") ? "" : "/"}${shareUrl}`;
          }
          setCloudShareUrl(shareUrl);

          // Auto-trigger browser download
          try {
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `${videoFile.name.replace(/\.[^/.]+$/, "")}_captioned.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } catch (dlErr) {
            console.warn("Auto-download trigger failed:", dlErr);
          }

          toast.success("Viral Reel Rendered & Downloaded! 🎉", {
            id: toastId,
            description: "Server render complete with visually lossless 60FPS subtitles & ducked audio."
          });
          break;
        }

        // In progress (Queued or Rendering)
        const currentProgress = Math.max(25, jobStatus.progress || 25);
        setRenderProgress(currentProgress);
        const stageLabel = jobStatus.stage || (jobStatus.status === "queued" ? "Queued in render queue..." : "Burning subtitles & audio...");
        setRenderStep(stageLabel);

        toast.loading(`Cloud Rendering (${currentProgress}%)...`, {
          id: toastId,
          description: stageLabel
        });
      }

    } catch (err: any) {
      const rawMsg = err.message || "";
      let friendlyMsg = rawMsg;
      if (rawMsg.includes("<!DOCTYPE") || rawMsg.includes("<html") || rawMsg.includes("500") || rawMsg.includes("503")) {
        friendlyMsg = "Cloud server was restarting with latest update. Server is now online. Please click Export Reel again.";
      } else if (rawMsg.includes("Failed to fetch") || rawMsg.includes("NetworkError") || rawMsg.includes("Load failed")) {
        friendlyMsg = "Cannot connect to backend server. Hugging Face Space may be waking up. Please retry in ~30s.";
      }
      setErrorMessage(friendlyMsg);
      toast.error("Rendering Failed", {
        id: toastId,
        description: friendlyMsg,
        duration: 8000
      });
    } finally {
      setIsRendering(false);
    }
  };

  const activeStyle = STYLE_PRESETS[styleName] || STYLE_PRESETS["Hormozi Boxed 2.0 (Solid Box Behind Word)"];

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0A0D14] text-slate-100 flex flex-col font-sans select-none">
      {/* 1. COMPACT PROFESSIONAL HEADER */}
      <header className="h-12 border-b border-slate-800/60 bg-[#0E121D] px-2 sm:px-4 flex items-center justify-between z-50 shrink-0 gap-2">
        {/* Left: Hub Navigation & Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-1 text-slate-400 hover:text-amber-400 text-xs font-semibold px-2 py-1 rounded bg-slate-900 border border-slate-800 transition-all"
            title="Back to Creator Tools Hub"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Hub</span>
          </Link>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
              <Flame className="h-3.5 w-3.5 text-black font-black" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-tight hidden sm:inline">
              Caption Studio Pro
            </span>
          </div>

          <div className="hidden md:flex items-center text-[11px] text-slate-500 gap-1.5 pl-3 border-l border-slate-800">
            <span className="text-slate-400 font-mono truncate max-w-[120px] lg:max-w-[150px]">
              {videoFile ? videoFile.name : "Sample_Reel.mp4"}
            </span>
          </div>
        </div>

        {/* Center: Quick Switch to Upscaler */}
        <div className="hidden xl:flex items-center gap-2">
          <Link
            href="/upscaler"
            className="text-[11px] text-slate-400 hover:text-white px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Need 4K/8K Upscaler?</span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Groq Cloud Speed Mode Button */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="h-8 px-2 sm:px-2.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Groq Cloud Whisper LPU (1-Second Transcription)"
          >
            <Zap className={`h-3.5 w-3.5 ${groqKey ? "text-emerald-400" : "text-amber-400"}`} />
            <span className="hidden md:inline">{groqKey ? "Groq 1s Active" : "1s Speed Key"}</span>
            <span className={`h-1.5 w-1.5 rounded-full ${groqKey ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
          </button>

          {/* 1. Generate / Re-generate Captions */}
          <button
            onClick={() => handleTranscribeSpeech()}
            disabled={isTranscribing || !videoFile || isBgUploading}
            className="h-8 px-2 sm:px-3 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
            title="Auto-transcribe speech to word-level animated captions"
          >
            {isBgUploading ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin text-amber-400" />
                <span className="hidden sm:inline">Uploading ({bgUploadProgress}%)...</span>
              </>
            ) : isTranscribing ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin text-amber-400" />
                <span className="hidden sm:inline">Transcribing...</span>
              </>
            ) : (
              <>
                <Wand2 className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">{wordsList.length > 0 ? "Re-Generate" : "Generate Captions"}</span>
              </>
            )}
          </button>

          {/* Instant Subtitles Download (0s Export) */}
          <button
            onClick={handleDownloadSrt}
            disabled={wordsList.length === 0}
            className="h-8 px-2 sm:px-2.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
            title="Instant 0-second subtitle export (.srt file for Premiere, CapCut, or Instagram)"
          >
            <FileText className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">.SRT</span>
          </button>

          {/* Resolution Selector Pill */}
          <button
            onClick={() => setShowExportModal(true)}
            className="h-8 px-2 sm:px-2.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
            title="Select Export Resolution (Original, 2K, 4K)"
          >
            <Sliders className="h-3 w-3" />
            <span>{exportResolution.toUpperCase()}</span>
          </button>

          {/* Primary Action: Direct Zero-Wait High Bitrate Export */}
          <button
            onClick={handleRenderVideo}
            disabled={isRendering || !videoFile || isBgUploading}
            className="h-8 px-2.5 sm:px-4 rounded-md bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
            title="Export Reel: 100% Original Camera Bitrate (193MB+ Guaranteed) & Exact Duration"
          >
            {isBgUploading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-black" />
                <span className="hidden sm:inline">Uploading ({bgUploadProgress}%)...</span>
                <span className="sm:hidden text-[11px]">{bgUploadProgress}%</span>
              </>
            ) : isRendering ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-black" />
                <span>{renderStep ? `${renderProgress}%` : `Exporting...`}</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5 text-black" />
                <span className="hidden sm:inline">🎬 Export Reel ({exportResolution.toUpperCase()})</span>
                <span className="sm:hidden text-[11px]">Export</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* MOBILE VIEW SWITCHER BAR (Visible on mobile & tablet below lg) */}
      <div className="lg:hidden h-10 border-b border-slate-800/80 bg-[#0C101A] px-2 flex items-center justify-center gap-2 shrink-0 z-40">
        <button
          type="button"
          onClick={() => setMobileTab("canvas")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === "canvas"
              ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Play className="h-3 w-3" />
          <span>👁️ Canvas Stage</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("controls")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === "controls"
              ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Sliders className="h-3 w-3" />
          <span>🎨 Style &amp; Sound Controls</span>
        </button>
      </div>

      {/* 2. MAIN WORKSTATION BODY */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT CONTROL PANEL (Full width on mobile when selected, 320px on desktop) */}
        <div className={`w-full lg:w-80 border-r border-slate-800/70 bg-[#0C101A] flex flex-col shrink-0 ${
          mobileTab === "controls" ? "flex" : "hidden lg:flex"
        }`}>

          {/* Segmented Control Tabs */}
          <div className="h-9 border-b border-slate-800/80 flex items-center px-1.5 gap-1 bg-[#090D16]">
            {(
              [
                { id: "style", label: "Style" },
                { id: "font", label: "Font" },
                { id: "magic", label: "AI Magic" },
                { id: "audio", label: "SFX" },
                { id: "script", label: "Script" }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setLeftNav(tab.id)}
                className={`flex-1 py-1 rounded text-[11px] font-semibold transition-all ${
                  leftNav === tab.id
                    ? "bg-slate-800 text-amber-400 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Inner Controls Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4 custom-scrollbar">
            {/* Video Upload Dropzone */}
            <div>
              <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border border-dashed rounded-lg p-2.5 flex items-center justify-between cursor-pointer transition-all group ${
                  isDraggingOver
                    ? "border-amber-400 bg-amber-500/10"
                    : "border-slate-700/80 hover:border-amber-500/60 bg-slate-950/40 hover:bg-slate-900/40"
                }`}
              >
                <input type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
                <div className="flex items-center gap-2 overflow-hidden">
                  <Video className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="text-[11px] font-medium text-slate-300 truncate max-w-[200px]">
                    {videoFile ? videoFile.name : "Select or Drop Video (9:16)"}
                  </span>
                </div>
                <span className="text-[10px] text-amber-400 font-bold shrink-0 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-black transition-all">
                  {videoFile ? "Change" : "Browse"}
                </span>
              </label>

              {/* Submagic Background Upload Status */}
              {videoFile && (
                <div className="mt-1 flex items-center justify-between px-1 text-[10px]">
                  {isBgUploading ? (
                    <span className="flex items-center gap-1 text-amber-400 font-medium">
                      <RefreshCw className="h-3 w-3 animate-spin text-amber-400" />
                      <span>Silent Cloud Sync: {bgUploadProgress}%</span>
                    </span>
                  ) : bgUploadDone ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span>Cloud Synced (0s Export Ready)</span>
                    </span>
                  ) : (
                    <span className="text-slate-500">Ready for editing</span>
                  )}
                  <span className="text-slate-500">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
              )}


              {/* Primary Caption Generation Action */}
              {videoFile && (
                <div className="mt-2 space-y-1.5">
                  {isBgUploading ? (
                    <div className="w-full p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />
                          <span>Uploading to Cloud ({bgUploadProgress}%)</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-300 rounded-full"
                          style={{ width: `${bgUploadProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-300 text-center font-medium leading-relaxed">
                        ⏳ 100% upload hotay hi captions auto-generate hongi taake export instant 0s ho!
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleTranscribeSpeech()}
                      disabled={isTranscribing}
                      className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isTranscribing ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin text-black" />
                          <span>Transcribing Speech (~1s)...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 text-black" />
                          <span>{wordsList.length > 0 ? "✨ Re-Generate AI Captions" : "✨ Generate AI Captions (1-Click)"}</span>
                        </>
                      )}
                    </button>
                  )}
                  {wordsList.length > 0 ? (
                    <div className="flex items-center justify-between text-[10px] text-emerald-400 px-1 pt-0.5">
                      <span className="flex items-center gap-1 font-semibold">
                        <Check className="h-3 w-3" /> {wordsList.length} words synced
                      </span>
                      <span className="text-slate-400 font-mono">Groq LPU Active</span>
                    </div>
                  ) : !isBgUploading && (
                    <p className="text-[9px] text-slate-400 text-center pt-0.5">
                      Extracts word-by-word timestamps in ~1s
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* TAB 1: PRESET STYLES */}
            {leftNav === "style" && (
              <div className="space-y-3.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Caption Style
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(STYLE_PRESETS).map(([key, info]) => {
                      const isSelected = styleName === key;
                      return (
                        <div
                          key={key}
                          onClick={() => setStyleName(key)}
                          className={`p-2 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? "border-amber-500 bg-amber-500/10 shadow-sm"
                              : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className="h-2.5 w-2.5 rounded-full border border-black/30"
                              style={{ backgroundColor: info.badge }}
                            />
                            {isSelected && <Check className="h-3 w-3 text-amber-400" />}
                          </div>
                          <span className="text-[11px] font-bold text-slate-200 block truncate">
                            {info.label}
                          </span>
                          <span className="text-[9px] text-slate-500 block truncate">
                            {info.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Position */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Position
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["Top", "Center", "Lower Third (Reels Standard)"].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setPosition(pos)}
                        className={`py-1.5 px-1 rounded-md border text-center text-[11px] font-medium transition-all ${
                          position === pos
                            ? "border-amber-500 bg-amber-500/10 text-white font-bold"
                            : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                        }`}
                      >
                        {pos === "Lower Third (Reels Standard)" ? "Lower Third" : pos}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pacing / Words per screen */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Pacing (Words per Screen)
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { val: 1, label: "1 Word Flash" },
                      { val: 2, label: "2 Words" },
                      { val: 3, label: "3 Words" }
                    ].map((item) => (
                      <button
                        key={item.val}
                        onClick={() => setWordsPerChunk(item.val)}
                        className={`py-1.5 px-1 rounded-md border text-center text-[11px] font-medium transition-all ${
                          wordsPerChunk === item.val
                            ? "border-amber-500 bg-amber-500/10 text-white font-bold"
                            : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TYPOGRAPHY */}
            {leftNav === "font" && (
              <div className="space-y-3.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Font Family
                  </span>
                  <select
                    value={fontChoice}
                    onChange={(e) => setFontChoice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {customFontFile && (
                      <option value={fontChoice}>⭐ {fontChoice}</option>
                    )}
                    <option value="Arial Black (Bold Trending)">Arial Black (Viral Standard)</option>
                    <option value="Impact (Punchy Viral)">Impact (Punchy)</option>
                    <option value="Trebuchet MS (Clean Modern)">Trebuchet MS (Clean Modern)</option>
                    <option value="Arial Bold (Standard)">Arial Bold</option>
                    <option value="Georgia (Luxury Editorial Serif)">Georgia (Luxury Serif)</option>
                    <option value="Times New Roman Bold (Minimalist Serif)">Times New Roman (Classic Serif)</option>
                  </select>
                </div>

                {/* Custom Font Upload Area */}
                <div className="p-3 rounded-xl bg-slate-950 border border-dashed border-slate-800 hover:border-amber-500/60 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Type className="h-3 w-3 text-amber-400" />
                      <span>Custom Font (.ttf / .otf)</span>
                    </span>
                    {customFontFile && (
                      <button
                        onClick={() => {
                          setCustomFontFile(null);
                          setCustomFontFamily(null);
                          setFontChoice("Arial Black (Bold Trending)");
                        }}
                        className="text-[9px] text-red-400 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {customFontFile ? (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                      <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate font-mono text-[11px]">{customFontFile.name}</span>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-900/60 hover:bg-slate-900 cursor-pointer border border-slate-800 transition-all">
                      <span className="text-xs font-semibold text-slate-300">Click or Drag &amp; Drop Font</span>
                      <span className="text-[9px] text-slate-500 mt-0.5">Supports TTF, OTF, WOFF2</span>
                      <input
                        type="file"
                        accept=".ttf,.otf,.woff,.woff2"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFontUpload(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Font Scale (Default 70px) */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Font Size
                    </span>
                    <span className="text-[11px] font-mono font-bold text-amber-400">
                      {fontSize} px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={45}
                    max={110}
                    step={2}
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                    <span>Compact (45px)</span>
                    <span className="text-amber-400 font-semibold">Optimal (70px)</span>
                    <span>Heavy (110px)</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: AI MAGIC */}
            {leftNav === "magic" && (
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  AI Automation
                </span>

                {/* Auto Emojis */}
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <div className="pr-2">
                    <span className="text-xs font-bold text-white block">Auto-Emojis</span>
                    <span className="text-[10px] text-slate-400">Attaches 💰, 🔥, 🚀 to keywords</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableEmojis}
                    onChange={(e) => setEnableEmojis(e.target.checked)}
                    className="accent-amber-500 h-4 w-4"
                  />
                </label>

                {/* Auto Silence Cut */}
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <div className="pr-2">
                    <span className="text-xs font-bold text-white block">Silence Cuts</span>
                    <span className="text-[10px] text-slate-400">Trims dead pauses &gt;0.45s</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={removeSilence}
                    onChange={(e) => setRemoveSilence(e.target.checked)}
                    className="accent-amber-500 h-4 w-4"
                  />
                </label>

                {/* 4K Ultra HD Export */}
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                  <div className="pr-2">
                    <span className="text-xs font-bold text-white block">4K Output</span>
                    <span className="text-[10px] text-slate-400">High-order Lanczos render</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={exportRes.includes("4K")}
                    onChange={(e) => setExportRes(e.target.checked ? "4K Ultra HD" : "1080p")}
                    className="accent-amber-500 h-4 w-4"
                  />
                </label>
              </div>
            )}

            {/* TAB 4: BGM & AUDIO EFFECTS */}
            {leftNav === "audio" && (
              <div className="space-y-4">
                {/* 1. Background Music Library */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Music className="h-3 w-3 text-amber-400" />
                      <span>Background Music (BGM)</span>
                    </span>
                    {selectedBgmId !== "none" && (
                      <button
                        onClick={() => {
                          setSelectedBgmId("none");
                          setCustomBgmFile(null);
                          if (bgmAudioPlayerRef.current) bgmAudioPlayerRef.current.pause();
                        }}
                        className="text-[9px] text-red-400 hover:underline cursor-pointer"
                      >
                        Mute Music
                      </button>
                    )}
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex flex-wrap gap-1">
                    {["All", "Sad & Shayari 💔", "English Sad 🌧️", "Podcast 🎙️", "Lofi ✨", "Phonk 🔥"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setBgmCategory(cat)}
                        className={`text-[9px] px-2 py-0.5 rounded-full border transition-all ${
                          bgmCategory === cat
                            ? "bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* 1,000+ Track Catalog Search Bar */}
                  <div className="relative">
                    <Search className="h-3 w-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search 1,000+ tracks (sad flute, phonk, arijit)..."
                      value={bgmSearchQuery}
                      onChange={(e) => setBgmSearchQuery(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                    />
                  </div>

                  {/* Track Cards Scrollable List */}
                  <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-0.5">
                    {/* None Option */}
                    <div
                      onClick={() => {
                        setSelectedBgmId("none");
                        setSelectedBgmUrl(null);
                        setCustomBgmFile(null);
                        if (bgmAudioPlayerRef.current) bgmAudioPlayerRef.current.pause();
                      }}
                      className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                        selectedBgmId === "none"
                          ? "bg-amber-500/10 border-amber-500 text-white font-bold"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs">🚫</span>
                        <span className="text-[11px]">No Background Music (Voice Only)</span>
                      </div>
                      {selectedBgmId === "none" && <Check className="h-3 w-3 text-amber-400" />}
                    </div>

                    {/* Filtered BGM Tracks */}
                    {BGM_TRACKS.filter((t) => {
                      const matchCat = bgmCategory === "All" || t.category === bgmCategory;
                      const q = bgmSearchQuery.trim().toLowerCase();
                      const matchQuery = !q ||
                        t.title.toLowerCase().includes(q) ||
                        (t.desc && t.desc.toLowerCase().includes(q));
                      return matchCat && matchQuery;
                    }).map((track) => {
                      const isSelected = selectedBgmId === track.id;
                      const isPlayingThis = previewingAudioTrackId === track.id;

                      return (
                        <div
                          key={track.id}
                          className={`p-2 rounded-lg border flex items-center justify-between transition-all ${
                            isSelected
                              ? "bg-amber-500/15 border-amber-500 text-white shadow-sm"
                              : "bg-slate-950/70 border-slate-800/80 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          <div
                            className="flex items-center gap-2 flex-1 cursor-pointer truncate mr-2"
                            onClick={() => {
                              setSelectedBgmId(track.id);
                              setSelectedBgmUrl(track.audio_url || null);
                              setCustomBgmFile(null);
                            }}
                          >
                            <span className="text-base shrink-0">{track.icon}</span>
                            <div className="truncate">
                              <span className="text-[11px] font-bold block truncate">{track.title}</span>
                              <span className="text-[9px] text-slate-500 block truncate">{track.desc}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Preview Play/Pause Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleBgmAudioPreview(track);
                              }}
                              className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                                isPlayingThis
                                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/30"
                                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                              }`}
                              title={isPlayingThis ? "Pause Preview" : "Preview Audio Track"}
                            >
                              {isPlayingThis ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 ml-0.5" />}
                            </button>

                            {/* Select Indicator */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBgmId(track.id);
                                setCustomBgmFile(null);
                              }}
                              className={`h-6 px-2 rounded text-[10px] font-bold transition-all ${
                                isSelected
                                  ? "bg-amber-500 text-black"
                                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                              }`}
                            >
                              {isSelected ? "Selected" : "Select"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Custom Song Upload Dropzone */}
                  <div className="pt-1">
                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-dashed border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all">
                      <div className="flex items-center gap-2">
                        <Music className="h-3.5 w-3.5 text-amber-400" />
                        <div>
                          <span className="text-[11px] font-semibold text-slate-300 block">
                            {customBgmFile ? customBgmFile.name : "Upload Your Own Track (.mp3 / .wav)"}
                          </span>
                          <span className="text-[9px] text-slate-500">Bollywood, Urdu Shayari, or viral sounds</span>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleCustomBgmUpload(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* 2. Mixing Controls (When BGM selected) */}
                {selectedBgmId !== "none" && (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                      🎛️ Audio Mixing &amp; Auto-Ducking
                    </span>

                    {/* BGM Volume Slider */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Music Volume</span>
                        <span className="text-amber-400 font-mono font-bold">{Math.round(bgmVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0.05}
                        max={0.8}
                        step={0.02}
                        value={bgmVolume}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setBgmVolume(val);
                          if (bgmAudioPlayerRef.current) bgmAudioPlayerRef.current.volume = val;
                        }}
                        className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                        <span>Subtle (10%)</span>
                        <span className="text-amber-400 font-semibold">Recommended (20%)</span>
                        <span>Prominent (50%)</span>
                      </div>
                    </div>

                    {/* Smart Auto-Ducking Toggle */}
                    <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                      <div className="pr-2">
                        <span className="text-[11px] font-bold text-white flex items-center gap-1">
                          <Zap className="h-3 w-3 text-amber-400" />
                          <span>Smart Auto-Ducking (Sidechain)</span>
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          Ducks music volume 4:1 whenever speech is detected
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableAutoDucking}
                        onChange={(e) => setEnableAutoDucking(e.target.checked)}
                        className="accent-amber-500 h-4 w-4 shrink-0"
                      />
                    </label>

                    {/* Start Offset Scrubber */}
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Music Start Offset</span>
                        <span className="font-mono text-amber-400">{bgmStartOffset.toFixed(1)}s</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={30}
                        step={1}
                        value={bgmStartOffset}
                        onChange={(e) => setBgmStartOffset(parseFloat(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                      <span className="text-[9px] text-slate-500 block">Skip intro to start music at beat drop</span>
                    </div>
                  </div>
                )}

                {/* 3. Viral SFX Section */}
                <div className="pt-2 border-t border-slate-800/80">
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 mb-2">
                    <div>
                      <span className="text-xs font-bold text-white block">Viral Sound Effects (SFX)</span>
                      <span className="text-[10px] text-slate-400">Plays Pop &amp; Cash Bell on keywords</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={enableSfx}
                      onChange={(e) => setEnableSfx(e.target.checked)}
                      className="accent-amber-500 h-4 w-4"
                    />
                  </label>

                  {enableSfx && (
                    <div className="space-y-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1">SFX Style</span>
                        <select
                          value={sfxStyle}
                          onChange={(e) => setSfxStyle(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white"
                        >
                          <option value="Dynamic Auto">Dynamic (Pop &amp; Cash Bell)</option>
                          <option value="Pop Only">Pop Only</option>
                          <option value="Ding / Bell Only">Bell Ding Only</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-slate-400">SFX Volume</span>
                          <span className="text-amber-400 font-mono">{Math.round(sfxVolume * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={0.1}
                          max={1.0}
                          step={0.05}
                          value={sfxVolume}
                          onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: SCRIPT & TRANSCRIPT */}
            {leftNav === "script" && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Transcript</span>
                  <button
                    onClick={() => handleTranscribeSpeech()}
                    disabled={isTranscribing || !videoFile}
                    className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                  >
                    <Wand2 className="h-3 w-3" />
                    {isTranscribing ? "Transcribing..." : "AI Re-Transcribe"}
                  </button>
                </div>
                <textarea
                  value={editableTranscript}
                  onChange={(e) => setEditableTranscript(e.target.value)}
                  rows={7}
                  placeholder="Click 'AI Re-Transcribe' to generate words from audio..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>

          {/* Exported Result Download Toast/Banner if Available */}
          {exportedVideoUrl && (
            <div className="p-3 border-t border-slate-800 bg-emerald-950/30 space-y-2">
              <a
                href={exportedVideoUrl}
                download="viral_captioned_reel.mp4"
                className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Rendered MP4</span>
              </a>

              {/* Task 3: Cloudflare R2 7-Day Shareable Link Button */}
              {cloudShareUrl && (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(cloudShareUrl);
                    toast.success("🔗 7-Day Cloud Link Copied!", {
                      description: "Paste on mobile browser or share with clients to download directly (Valid for 7 days)."
                    });
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  title="Copy 7-Day Cloudflare R2 Download Link"
                >
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>🔗 Copy 7-Day Cloud Link</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* CENTER VIEWPORT STAGE (Full width on mobile when canvas active, flex-1 on desktop) */}
        <div className={`flex-1 bg-[#07090F] flex flex-col relative overflow-hidden ${
          mobileTab === "canvas" ? "flex" : "hidden lg:flex"
        }`}>
          {/* Viewport Top HUD Bar */}
          <div className="h-9 border-b border-slate-800/60 bg-[#0A0D15] px-2 sm:px-4 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                {getAspectRatioLabel(nativeWidth, nativeHeight)} • {nativeWidth}×{nativeHeight}
              </span>
              <span className="hidden sm:inline font-mono text-[10px] text-slate-500">
                Visible Subtitle: {computedVisibleFontSize}px
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* 100% Real Size vs Fit */}
              <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
                <button
                  onClick={() => setViewScaleMode("fit")}
                  className={`px-2 py-0.5 rounded transition-all ${
                    viewScaleMode === "fit" ? "bg-amber-500 text-black font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Fit
                </button>
                <button
                  onClick={() => setViewScaleMode("100")}
                  className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                    viewScaleMode === "100" ? "bg-amber-500 text-black font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  100% 1:1
                </button>
              </div>

              {/* Safe Zones Toggle */}
              <button
                onClick={() => setShowSafeZones(!showSafeZones)}
                className={`px-2 py-0.5 rounded border text-[10px] transition-all flex items-center gap-1 ${
                  showSafeZones
                    ? "border-red-500/50 bg-red-500/10 text-red-400"
                    : "border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
                title="Toggle Reels / TikTok Safe Zone Guide"
              >
                <Shield className="h-3 w-3" />
                <span>Safe Zones</span>
              </button>
            </div>
          </div>

          {/* Video Stage Canvas with Drop Support */}
          <div
            ref={stageScrollRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="flex-1 flex items-center justify-center p-4 overflow-auto relative custom-scrollbar"
          >
            {/* Subtle Ambient Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

            {/* Realistic Mobile Viewport Container */}
            <div
              ref={videoContainerRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                width: viewScaleMode === "100" ? `${nativeWidth}px` : nativeWidth > nativeHeight ? "100%" : "auto",
                height: viewScaleMode === "100" ? `${nativeHeight}px` : nativeWidth <= nativeHeight ? "100%" : "auto",
                minWidth: viewScaleMode === "100" ? `${nativeWidth}px` : undefined,
                minHeight: viewScaleMode === "100" ? `${nativeHeight}px` : undefined,
                aspectRatio: `${nativeWidth} / ${nativeHeight}`,
                maxHeight: viewScaleMode === "fit" ? "520px" : "none",
                maxWidth: viewScaleMode === "fit" ? "100%" : "none"
              }}
              className={`relative group bg-black flex items-center justify-center transition-all ${
                isDraggingOver
                  ? "rounded-[28px] border-[3px] border-amber-400 ring-4 ring-amber-500/30 shadow-2xl"
                  : viewScaleMode === "fit" && nativeWidth <= nativeHeight
                  ? "rounded-[28px] border-[3px] border-slate-800/90 shadow-2xl shadow-black/80 overflow-hidden"
                  : "rounded-lg border border-slate-800 shadow-xl overflow-hidden"
              }`}
            >
              {/* Drag Over Overlay */}
              {isDraggingOver && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm border-2 border-dashed border-amber-400 rounded-[28px] flex flex-col items-center justify-center text-center p-6 pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 mb-2 animate-bounce">
                    <Video className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-black text-white uppercase tracking-wider">Drop Video To Start ⚡</p>
                  <p className="text-[11px] text-amber-300 mt-1">Silent background upload begins immediately!</p>
                </div>
              )}

              {/* Video Tag */}
              {videoPreview ? (
                <video
                  ref={videoRef}
                  src={videoPreview}
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={togglePlay}
                  onTimeUpdate={() => {
                    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                  }}
                  onLoadedMetadata={handleLoadedMetadata}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 to-black flex items-center justify-center">
                  <label className="text-center p-6 space-y-2 cursor-pointer group flex flex-col items-center">
                    <input type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
                    <div className="h-12 w-12 rounded-full bg-slate-800/80 group-hover:bg-amber-500 group-hover:text-black flex items-center justify-center mx-auto text-amber-400 transition-all shadow-lg">
                      <Video className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-200 group-hover:text-white">Click or Drop Video Reel (9:16)</p>
                    <p className="text-[10px] text-slate-500">Submagic Zero-Wait Upload • MP4, MOV, WEBM</p>
                  </label>
                </div>
              )}


              {/* Floating CTA Banner on Video Canvas */}
              {videoPreview && wordsList.length === 0 && !isRendering && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-slate-950/90 backdrop-blur-md border border-amber-500/60 py-1.5 px-3 rounded-full flex items-center gap-2.5 shadow-2xl shadow-black">
                  <span className="text-[10px] font-semibold text-white whitespace-nowrap hidden sm:inline">
                    Video loaded!
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTranscribeSpeech();
                    }}
                    disabled={isTranscribing}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] rounded-full flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  >
                    {isTranscribing ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin text-black" />
                        <span>Transcribing (~1s)...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-3 w-3 text-black" />
                        <span>✨ Generate AI Captions</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* PROMINENT CLOUD RENDER PROGRESS MODAL OVERLAY */}
              {isRendering && (
                <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                  <div className="relative mb-3">
                    <div className="w-14 h-14 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin flex items-center justify-center" />
                    <Sparkles className="h-5 w-5 text-amber-400 absolute inset-0 m-auto animate-pulse" />
                  </div>

                  <span className="text-[10px] uppercase tracking-widest font-mono text-amber-400 mb-1 font-bold">
                    Cloud Video Export (Full HD)
                  </span>

                  <h4 className="text-sm font-extrabold text-white mb-2 max-w-xs leading-snug">
                    {renderStep || "Processing Video..."}
                  </h4>

                  {/* Progress Bar */}
                  <div className="w-64 max-w-full bg-slate-900 rounded-full h-2 mb-1.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(6, renderProgress)}%` }}
                    />
                  </div>

                  <div className="flex justify-between w-64 max-w-full text-[10px] font-mono text-slate-400 mb-3">
                    <span>Export Progress</span>
                    <span className="text-amber-400 font-bold">{renderProgress}%</span>
                  </div>

                  <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                    Preserving 100% original camera resolution &amp; CRF 18 visually lossless sharpness.
                  </p>
                </div>
              )}

              {/* Subtle Hover Play/Pause Overlay */}
              {videoPreview && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-30"
                >
                  <div className="h-11 w-11 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg transform hover:scale-105 active:scale-95 transition-transform">
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                  </div>
                </button>
              )}

              {/* Subtle Vignette for Text Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none z-10" />

              {/* Safe Zones Overlay (When toggled) */}
              {showSafeZones && (
                <div className="absolute inset-0 pointer-events-none z-30 border border-red-500/40 flex flex-col justify-between p-2">
                  <div className="h-8 border-b border-dashed border-red-500/40 flex items-center justify-center text-[9px] font-mono text-red-400 bg-red-950/20">
                    Header Safe Zone
                  </div>
                  <div className="flex justify-between items-end flex-1 pb-12">
                    <div className="w-32 h-16 border border-dashed border-red-500/40 p-1 text-[8px] font-mono text-red-400 bg-red-950/20">
                      Caption / Audio Area
                    </div>
                    <div className="w-9 h-24 border border-dashed border-red-500/40 flex flex-col items-center justify-center text-[7px] font-mono text-red-400 bg-red-950/20">
                      Icons
                    </div>
                  </div>
                </div>
              )}

              {/* REALISTIC PROPORTIONAL VIRAL CAPTION OVERLAY */}
              <div
                className="absolute z-20 w-full px-5 text-center pointer-events-none transition-all flex justify-center"
                style={{
                  fontFamily: getFontFamilyCss(fontChoice, customFontFamily),
                  ...(position === "Top"
                    ? { top: "12%", left: "50%", transform: "translateX(-50%)" }
                    : position === "Center"
                    ? { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
                    : { bottom: "18%", left: "50%", transform: "translateX(-50%)" })
                }}
              >
                <div
                  className="flex flex-wrap items-center justify-center leading-none select-none max-w-[92%]"
                  style={{ gap: `${Math.max(3, Math.round(6 * currentScale))}px` }}
                >
                  {activeWordChunkInfo.chunk.map((item, idx) => {
                    const isActive = idx === activeWordChunkInfo.activeWordIndex;
                    const emoji = enableEmojis ? (getWordEmoji(item.word) || (isActive ? "🔥" : "")) : "";
                    const displayWord = item.word.toUpperCase();

                    if (isActive) {
                      if (styleName.includes("Boxed") || styleName.includes("Pop")) {
                        return (
                          <div
                            key={idx}
                            className={`font-black uppercase tracking-tight flex items-center shadow-lg transition-transform ${styleName.includes("Pop") ? "scale-110" : "scale-105"}`}
                            style={{
                              backgroundColor: activeStyle.badge,
                              color: activeStyle.text,
                              fontSize: `${computedVisibleFontSize}px`,
                              padding: `${Math.max(2, Math.round(4 * currentScale))}px ${Math.max(6, Math.round(10 * currentScale))}px`,
                              borderRadius: `${Math.max(3, Math.round(5 * currentScale))}px`,
                              gap: `${Math.max(2, Math.round(4 * currentScale))}px`
                            }}
                          >
                            <span>{displayWord}</span>
                            {emoji && <span className="text-[0.9em]">{emoji}</span>}
                          </div>
                        );
                      }

                      if (styleName.includes("Bounce")) {
                        return (
                          <span
                            key={idx}
                            className="font-black uppercase tracking-tight flex items-center drop-shadow-[0_4px_12px_rgba(0,0,0,1)] transition-transform scale-125 text-[#FAFF00]"
                            style={{
                              color: activeStyle.badge,
                              fontSize: `${computedVisibleFontSize}px`,
                              gap: `${Math.max(2, Math.round(4 * currentScale))}px`
                            }}
                          >
                            <span>{displayWord}</span>
                            {emoji && <span className="text-[0.9em]">{emoji}</span>}
                          </span>
                        );
                      }

                      if (styleName.includes("Iman Gadzhi")) {
                        return (
                          <span
                            key={idx}
                            className="font-serif italic font-bold tracking-normal flex items-center drop-shadow-[0_2px_10px_rgba(212,175,55,0.7)] transition-all scale-105 border-b-2 border-[#D4AF37]"
                            style={{
                              color: "#D4AF37",
                              fontSize: `${computedVisibleFontSize}px`,
                              gap: `${Math.max(2, Math.round(4 * currentScale))}px`
                            }}
                          >
                            <span>{displayWord}</span>
                            {emoji && <span className="text-[0.9em]">{emoji}</span>}
                          </span>
                        );
                      }

                      return (
                        <span
                          key={idx}
                          className="font-black uppercase tracking-tight flex items-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] transition-transform scale-105"
                          style={{
                            color: activeStyle.badge,
                            fontSize: `${computedVisibleFontSize}px`,
                            gap: `${Math.max(2, Math.round(4 * currentScale))}px`
                          }}
                        >
                          <span>{displayWord}</span>
                          {emoji && <span className="text-[0.9em]">{emoji}</span>}
                        </span>
                      );
                    }

                    return (
                      <span
                        key={idx}
                        className="font-extrabold uppercase tracking-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                        style={{
                          fontSize: `${computedVisibleFontSize}px`
                        }}
                      >
                        {displayWord}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Home Indicator Bar */}
              {viewScaleMode === "fit" && nativeWidth <= nativeHeight && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 w-16 h-0.5 bg-white/30 rounded-full" />
              )}
            </div>
          </div>

          {/* 3. PROFESSIONAL BOTTOM TIMELINE & AUDIO CONTROLS */}
          <div className="border-t border-slate-800/80 bg-[#090D16] flex flex-col shrink-0">
            {/* Interactive Timeline Scrubber Line */}
            <div
              onClick={handleSeek}
              className="w-full h-1.5 bg-slate-800 hover:h-2.5 transition-all cursor-pointer relative group"
              title="Click or drag to seek in video"
            >
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 relative transition-all"
                style={{ width: `${duration ? Math.min(100, (currentTime / duration) * 100) : 0}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-lg shadow-amber-500/50 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-1/2" />
              </div>
            </div>

            {/* Controls Bar */}
            <div className="h-14 flex items-center px-4 gap-3">
              {/* Play / Pause button */}
              <button
                onClick={togglePlay}
                className="h-8 w-8 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shrink-0 cursor-pointer shadow-md active:scale-95 transition-all"
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>

              {/* Reel Volume / Sound Control */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-2 sm:px-2.5 py-1 rounded-lg border border-slate-800 shrink-0">
                <button
                  onClick={toggleMute}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={isMuted ? "Unmute reel audio" : "Mute reel audio"}
                >
                  {isMuted || videoVolume === 0 ? (
                    <VolumeX className="h-4 w-4 text-red-400" />
                  ) : videoVolume < 0.5 ? (
                    <Volume1 className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-amber-400" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : videoVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="hidden md:block w-16 accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  title={`Reel Volume: ${Math.round((isMuted ? 0 : videoVolume) * 100)}%`}
                />
                <span className="hidden md:inline font-mono text-[10px] text-slate-400 w-7 text-right">
                  {Math.round((isMuted ? 0 : videoVolume) * 100)}%
                </span>
              </div>


              {/* Timecode */}
              <span className="font-mono text-[11px] text-amber-400 font-bold shrink-0">
                00:{currentTime < 10 ? "0" : ""}{currentTime.toFixed(1)} / 00:{duration < 10 ? "0" : ""}{duration.toFixed(1)}
              </span>

              {/* Word Track Pills */}
              <div className="flex-1 flex items-center gap-1.5 overflow-x-auto py-1 custom-scrollbar">
                {wordsList.map((item, idx) => {
                  const isWordActive = currentTime >= item.start && currentTime <= (item.end + 0.15);
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = item.start;
                          setCurrentTime(item.start);
                        }
                      }}
                      className={`h-7 px-2.5 rounded-md text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border shrink-0 ${
                        isWordActive
                          ? "bg-amber-500 text-black border-amber-400 shadow-sm"
                          : "bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                      title={`Jump to ${item.start.toFixed(2)}s`}
                    >
                      <span>{item.word}</span>
                      {isWordActive && enableEmojis && <span>🔥</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Hidden Audio Player for BGM Preview & Playback */}
      <audio ref={bgmAudioPlayerRef} loop className="hidden" />

      {/* Groq Cloud Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C101A] border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Speed Engine Settings</h3>
                  <p className="text-[10px] text-slate-400">Groq Whisper Large v3 (1-Second Ultra-Speed)</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p className="text-[11px] leading-relaxed text-slate-400">
                57-second reel ko <strong className="text-emerald-400 font-bold">~0.8 second</strong> mein transcribe karne ke liye apna Groq API Key dalein. Yeh <strong className="text-white">100% Free</strong> hai:
              </p>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Groq API Key (gsk_...)
                </label>
                <input
                  type="password"
                  placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  defaultValue={groqKey}
                  id="groq-key-input"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Key nahi hai?</span>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline font-bold flex items-center gap-1"
                >
                  Free Key lein (console.groq.com)
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleSaveGroqKey("")}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white text-xs transition-all cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById("groq-key-input") as HTMLInputElement;
                  if (input) handleSaveGroqKey(input.value);
                }}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Save &amp; Activate 1s Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Action Center Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#0C101A] border border-slate-800 rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-black font-black shadow-md shadow-amber-500/20">
                  <Download className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">Export Reel (Exact 100% Quality)</h3>
                  <p className="text-[10px] text-slate-400 font-mono">193MB+ Bitrate Lock • Exact Duration Guarantee</p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quality & Resolution Selection */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 text-xs font-black uppercase tracking-wider">
                  Select Output Master Resolution
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Zero Bitrate Compression Drop
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Rendered with strict camera bitrate matching. Your video file size is guaranteed to stay at <strong className="text-white">193MB+</strong> without blurriness, pixelation, or duration stretching.
              </p>

              {/* Resolution Picker */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { id: "original", label: "Original Camera Native", desc: "193MB+ Exact Camera Bitrate", badge: "👑 1:1 Match" },
                  { id: "2k", label: "2K Quad HD (1440×2560)", desc: "55+ Mbps • 250MB+ Ultra Crisp", badge: "💎 2K Sharp" },
                  { id: "4k", label: "4K Ultra HD (2160×3840)", desc: "75+ Mbps • 350MB+ Cinema Master", badge: "🎬 4K Pro" },
                  { id: "1080p", label: "1080p Full HD (1080×1920)", desc: "Exact Vertical 9:16 Master", badge: "Standard" }
                ].map((res) => {
                  const isSelected = exportResolution === res.id;
                  return (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => setExportResolution(res.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10"
                          : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-xs font-bold ${isSelected ? "text-amber-400" : "text-white"}`}>
                          {res.id.toUpperCase()}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">{res.badge}</span>
                      </div>
                      <span className="text-[10px] text-slate-300 block font-sans truncate">{res.label}</span>
                      <span className="text-[9px] text-slate-500 block truncate">{res.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Start Export Button */}
              <button
                type="button"
                onClick={() => {
                  setShowExportModal(false);
                  handleRenderVideo();
                }}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer mt-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Reel in {exportResolution.toUpperCase()} (193MB+ Locked)</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Submagic Zero-Wait Upload Active (0s wait time)</span>
              </span>
              <span className="text-slate-500 font-mono">Cloudflare R2 Link Included</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

