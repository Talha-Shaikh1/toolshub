"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Video,
  Sparkles,
  Volume2,
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
  Search
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

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || "https://01talha-arqa-chatbot.hf.space";

export default function StudioPage() {
  const [leftNav, setLeftNav] = useState<"style" | "font" | "magic" | "audio" | "script">("style");
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

  // Settings Modal
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Ping backend health
  useEffect(() => {
    fetch(`${apiUrl}/api/health`)
      .then((res) => res.json())
      .then((data) => setApiOnline(data.status === "healthy" || data.status === "ok"))
      .catch(() => setApiOnline(false));
  }, [apiUrl]);

  // Video Selection
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setExportedVideoUrl(null);
      setErrorMessage(null);
      // Auto-trigger speech transcription on file pick!
      handleTranscribeSpeech(file);
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

  // Transcribe Speech for Review
  const handleTranscribeSpeech = async (overrideFile?: File | unknown) => {
    const fileToUse = (overrideFile instanceof File) ? overrideFile : videoFile;
    if (!fileToUse) {
      setErrorMessage("Please upload a video file first");
      return;
    }
    setIsTranscribing(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", fileToUse);
    formData.append("model", "base");
    formData.append("language", "Auto-detect");
    if (groqKey) formData.append("groq_api_key", groqKey);

    try {
      const res = await fetch(`${apiUrl}/api/transcribe`, {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setEditableTranscript(data.editable_text || "");
      if (data.words && data.words.length > 0) {
        setWordsList(data.words);
      }
      setLeftNav("script");
    } catch (err: any) {
      setErrorMessage(`Transcription Error: ${err.message || "Failed to transcribe audio"}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Full Video Render
  const handleRenderVideo = async () => {
    if (!videoFile) {
      setErrorMessage("Please upload a video file first");
      return;
    }

    setIsRendering(true);
    setErrorMessage(null);
    setRenderProgress(15);
    setRenderStep("Analyzing audio...");

    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("style_name", styleName);
    formData.append("words_per_chunk", wordsPerChunk.toString());
    formData.append("caption_position", position);
    formData.append("font_size", fontSize.toString());
    formData.append("export_resolution", exportRes);
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
    if (editableTranscript) formData.append("words_json", editableTranscript);

    try {
      setRenderProgress(45);
      setRenderStep("Generating vector subtitles...");

      const res = await fetch(`${apiUrl}/api/render`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error(await res.text());

      setRenderProgress(85);
      setRenderStep("Burning subtitles into MP4...");

      const blob = await res.blob();
      const videoBlobUrl = URL.createObjectURL(blob);
      setExportedVideoUrl(videoBlobUrl);
      setRenderProgress(100);
      setRenderStep("Export complete!");
    } catch (err: any) {
      setErrorMessage(`Rendering failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsRendering(false);
    }
  };

  const activeStyle = STYLE_PRESETS[styleName] || STYLE_PRESETS["Hormozi Boxed 2.0 (Solid Box Behind Word)"];

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0A0D14] text-slate-100 flex flex-col font-sans select-none">
      {/* 1. COMPACT PROFESSIONAL HEADER */}
      <header className="h-12 border-b border-slate-800/60 bg-[#0E121D] px-4 flex items-center justify-between z-50 shrink-0">
        {/* Left: Hub Navigation & Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1 text-slate-400 hover:text-amber-400 text-xs font-semibold px-2 py-1 rounded bg-slate-900 border border-slate-800 transition-all"
            title="Back to Creator Tools Hub"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Hub</span>
          </Link>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center">
              <Flame className="h-3.5 w-3.5 text-black font-black" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-tight">
              Caption Studio Pro
            </span>
          </div>

          <div className="hidden md:flex items-center text-[11px] text-slate-500 gap-1.5 pl-3 border-l border-slate-800">
            <span className="text-slate-400 font-mono truncate max-w-[150px]">
              {videoFile ? videoFile.name : "Sample_Reel.mp4"}
            </span>
          </div>
        </div>

        {/* Center: Quick Switch to Upscaler */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/upscaler"
            className="text-[11px] text-slate-400 hover:text-white px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Need 4K/8K Upscaler?</span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* 1. Generate / Re-generate Captions */}
          <button
            onClick={() => handleTranscribeSpeech()}
            disabled={isTranscribing || !videoFile}
            className="h-8 px-3 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
            title="Auto-transcribe speech to word-level animated captions"
          >
            {isTranscribing ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin text-amber-400" />
                <span>Transcribing...</span>
              </>
            ) : (
              <>
                <Wand2 className="h-3.5 w-3.5 text-amber-400" />
                <span>{wordsList.length > 0 ? "Re-Generate" : "Generate Captions"}</span>
              </>
            )}
          </button>

          {/* 2. Export Final MP4 */}
          <button
            onClick={handleRenderVideo}
            disabled={isRendering || !videoFile}
            className="h-8 px-3.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
          >
            {isRendering ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-black" />
                <span>Export Reel</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSTATION BODY */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT CONTROL PANEL (Width: 320px) */}
        <div className="w-80 border-r border-slate-800/70 bg-[#0C101A] flex flex-col shrink-0">
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
              <label className="border border-dashed border-slate-700/80 hover:border-amber-500/60 rounded-lg p-2.5 flex items-center justify-between cursor-pointer bg-slate-950/40 hover:bg-slate-900/40 transition-all group">
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

              {/* Primary Caption Generation Action */}
              {videoFile && (
                <div className="mt-2 space-y-1">
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
                  {wordsList.length > 0 ? (
                    <div className="flex items-center justify-between text-[10px] text-emerald-400 px-1 pt-0.5">
                      <span className="flex items-center gap-1 font-semibold">
                        <Check className="h-3 w-3" /> {wordsList.length} words synced
                      </span>
                      <span className="text-slate-400 font-mono">Groq LPU Active</span>
                    </div>
                  ) : (
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
            <div className="p-3 border-t border-slate-800 bg-emerald-950/30">
              <a
                href={exportedVideoUrl}
                download="viral_captioned_reel.mp4"
                className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                Download Rendered MP4
              </a>
            </div>
          )}
        </div>

        {/* CENTER VIEWPORT STAGE */}
        <div className="flex-1 bg-[#07090F] flex flex-col relative overflow-hidden">
          {/* Viewport Top HUD Bar */}
          <div className="h-9 border-b border-slate-800/60 bg-[#0A0D15] px-4 flex items-center justify-between text-xs text-slate-400 shrink-0">
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

          {/* Video Stage Canvas */}
          <div
            ref={stageScrollRef}
            className="flex-1 flex items-center justify-center p-4 overflow-auto relative custom-scrollbar"
          >
            {/* Subtle Ambient Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

            {/* Realistic Mobile Viewport Container */}
            <div
              ref={videoContainerRef}
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
                viewScaleMode === "fit" && nativeWidth <= nativeHeight
                  ? "rounded-[28px] border-[3px] border-slate-800/90 shadow-2xl shadow-black/80 overflow-hidden"
                  : "rounded-lg border border-slate-800 shadow-xl overflow-hidden"
              }`}
            >
              {/* Video Tag */}
              {videoPreview ? (
                <video
                  ref={videoRef}
                  src={videoPreview}
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                  onTimeUpdate={() => {
                    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                  }}
                  onLoadedMetadata={handleLoadedMetadata}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 to-black flex items-center justify-center">
                  <div className="text-center p-4 space-y-1.5">
                    <div className="h-9 w-9 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-amber-400">
                      <Video className="h-4 w-4" />
                    </div>
                    <p className="text-[11px] font-semibold text-slate-300">No Video Loaded</p>
                    <p className="text-[9px] text-slate-500">Drop a reel into the left panel to begin</p>
                  </div>
                </div>
              )}

              {/* Floating CTA Banner on Video Canvas */}
              {videoPreview && wordsList.length === 0 && (
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

          {/* 3. COMPACT BOTTOM TIMELINE */}
          <div className="h-16 border-t border-slate-800/80 bg-[#090D16] flex items-center px-4 gap-3 shrink-0">
            {/* Play / Pause mini button */}
            <button
              onClick={togglePlay}
              className="h-8 w-8 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shrink-0 cursor-pointer shadow-sm transition-all"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </button>

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
      {/* Hidden Audio Player for BGM Preview & Playback */}
      <audio ref={bgmAudioPlayerRef} loop className="hidden" />
    </div>
  );
}

