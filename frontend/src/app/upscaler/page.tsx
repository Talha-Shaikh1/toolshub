"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Download,
  Image as ImageIcon,
  ChevronLeft,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Maximize2,
  SplitSquareVertical,
  Video,
  Settings,
  ArrowRight
} from "lucide-react";

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7860";

export default function UpscalerPage() {
  const [apiUrl, setApiUrl] = useState<string>(DEFAULT_API_URL);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [upscaleTarget, setUpscaleTarget] = useState<"4K" | "8K">("4K");
  const [isUpscaling, setIsUpscaling] = useState<boolean>(false);
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
  const [sliderPos, setSliderPos] = useState<number>(50);

  useEffect(() => {
    fetch(`${apiUrl}/api/health`)
      .then((res) => res.json())
      .then((data) => setApiOnline(data.status === "healthy" || data.status === "ok"))
      .catch(() => setApiOnline(false));
  }, [apiUrl]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setUpscaledUrl(null);
    }
  };

  const handleUpscaleImage = async () => {
    if (!imageFile) return;

    setIsUpscaling(true);
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("target_res", upscaleTarget);

    try {
      const res = await fetch(`${apiUrl}/api/upscale`, {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      setUpscaledUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      alert(`Upscale error: ${err.message}`);
    } finally {
      setIsUpscaling(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0A0D14] text-slate-100 flex flex-col font-sans select-none">
      {/* Header */}
      <header className="h-12 border-b border-slate-800/60 bg-[#0E121D] px-4 flex items-center justify-between z-50 shrink-0">
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
            <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-black font-black" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-tight">
              4K / 8K Super-Resolution Lab
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/studio"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20"
          >
            <Video className="h-3.5 w-3.5" />
            <span>Open Caption Studio</span>
          </Link>
        </div>
      </header>

      {/* Main Lab Area */}
      <div className="flex-1 overflow-auto p-6 flex items-center justify-center">
        <div className="bg-[#0D111D] border border-slate-800/90 rounded-2xl p-6 shadow-2xl max-w-4xl w-full space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                AI Image &amp; Thumbnail Super-Resolution
              </h1>
              <p className="text-xs text-slate-400">
                High-order Lanczos interpolation &amp; unsharp micro-texture edge restoration
              </p>
            </div>

            {upscaledUrl && (
              <a
                href={upscaledUrl}
                download={`enhanced_${upscaleTarget}.png`}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                Download Lossless {upscaleTarget} PNG
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Input & Config */}
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-700/80 hover:border-amber-500/60 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-950/60 transition-all group">
                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                <ImageIcon className="h-10 w-10 text-slate-500 group-hover:text-amber-400 mb-2 transition-all" />
                <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 text-center">
                  {imageFile ? imageFile.name : "Drop photo, thumbnail or video frame"}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, WebP supported</span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setUpscaleTarget("4K")}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    upscaleTarget === "4K"
                      ? "border-amber-500 bg-amber-500/10 text-amber-400 font-bold"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-xs block font-bold">🚀 4K Ultra HD</span>
                  <span className="text-[10px] text-slate-500">3840 × 2160 px</span>
                </button>
                <button
                  onClick={() => setUpscaleTarget("8K")}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    upscaleTarget === "8K"
                      ? "border-amber-500 bg-amber-500/10 text-amber-400 font-bold"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-xs block font-bold">✨ 8K Extreme HD</span>
                  <span className="text-[10px] text-slate-500">7680 × 4320 px</span>
                </button>
              </div>

              <button
                onClick={handleUpscaleImage}
                disabled={isUpscaling || !imageFile}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 cursor-pointer transition-all"
              >
                {isUpscaling ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Processing High-Order {upscaleTarget}...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Upscale to {upscaleTarget} Resolution</span>
                  </>
                )}
              </button>
            </div>

            {/* Right: Split Slider Comparison */}
            <div className="space-y-2 flex flex-col justify-center">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <SplitSquareVertical className="h-3.5 w-3.5 text-amber-400" />
                Before vs After Visual Inspector
              </span>

              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-black border border-slate-800 select-none shadow-inner">
                {upscaledUrl && imagePreview ? (
                  <>
                    <img src={upscaledUrl} alt="After" className="absolute inset-0 w-full h-full object-contain" />
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                    >
                      <img src={imagePreview} alt="Before" className="w-full h-full object-contain" />
                    </div>
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)] cursor-ew-resize flex items-center justify-center"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="h-6 w-6 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg text-[8px] font-bold">
                        ↔
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={sliderPos}
                      onChange={(e) => setSliderPos(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                    />
                    <span className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
                      Original
                    </span>
                    <span className="absolute bottom-2 right-2 bg-amber-500 text-black px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                      Enhanced {upscaleTarget}
                    </span>
                  </>
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-slate-600 p-6 text-center">
                    Upload an image on the left and click Upscale to view interactive split comparison
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
