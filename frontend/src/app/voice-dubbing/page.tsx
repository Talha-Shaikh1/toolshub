"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Mic,
  Volume2,
  Globe,
  Sparkles,
  Download,
  Play,
  Pause,
  ChevronLeft,
  RefreshCw,
  Sliders,
  Check,
  Video,
  FileAudio,
  Radio,
  Layers,
  ArrowRight,
  Flame,
  Languages
} from "lucide-react";

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
  sample_speaker: string;
}

const DEFAULT_LANGUAGES: LanguageOption[] = [
  { code: "en-US", name: "English (US)", flag: "🇺🇸", sample_speaker: "Alex / Carter" },
  { code: "es-ES", name: "Spanish (Castilian/LatAm)", flag: "🇪🇸", sample_speaker: "Mateo / Sofia" },
  { code: "ur-PK", name: "Urdu", flag: "🇵🇰", sample_speaker: "Hamza / Ayesha" },
  { code: "hi-IN", name: "Hindi", flag: "🇮🇳", sample_speaker: "Aarav / Ananya" },
  { code: "fr-FR", name: "French", flag: "🇫🇷", sample_speaker: "Lucas / Camille" },
  { code: "de-DE", name: "German", flag: "🇩🇪", sample_speaker: "Felix / Hanna" },
  { code: "ar-SA", name: "Arabic", flag: "🇸🇦", sample_speaker: "Tariq / Fatima" },
  { code: "ja-JP", name: "Japanese", flag: "🇯🇵", sample_speaker: "Kenji / Sakura" },
  { code: "pt-BR", name: "Portuguese (BR)", flag: "🇧🇷", sample_speaker: "Gabriel / Isabella" }
];

const EMOTIONS = [
  { id: "dynamic_creator", label: "Viral Creator", desc: "Fast-paced, high retention energy", icon: "🔥" },
  { id: "storyteller", label: "Storyteller", desc: "Cinematic, deep engaging cadence", icon: "🎬" },
  { id: "podcast", label: "Pro Podcast", desc: "Crisp, studio-grade conversational", icon: "🎙️" },
  { id: "urgent", label: "High Urgency", desc: "Punchy, attention-grabbing hook tone", icon: "⚡" }
];

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || "https://01talha-arqa-chatbot.hf.space";

export default function VoiceDubbingPage() {
  const [apiUrl] = useState<string>(DEFAULT_API_URL);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState<string>("es-ES");
  const [selectedEmotion, setSelectedEmotion] = useState<string>("dynamic_creator");
  const [pitchShift, setPitchShift] = useState<number>(0.0);
  const [bgmDucking, setBgmDucking] = useState<number>(0.3);
  const [scriptText, setScriptText] = useState<string>(
    "Welcome to FlowCreator OS. This talking head clip is being dubbed into multiple languages while preserving original vocal characteristics and cadence."
  );

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processStep, setProcessStep] = useState<string>("");
  const [outputAudioUrl, setOutputAudioUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      setAudioPreviewUrl(URL.createObjectURL(file));
      setOutputAudioUrl(null);
      setErrorMessage(null);
    }
  };

  const handleCloneVoice = async () => {
    if (!audioFile) {
      setErrorMessage("Please upload a 10-30s voice reference sample or video first.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setProcessStep("Extracting acoustic timbre fingerprint...");

    const formData = new FormData();
    formData.append("voice_sample", audioFile);
    formData.append("target_language", targetLang);
    formData.append("reference_text", scriptText);
    formData.append("emotion", selectedEmotion);
    formData.append("pitch_shift", pitchShift.toString());

    try {
      setProcessStep("Synthesizing neural voice clone...");
      const res = await fetch(`${apiUrl}/api/voice/clone`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setProcessStep("Mastering audio track...");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setOutputAudioUrl(url);
      setProcessStep("Dubbing synthesis complete!");
    } catch (err: any) {
      setErrorMessage(`Synthesis failed: ${err.message || "Failed to contact voice engine"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePlayback = () => {
    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
      } else {
        audioPlayerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090F] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black overflow-x-hidden">
      {/* 1. TOP HEADER */}
      <header className="h-14 border-b border-slate-800/80 bg-[#0B0E17]/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-50 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-all"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Hub</span>
          </Link>

          <div className="h-4 w-px bg-slate-800" />

          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
              <Mic className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-tight block">
                AI Voice Clone &amp; Dubbing
              </span>
              <span className="text-[10px] text-slate-500 font-mono hidden sm:block">FlowCreator OS • Workstation 3</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/studio"
            className="text-xs text-slate-400 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-all flex items-center gap-1.5"
          >
            <Video className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Caption Studio</span>
          </Link>
          <Link
            href="/b-roll"
            className="text-xs text-slate-400 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-all flex items-center gap-1.5"
          >
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">B-Roll Splicer</span>
          </Link>
        </div>
      </header>

      {/* 2. MAIN WORKSTATION WORKSPACE */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* LEFT COLUMN: CONTROLS & INPUTS (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Audio Upload Box */}
          <div className="p-6 rounded-2xl bg-[#0D111D] border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileAudio className="h-4 w-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  Step 1: Voice Reference Sample
                </h2>
              </div>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                10-30s Audio or MP4
              </span>
            </div>

            <label className="flex flex-col items-center justify-center p-8 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 hover:border-purple-500/50 cursor-pointer transition-all group">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
                <Mic className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-white mb-1">
                {audioFile ? audioFile.name : "Drop speaker audio or talking-head video"}
              </span>
              <span className="text-[11px] text-slate-500">
                Supports WAV, MP3, M4A, or MP4 video audio track
              </span>
              <input
                type="file"
                accept="audio/*,video/mp4"
                className="hidden"
                onChange={handleAudioSelect}
              />
            </label>

            {audioPreviewUrl && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Reference Audio Loaded</span>
                <audio controls src={audioPreviewUrl} className="h-8 max-w-[260px]" />
              </div>
            )}
          </div>

          {/* Target Language Selection */}
          <div className="p-6 rounded-2xl bg-[#0D111D] border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                Step 2: Target Dubbing Language
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {DEFAULT_LANGUAGES.map((lang) => {
                const isSelected = targetLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => setTargetLang(lang.code)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-purple-500 bg-purple-500/15 shadow-md shadow-purple-500/10"
                        : "border-slate-800/80 bg-slate-950/70 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg">{lang.flag}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-purple-400" />}
                    </div>
                    <span className="text-xs font-bold text-white block">{lang.name}</span>
                    <span className="text-[9px] text-slate-500 block truncate">{lang.sample_speaker}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emotion & Tone Cadence */}
          <div className="p-6 rounded-2xl bg-[#0D111D] border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                Step 3: Vocal Cadence &amp; Energy
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {EMOTIONS.map((emo) => {
                const isSelected = selectedEmotion === emo.id;
                return (
                  <button
                    key={emo.id}
                    onClick={() => setSelectedEmotion(emo.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/15 shadow-md"
                        : "border-slate-800/80 bg-slate-950/70 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-lg mb-1 block">{emo.icon}</span>
                    <span className="text-xs font-bold text-white block mb-0.5">{emo.label}</span>
                    <span className="text-[9px] text-slate-500 block leading-tight">{emo.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Fine-Tuning Sliders */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Pitch Tuning</span>
                  <span className="font-mono text-purple-400">{pitchShift > 0 ? `+${pitchShift}` : pitchShift}</span>
                </div>
                <input
                  type="range"
                  min={-2}
                  max={2}
                  step={0.5}
                  value={pitchShift}
                  onChange={(e) => setPitchShift(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Background Music Ducking</span>
                  <span className="font-mono text-purple-400">{Math.round((1 - bgmDucking) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={0.8}
                  step={0.05}
                  value={bgmDucking}
                  onChange={(e) => setBgmDucking(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SYNTHESIS & REAL-TIME PLAYER (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0D111D] border border-slate-800/80 shadow-xl space-y-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
              <Radio className="h-4 w-4 text-purple-400" />
              <span>Translation &amp; Script</span>
            </h2>

            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              rows={4}
              placeholder="Enter spoken text to synthesize or leave blank for auto speech-to-speech dubbing..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-sans text-slate-200 focus:outline-none focus:border-purple-500 leading-relaxed"
            />

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Synthesize CTA Button */}
            <button
              onClick={handleCloneVoice}
              disabled={isProcessing || !audioFile}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{processStep || "Synthesizing Dubbed Track..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Synthesize Voice Clone</span>
                </>
              )}
            </button>
          </div>

          {/* Cloned Audio Result Player */}
          {outputAudioUrl && (
            <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-950/30 to-black border border-purple-500/40 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Dubbed Audio Ready</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">44.1 kHz • Neural TTS</span>
              </div>

              {/* Waveform Visualization Mock */}
              <div className="h-16 rounded-xl bg-slate-950 border border-purple-500/20 p-3 flex items-center justify-between gap-1">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-purple-500 transition-all duration-300"
                    style={{
                      height: `${20 + Math.sin(i * 0.4) * 20 + (i % 3) * 15}%`,
                      opacity: isPlaying ? 0.9 : 0.4
                    }}
                  />
                ))}
              </div>

              <audio ref={audioPlayerRef} src={outputAudioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />

              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlayback}
                  className="h-10 px-4 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center gap-2 shadow-md active:scale-95 transition-all"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span>{isPlaying ? "Pause Preview" : "Play Dubbed Audio"}</span>
                </button>

                <a
                  href={outputAudioUrl}
                  download={`dubbed_${targetLang}_sample.wav`}
                  className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Download WAV</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
