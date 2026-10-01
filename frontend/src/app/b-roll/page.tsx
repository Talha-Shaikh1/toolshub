"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Layers,
  Video,
  Sparkles,
  Scissors,
  Download,
  Play,
  Pause,
  ChevronLeft,
  RefreshCw,
  Sliders,
  Check,
  Film,
  Zap,
  Tag,
  ArrowRight,
  Flame,
  Clock,
  Eye
} from "lucide-react";

interface BrollCue {
  keyword: string;
  start_time: number;
  end_time: number;
  duration: number;
  category: string;
  preset_id: string;
  title: string;
  icon: string;
  color: string;
}

const STOCK_LIBRARY = [
  {
    id: "wealth_luxury",
    title: "Cash Flow & Luxury Assets",
    category: "Finance",
    keywords: ["money", "cash", "crypto", "bitcoin", "rich", "revenue", "profit"],
    color: "#FBBF24",
    icon: "💰",
    description: "Counting dollar stacks, gold bars, and dynamic stock charts"
  },
  {
    id: "mindset_strategy",
    title: "Deep Focus & Mindset",
    category: "Mindset",
    keywords: ["brain", "think", "smart", "strategy", "idea", "secret", "knowledge"],
    color: "#818CF8",
    icon: "🧠",
    description: "Chess moves, glowing neural connections, and strategic blueprints"
  },
  {
    id: "viral_rocket",
    title: "Viral Rocket & High Speed",
    category: "Action",
    keywords: ["viral", "rocket", "fire", "fast", "speed", "boom", "insane"],
    color: "#EF4444",
    icon: "🚀",
    description: "SpaceX rocket booster ignition, hyperlapse zooms, and sparks"
  },
  {
    id: "warning_danger",
    title: "Danger & Critical Mistake",
    category: "Alert",
    keywords: ["stop", "danger", "warning", "mistake", "never", "wrong", "trap"],
    color: "#F87171",
    icon: "🛑",
    description: "Red emergency strobe lights, warning tape, and crash alerts"
  },
  {
    id: "win_champion",
    title: "Victory & Championship Trophy",
    category: "Success",
    keywords: ["win", "winner", "success", "king", "champion", "trophy", "goal"],
    color: "#34D399",
    icon: "🏆",
    description: "Gold confetti explosions, boxing victory, and champion podiums"
  },
  {
    id: "tech_ai",
    title: "Cyber Code & Neural Networks",
    category: "Tech",
    keywords: ["tech", "ai", "code", "future", "algorithm", "software", "machine"],
    color: "#38BDF8",
    icon: "⚡",
    description: "Matrix terminal code streams, 3D neural nodes, and holographic HUD"
  }
];

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || "https://01talha-arqa-chatbot.hf.space";

export default function BRollSplicerPage() {
  const [apiUrl] = useState<string>(DEFAULT_API_URL);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [transitionMode, setTransitionMode] = useState<"cut" | "dissolve" | "pip">("cut");
  const [overlayOpacity, setOverlayOpacity] = useState<number>(100);

  // Simulated or AI detected B-roll insert cues
  const [brollCues, setBrollCues] = useState<BrollCue[]>([
    {
      keyword: "MONEY",
      start_time: 1.2,
      end_time: 3.2,
      duration: 2.0,
      category: "Finance",
      preset_id: "wealth_luxury",
      title: "Cash Flow & Luxury Assets",
      icon: "💰",
      color: "#FBBF24"
    },
    {
      keyword: "VIRAL",
      start_time: 4.8,
      end_time: 6.8,
      duration: 2.0,
      category: "Action",
      preset_id: "viral_rocket",
      title: "Viral Rocket & High Speed",
      icon: "🚀",
      color: "#EF4444"
    },
    {
      keyword: "STRATEGY",
      start_time: 8.5,
      end_time: 10.5,
      duration: 2.0,
      category: "Mindset",
      preset_id: "mindset_strategy",
      title: "Deep Focus & Mindset",
      icon: "🧠",
      color: "#818CF8"
    }
  ]);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSplicing, setIsSplicing] = useState<boolean>(false);
  const [spliceStep, setSpliceStep] = useState<string>("");
  const [outputVideoUrl, setOutputVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(15);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      setOutputVideoUrl(null);
      setErrorMessage(null);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 15);
    }
  };

  const handleScanKeywords = async () => {
    if (!videoFile) {
      setErrorMessage("Please upload a talking head video first.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    // Call API transcribe or detect keywords
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 1200);
  };

  const handleSpliceBroll = async () => {
    if (!videoFile) {
      setErrorMessage("Please upload a video file first.");
      return;
    }

    setIsSplicing(true);
    setErrorMessage(null);
    setSpliceStep("Mapping B-Roll cut points...");

    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("broll_data_json", JSON.stringify(brollCues));

    try {
      setSpliceStep("Rendering 60fps stock overlay transitions...");
      const res = await fetch(`${apiUrl}/api/broll/splice`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const blob = await res.blob();
      setOutputVideoUrl(URL.createObjectURL(blob));
      setSpliceStep("Splicing complete!");
    } catch (err: any) {
      setErrorMessage(`Splicing failed: ${err.message || "Failed to splice B-roll"}`);
    } finally {
      setIsSplicing(false);
    }
  };

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Find active B-Roll cue at current playback timestamp
  const activeBrollCue = brollCues.find(
    (c) => currentTime >= c.start_time && currentTime <= c.end_time
  );

  return (
    <div className="min-h-screen bg-[#07090F] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* 1. TOP HEADER */}
      <header className="h-14 border-b border-slate-800/80 bg-[#0B0E17]/90 backdrop-blur-md px-6 flex items-center justify-between z-50 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-all"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Hub</span>
          </Link>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Film className="h-4 w-4 text-black" />
            </div>
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-tight block">
                Auto B-Roll Splicer
              </span>
              <span className="text-[10px] text-slate-500 font-mono">FlowCreator OS • Workstation 4</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/studio"
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-all hidden sm:flex items-center gap-1.5"
          >
            <Video className="h-3.5 w-3.5 text-amber-400" />
            <span>Caption Studio</span>
          </Link>
          <Link
            href="/voice-dubbing"
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-all hidden sm:flex items-center gap-1.5"
          >
            <Zap className="h-3.5 w-3.5 text-purple-400" />
            <span>Voice Dubbing</span>
          </Link>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CONTROLS & TIMELINE CUES (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Video Upload Box */}
          <div className="p-6 rounded-2xl bg-[#0D111D] border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  Step 1: Talking-Head Source Video
                </h2>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Vertical 9:16 Reel
              </span>
            </div>

            <label className="flex flex-col items-center justify-center p-8 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all group">
              <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
                <Film className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-white mb-1">
                {videoFile ? videoFile.name : "Drop primary talking-head video file"}
              </span>
              <span className="text-[11px] text-slate-500">Supports MP4, MOV, WebM up to 4K</span>
              <input type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
            </label>
          </div>

          {/* AI Keyword Scanner & Timeline Cues */}
          <div className="p-6 rounded-2xl bg-[#0D111D] border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  Step 2: Auto-Detected B-Roll Insert Cues
                </h2>
              </div>
              <button
                onClick={handleScanKeywords}
                disabled={isAnalyzing || !videoFile}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 disabled:opacity-40 cursor-pointer bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isAnalyzing ? "Scanning..." : "AI Auto-Detect"}</span>
              </button>
            </div>

            {/* Visual Timeline Marker Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0.0s</span>
                <span className="text-slate-400 font-semibold">{currentTime.toFixed(1)}s active</span>
                <span>{duration.toFixed(1)}s</span>
              </div>
              <div className="h-6 rounded-lg bg-slate-950 border border-slate-800 relative overflow-hidden flex items-center">
                {/* Playhead position */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white z-20 shadow-md"
                  style={{ left: `${(currentTime / Math.max(1, duration)) * 100}%` }}
                />
                {/* B-Roll Cues Blocks */}
                {brollCues.map((cue, idx) => {
                  const leftPercent = (cue.start_time / Math.max(1, duration)) * 100;
                  const widthPercent = (cue.duration / Math.max(1, duration)) * 100;
                  return (
                    <div
                      key={idx}
                      className="absolute top-1 bottom-1 rounded px-1 flex items-center justify-center text-[9px] font-bold truncate z-10 cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${Math.max(4, widthPercent)}%`,
                        backgroundColor: cue.color,
                        color: "#0F172A"
                      }}
                      title={`${cue.keyword}: ${cue.start_time}s - ${cue.end_time}s`}
                    >
                      <span>{cue.icon}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* List of Insert Points */}
            <div className="space-y-2 pt-2">
              {brollCues.map((cue, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{cue.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{cue.title}</span>
                        <span
                          className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded"
                          style={{ backgroundColor: `${cue.color}25`, color: cue.color }}
                        >
                          TRIGGER: {cue.keyword}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {cue.start_time}s → {cue.end_time}s ({cue.duration}s duration)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setBrollCues(brollCues.filter((_, i) => i !== idx));
                    }}
                    className="text-[10px] text-slate-500 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Splicing Transition Settings */}
          <div className="p-6 rounded-2xl bg-[#0D111D] border border-slate-800/80 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <Sliders className="h-4 w-4 text-cyan-400" />
              <span>Step 3: Cutaway Transition Style</span>
            </h2>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "cut", label: "Hard Cutaway", desc: "Classic fast-paced NLE cut" },
                { id: "dissolve", label: "Cross-Dissolve", desc: "Smooth subtle blend" },
                { id: "pip", label: "Corner PIP", desc: "Picture-in-picture box" }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setTransitionMode(m.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    transitionMode === m.id
                      ? "border-cyan-500 bg-cyan-500/15 shadow-md"
                      : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                  }`}
                >
                  <span className="text-xs font-bold text-white block mb-0.5">{m.label}</span>
                  <span className="text-[10px] text-slate-500 block">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW STAGE & SPLICED MP4 (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0D111D] border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <Eye className="h-4 w-4 text-cyan-400" />
                <span>Synchronized Reel Preview</span>
              </h2>
              {activeBrollCue && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1"
                  style={{ backgroundColor: activeBrollCue.color, color: "#0F172A" }}
                >
                  <span>{activeBrollCue.icon}</span>
                  <span>B-ROLL ACTIVE</span>
                </span>
              )}
            </div>

            {/* Video Preview Monitor */}
            <div className="relative aspect-[9/16] max-h-[460px] mx-auto bg-black rounded-2xl border-2 border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
              {videoPreviewUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={videoPreviewUrl}
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                    onTimeUpdate={() => {
                      if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                    }}
                    onLoadedMetadata={handleLoadedMetadata}
                  />

                  {/* Dynamic B-Roll Overlay Sim during active cue */}
                  {activeBrollCue && (
                    <div
                      className={`absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center z-20 transition-all ${
                        transitionMode === "pip"
                          ? "!inset-auto top-4 right-4 w-40 h-28 rounded-xl border-2 border-cyan-400 shadow-2xl !bg-black"
                          : ""
                      }`}
                    >
                      <span className="text-4xl mb-2">{activeBrollCue.icon}</span>
                      <span className="text-xs font-black text-white uppercase tracking-wider block">
                        {activeBrollCue.title}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-mono mt-1">
                        Stock Cutaway ({activeBrollCue.duration}s)
                      </span>
                    </div>
                  )}

                  {/* Play/Pause Button */}
                  <button
                    onClick={togglePlayback}
                    className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity z-30"
                  >
                    <div className="h-11 w-11 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg">
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                    </div>
                  </button>
                </>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-cyan-400">
                    <Film className="h-5 w-5" />
                  </div>
                  <p className="text-xs text-slate-300 font-semibold">No Video Loaded</p>
                  <p className="text-[10px] text-slate-500">Upload a video on the left to begin splicing</p>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Splice & Export CTA Button */}
            <button
              onClick={handleSpliceBroll}
              disabled={isSplicing || !videoFile}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
            >
              {isSplicing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-black" />
                  <span>{spliceStep || "Splicing Stock Video Overlays..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-black" />
                  <span>Render Spliced 60fps Reel</span>
                </>
              )}
            </button>
          </div>

          {/* Exported Result Video Card */}
          {outputVideoUrl && (
            <div className="p-6 rounded-2xl bg-gradient-to-b from-cyan-950/30 to-black border border-cyan-500/40 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Spliced Reel Ready</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">60 FPS • Seamless Audio</span>
              </div>

              <a
                href={outputVideoUrl}
                download="broll_spliced_reel.mp4"
                className="w-full h-10 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Download Spliced MP4</span>
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
