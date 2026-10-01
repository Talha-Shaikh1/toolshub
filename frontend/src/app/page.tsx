"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Video,
  Sparkles,
  Scissors,
  Wand2,
  Volume2,
  Download,
  ArrowRight,
  Flame,
  CheckCircle2,
  Shield,
  Layers,
  Cpu,
  Monitor,
  Zap,
  Smartphone,
  ChevronDown,
  ExternalLink,
  Code2,
  Check,
  Star,
  Play
} from "lucide-react";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* 1. GLOBAL NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 h-16 border-b border-slate-800/80 bg-[#0B0E17]/80 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Flame className="h-5 w-5 text-black font-black" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-wider uppercase bg-gradient-to-r from-amber-400 via-orange-300 to-red-500 bg-clip-text text-transparent">
              FlowCreator OS
            </span>
            <span className="text-[10px] font-mono text-slate-400 -mt-0.5">
              AI Creator Tools Hub
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
          <a href="#tools" className="hover:text-amber-400 transition-colors">
            Tools Suite
          </a>
          <a href="#workflow" className="hover:text-amber-400 transition-colors">
            How It Works
          </a>
          <a href="#tech" className="hover:text-amber-400 transition-colors">
            Architecture
          </a>
          <a href="#faq" className="hover:text-amber-400 transition-colors">
            FAQ
          </a>
        </nav>

        {/* Header Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/studio"
            className="h-9 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Video className="h-3.5 w-3.5 text-black" />
            <span>Launch Studio</span>
          </Link>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-20 pb-24 px-6 lg:px-12 flex flex-col items-center text-center overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[250px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-amber-500/30 text-amber-400 text-xs font-medium mb-6 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <span>Next-Gen Creator Operating System • 100% Free &amp; Open Source</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.08] mb-6">
          AI Tools Hub for Modern{" "}
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
            Short-Form Creators
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Generate trending Alex Hormozi 2.0 boxed subtitles, cut awkward silences, auto-mix viral sound effects with Groq Whisper in ~1s, and upscale thumbnail media to 8K resolution.
        </p>

        {/* Dual Primary Call-to-Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto">
          <Link
            href="/studio"
            className="w-full sm:w-auto h-12 px-8 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-95 transition-all group"
          >
            <Video className="h-4 w-4 text-black group-hover:scale-110 transition-transform" />
            <span>Open Reel Caption Studio</span>
            <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/upscaler"
            className="w-full sm:w-auto h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700/80 hover:border-amber-500/50 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Try 4K/8K Super-Resolution</span>
          </Link>
        </div>

        {/* Key Metric Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full border-t border-slate-800/80 pt-10">
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <span className="text-2xl font-black text-amber-400 block font-mono">~1.2s</span>
            <span className="text-xs text-slate-400 font-medium">Groq Whisper Transcription</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <span className="text-2xl font-black text-orange-400 block font-mono">60 FPS</span>
            <span className="text-xs text-slate-400 font-medium">Vector ASS Subtitle Engine</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <span className="text-2xl font-black text-emerald-400 block font-mono">8K Lanczos</span>
            <span className="text-xs text-slate-400 font-medium">Super-Resolution Upscaling</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <span className="text-2xl font-black text-amber-400 block font-mono">$0 / mo</span>
            <span className="text-xs text-slate-400 font-medium">100% Free &amp; Self-Hostable</span>
          </div>
        </div>
      </section>

      {/* 3. CORE TOOLS SUITE HUB */}
      <section id="tools" className="py-20 px-6 lg:px-12 max-w-6xl mx-auto w-full">
        <div className="text-center space-y-2 mb-14">
          <span className="text-xs font-mono text-amber-400 tracking-wider uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Tools Suite Hub
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Choose Your AI Creator Workstation
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Modular, high-performance tools engineered for fast-paced viral content production.
          </p>
        </div>

        {/* 2 Flagship Tools Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* TOOL 1: VIRAL REEL CAPTION STUDIO */}
          <div className="p-8 rounded-2xl bg-[#0D111D] border border-slate-800/90 hover:border-amber-500/50 transition-all flex flex-col justify-between group shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 pointer-events-none">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold">
                ACTIVE WORKSTATION
              </span>
            </div>

            <div className="space-y-6">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Video className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  Viral Caption Studio Pro
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generate Alex Hormozi 2.0 animated solid boxed captions with real-time karaoke active highlights, auto-emojis, pause trimming, and viral sound effects.
                </p>
              </div>

              {/* Visual Mini Mockup */}
              <div className="p-4 rounded-xl bg-black/60 border border-slate-800/80 flex items-center justify-center py-6">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-tight">
                  <span className="text-white drop-shadow">THESE</span>
                  <span className="text-white drop-shadow">ARE</span>
                  <span className="bg-[#FBBF24] text-slate-950 px-2 py-0.5 rounded shadow-lg flex items-center gap-1 scale-105">
                    VIRAL <span>🔥</span>
                  </span>
                  <span className="text-white drop-shadow">CAPTIONS</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Hormozi 2.0, Ali Abdaal Pop, Iman Gadzhi Serif &amp; MrBeast Bounce</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Custom Font Upload (.ttf / .otf) with live browser preview</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Groq Cloud Whisper Large-v3 Turbo (~1s transcription)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Auto-Emoji injection (💰, 🔥, 🚀, 🧠, 🛑) &amp; SFX mixing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Auto-Silence Cuts (&gt;0.45s pauses) for high retention</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                href="/studio"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                <span>Launch Caption Studio</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* TOOL 2: 4K/8K SUPER-RESOLUTION LAB */}
          <div className="p-8 rounded-2xl bg-[#0D111D] border border-slate-800/90 hover:border-amber-500/50 transition-all flex flex-col justify-between group shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 pointer-events-none">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                ACTIVE WORKSTATION
              </span>
            </div>

            <div className="space-y-6">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Sparkles className="h-6 w-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  4K / 8K Super-Resolution Lab
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upscale video thumbnail captures, photos, and graphic assets to 3840px (4K) or 7680px (8K) using high-order Lanczos interpolation and micro-edge unsharp refinement.
                </p>
              </div>

              {/* Visual Split Mockup */}
              <div className="p-4 rounded-xl bg-black/60 border border-slate-800/80 flex items-center justify-center py-6">
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-500">1080p Standard</span>
                  <span className="h-4 w-px bg-slate-700" />
                  <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    ↔ 8K Lanczos Vector Sharp
                  </span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Lanczos high-order sub-pixel texture interpolation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Unsharp micro-edge enhancement for ultra-sharp thumbnails</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Before vs After interactive split-slider inspector</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Lossless PNG &amp; WebP exports with zero compression loss</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                href="/upscaler"
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs border border-slate-700 hover:border-amber-500/50 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>Launch 4K/8K Upscaler</span>
                <ArrowRight className="h-4 w-4 text-emerald-400" />
              </Link>
            </div>
          </div>

          {/* TOOL 3: AI VOICE CLONE & DUBBING */}
          <div className="p-8 rounded-2xl bg-[#0D111D] border border-slate-800/90 hover:border-purple-500/50 transition-all flex flex-col justify-between group shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 pointer-events-none">
              <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-mono font-bold">
                ACTIVE WORKSTATION
              </span>
            </div>

            <div className="space-y-6">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <span className="text-xl">🎙️</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  AI Voice Clone &amp; Dubbing
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Clone speaker timbre and translate talking-head audio into Spanish, Urdu, Hindi, French, German, Arabic, and Japanese with automatic background music ducking.
                </p>
              </div>

              {/* Visual Mini Mockup */}
              <div className="p-4 rounded-xl bg-black/60 border border-slate-800/80 flex items-center justify-center py-5">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">🇺🇸 English Timbre</span>
                  <span className="text-purple-400 font-bold">→</span>
                  <span className="text-purple-300 font-bold bg-purple-500/15 px-2 py-0.5 rounded border border-purple-500/30">
                    🇪🇸 🇵🇰 🇮🇳 Multilingual Clone
                  </span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>10-30s acoustic timbre cloning pipeline</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>9+ Global target languages with native inflection</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Emotion controls (Viral Creator, Storyteller, Podcast)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Continuous background audio ducking &amp; mastering</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                href="/voice-dubbing"
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs border border-slate-700 hover:border-purple-500/50 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>Launch Voice Dubbing Studio</span>
                <ArrowRight className="h-4 w-4 text-purple-400" />
              </Link>
            </div>
          </div>

          {/* TOOL 4: AUTO B-ROLL SPLICER */}
          <div className="p-8 rounded-2xl bg-[#0D111D] border border-slate-800/90 hover:border-cyan-500/50 transition-all flex flex-col justify-between group shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 pointer-events-none">
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold">
                ACTIVE WORKSTATION
              </span>
            </div>

            <div className="space-y-6">
              <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <span className="text-xl">🎬</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  Auto B-Roll Splicer
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automatically scans spoken keywords (cash, rockets, brain, alert) and inserts high-retention 60fps stock footage overlays while maintaining uninterrupted dialogue audio.
                </p>
              </div>

              {/* Visual Mini Mockup */}
              <div className="p-4 rounded-xl bg-black/60 border border-slate-800/80 flex items-center justify-center py-5">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">Speaker Video</span>
                  <span className="text-cyan-400 font-bold">+</span>
                  <span className="text-cyan-300 font-bold bg-cyan-500/15 px-2 py-0.5 rounded border border-cyan-500/30">
                    💰 🚀 🧠 Keyword B-Roll Cuts
                  </span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Keyword-triggered stock video cutaways</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Visual timeline cue editor with duration sliders</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Hard Cut, Cross-Dissolve, and Picture-in-Picture modes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Zero-audio interruption 60fps FFmpeg burns</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                href="/b-roll"
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs border border-slate-700 hover:border-cyan-500/50 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <span>Launch B-Roll Splicer</span>
                <ArrowRight className="h-4 w-4 text-cyan-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* FUTURE TOOLS ROADMAP CARDS */}
        <div className="border border-slate-800/80 rounded-2xl p-6 bg-slate-950/40">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                Tools Hub Future Roadmap
              </h3>
              <p className="text-[11px] text-slate-500">Upcoming tools planned for the FlowCreator OS suite</p>
            </div>
            <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
              In Development
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <span className="text-xs font-bold text-slate-200 block mb-1">🧠 Viral Hook &amp; Retention Script AI</span>
              <span className="text-[11px] text-slate-400 block leading-relaxed">LLM retention optimizer to score viewer hooks, diagnose drop-off seconds, and re-write script openers for maximum engagement.</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <span className="text-xs font-bold text-slate-200 block mb-1">⚡ Auto Multi-Platform Batch Publisher</span>
              <span className="text-[11px] text-slate-400 block leading-relaxed">Direct 1-click publishing pipeline with automated hashtags, captions, and title metadata to TikTok, Reels, and Shorts.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS WORKFLOW */}
      <section id="workflow" className="py-20 px-6 lg:px-12 bg-[#090C14] border-y border-slate-800/70">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-2 mb-14">
            <span className="text-xs font-mono text-amber-400 tracking-wider uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Streamlined Workflow
            </span>
            <h2 className="text-3xl font-black text-white">Create Viral Shorts in 3 Simple Steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 relative">
              <span className="text-3xl font-black text-slate-700 font-mono block mb-3">01</span>
              <h3 className="text-sm font-bold text-white mb-2">Upload Video or Photo</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drop your vertical 9:16 talking-head reel or image into the workspace monitor canvas.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 relative">
              <span className="text-3xl font-black text-amber-500/60 font-mono block mb-3">02</span>
              <h3 className="text-sm font-bold text-white mb-2">AI Auto-Pacing &amp; Badges</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select Hormozi 2.0 solid yellow boxes, auto-attach emojis, trim silent pauses, and preview in real time.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 relative">
              <span className="text-3xl font-black text-slate-700 font-mono block mb-3">03</span>
              <h3 className="text-sm font-bold text-white mb-2">Export 4K Vector MP4</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Download a crisp 60fps high-retention video ready for Instagram Reels, TikTok, and YouTube Shorts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SEARCH ENGINE & AEO KNOWLEDGE BASE (FAQ) */}
      <section id="faq" className="py-20 px-6 lg:px-12 max-w-4xl mx-auto w-full">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-mono text-amber-400 tracking-wider uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl font-black text-white">Everything You Need to Know</h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "How do Alex Hormozi 2.0 animated boxed subtitles work?",
              a: "Hormozi 2.0 uses word-level timestamp alignment. As each word is spoken, a solid yellow or neon green rounded box appears directly behind that single active word with high-contrast dark text, while upcoming words remain crisp white with black contours."
            },
            {
              q: "How does Groq Cloud Whisper achieve 1-second transcription?",
              a: "Groq uses custom LPU (Language Processing Unit) chips running whisper-large-v3-turbo. It transcribes a 60-second talking-head video in ~1.2 seconds, returning precise word-level start and end timestamps."
            },
            {
              q: "What is the Auto-Silence Cut feature?",
              a: "The silence remover detects pauses exceeding 0.45s and concatenates the active spoken segments with FFmpeg. This creates high-retention fast-paced videos without manual timeline trimming."
            },
            {
              q: "How does 4K & 8K image super-resolution work?",
              a: "Using high-order Lanczos interpolation combined with unsharp micro-edge masking, thumbnail frames and photos are upscaled to 3840px (4K) or 7680px (8K) with increased pixel density and sharp edge definition."
            },
            {
              q: "Is Reel Studio Pro free and open source?",
              a: "Yes! FlowCreator OS and Reel Studio Pro are 100% free, open-source, and self-hostable with Docker, FastAPI, and Next.js."
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="border border-slate-800 rounded-xl bg-slate-950/60 overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-slate-200 hover:text-white"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform ${
                    openFaq === idx ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-900 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. GLOBAL FOOTER */}
      <footer className="border-t border-slate-800/80 bg-[#090C14] py-12 px-6 lg:px-12 text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-amber-500 flex items-center justify-center text-black font-black">
              <Flame className="h-4 w-4" />
            </div>
            <span className="font-bold text-white text-sm">FlowCreator OS</span>
            <span className="text-slate-600">•</span>
            <span>AI Creator Tools Hub v2.4</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <Link href="/studio" className="hover:text-amber-400 transition-colors">
              Caption Studio
            </Link>
            <Link href="/upscaler" className="hover:text-amber-400 transition-colors">
              4K Upscaler
            </Link>
            <a
              href="https://github.com/Talha-Shaikh1"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <p className="text-[11px] text-slate-500">
            Built by{" "}
            <a
              href="https://github.com/Talha-Shaikh1"
              target="_blank"
              rel="noreferrer"
              className="text-amber-400 font-semibold hover:underline"
            >
              Talha Shaikh
            </a>
            . 100% Free &amp; Open Source.
          </p>
        </div>
      </footer>
    </div>
  );
}
