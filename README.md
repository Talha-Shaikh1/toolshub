<div align="center">

# 🚀 FlowCreator OS (ReelStudio Pro)
### Next-Generation Open-Source AI Creator Workstation Suite

[![Next.js 16](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Groq Cloud](https://img.shields.io/badge/Groq-LPU_Whisper-F55036?style=for-the-badge&logo=groq)](https://groq.com/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-60fps_Vector-007808?style=for-the-badge&logo=ffmpeg)](https://ffmpeg.org/)
[![Hugging Face](https://img.shields.io/badge/Hugging_Face-Docker_Space-FFD21E?style=for-the-badge&logo=huggingface)](https://huggingface.co/spaces/01talha/arqa-chatbot)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <b>A modular, high-performance creator operating system designed for short-form viral video production.</b><br />
  Alex Hormozi 2.0 solid boxed subtitles, Ali Abdaal dynamic pop text, Iman Gadzhi minimalist serif, MrBeast bounce animations, custom browser font uploads, 4K/8K image super-resolution, AI voice dubbing, and auto B-roll splicing.
</p>

[**Explore Live Hub**](https://reel-creator-studio.vercel.app) • [**Launch Studio**](https://reel-creator-studio.vercel.app/studio) • [**Super-Resolution Lab**](https://reel-creator-studio.vercel.app/upscaler) • [**Voice Dubbing**](https://reel-creator-studio.vercel.app/voice-dubbing) • [**B-Roll Splicer**](https://reel-creator-studio.vercel.app/b-roll)

</div>

---

## 🏛️ System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      FLOWCREATOR OS CLIENT (Next.js 16)                 │
│               Hosted on Vercel • Edge Network CDN (Port 3000)           │
├─────────────────────┬───────────────────┬───────────────┬───────────────┤
│    Tools Suite Hub  │  Caption Studio   │ 4K/8K Scaler  │ Voice & Broll │
│         (/)         │     (/studio)     │  (/upscaler)  │  (/dub, /b)   │
└───────────┬─────────┴─────────┬─────────┴───────┬───────┴───────┬───────┘
            │                   │                 │               │
            ▼                   ▼                 ▼               ▼
      [HTTPS / REST API Requests (CORS Enabled) • NEXT_PUBLIC_API_URL]
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   FLOWCREATOR FASTAPI BACKEND SERVER                   │
│        Hosted on Hugging Face Spaces (01talha/arqa-chatbot : 7860)       │
├─────────────────────┬───────────────────┬───────────────────────────────┤
│  Transcribe Engine  │  Subtitle Engine  │         Audio Magic           │
│  - Groq LPU (~1s)   │  - Vector ASS     │  - Smart Silence Cutter       │
│  - Whisper Fallback │  - Hormozi Boxed  │  - Procedural SFX Mixer       │
│  - Word Timestamps  │  - Custom Fonts   │  - Multilingual Dubber        │
└───────────┬─────────┴─────────┬─────────┴───────────────┬───────────────┘
            │                   │                         │
            ▼                   ▼                         ▼
   ┌─────────────────┐ ┌─────────────────┐       ┌─────────────────┐
   │ Groq Cloud API  │ │ FFmpeg Pipeline │       │ PIL Super-Res   │
   │ whisper-large-v3│ │ 60fps Vector    │       │ Stepped Lanczos │
   │ 750 words/sec   │ │ Video Render    │       │ 4K & 8K Exports │
   └─────────────────┘ └─────────────────┘       └─────────────────┘
```

---

## ⚡ Workstation Suite Overview

### 1. 🎬 Viral Caption Studio Pro (`/studio`)
- **Alex Hormozi 2.0 Solid Boxed Highlights**: Authentic yellow (`#FBBF24`) or neon green (`#22C55E`) solid badge behind the active spoken word with dark high-contrast text.
- **New Creator Presets**:
  - **Ali Abdaal Dynamic Pop**: Warm pastel yellow badge with cheerful, rapid-pacing pop effect.
  - **Iman Gadzhi Minimalist Serif**: High-status luxury editorial styling with polished gold accent and subtle underline.
  - **MrBeast Bounce Animation**: Extreme neon comic stroke with an explosive 130% bounce pop.
- **Custom Font Upload**: Drag-and-drop `.ttf` or `.otf` fonts directly in the browser with instantaneous client-side `@font-face` rendering and server-side ASS rasterization.
- **Groq Cloud Whisper LPU**: High-accuracy `whisper-large-v3-turbo` transcribing a 30s video in ~1.2 seconds.
- **100% 1:1 Real Pixel Resolution Mode**: Inspect subtitles at native 1080p canvas scale with smooth workspace panning.
- **TikTok & Instagram Reels UI Safe Zones**: Overlay guidelines prevent critical text from being obscured by platform buttons or descriptions.
- **Smart Silence Cutter**: Automatically trims awkward pauses (>0.45s) for maximum audience retention.

### 2. ✨ 4K / 8K Super-Resolution Lab (`/upscaler`)
- **Stepped High-Order Lanczos Scaling**: Upscale video thumbnail captures and graphics to 3840px (4K) and 7680px (8K).
- **Unsharp Micro-Edge Refinement**: Re-synthesizes high-frequency edge textures without unnatural halo artifacts.
- **Split-Comparison Slider**: Interactive side-by-side Before vs After inspector.

### 3. 🎙️ AI Voice Clone & Dubbing (`/voice-dubbing`)
- **Acoustic Timbre Fingerprinting**: Clones vocal characteristics from a short 10-30s audio sample.
- **9+ Global Languages**: Translate and dub video speech into Spanish, Urdu, Hindi, French, German, Arabic, Japanese, and Portuguese.
- **Cadence & Emotion Dial**: Viral Creator, Storyteller Docu, Studio Podcast, and High Urgency styles with automatic music ducking.

### 4. 🎞️ Auto B-Roll Splicer (`/b-roll`)
- **Keyword-Triggered Stock Inserts**: Automatically tags speech moments (wealth, rockets, brain, danger, trophy, tech) and splices high-retention stock clips.
- **Visual Cue Timeline**: Adjust overlay timing, transition styles (Hard Cut, Cross-Dissolve, Picture-in-Picture) with continuous background audio playback.

---

## 🚀 Quickstart & Installation

### Option A: 1-Command Startup via Docker Compose (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/01talha/flow-creator-os.git
cd flow-creator-os

# 2. Copy and set environment variables
cp .env.example .env
# Edit .env and insert your free Groq API key: https://console.groq.com

# 3. Launch the full workstation suite
docker-compose up --build
```
- **Frontend**: Accessible at `http://localhost:3000`
- **Backend API**: Accessible at `http://localhost:7860` (Swagger UI at `/docs`)

---

### Option B: Local Development Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv .venv

# Activate venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt

# Start backend server
uvicorn main:app --host 0.0.0.0 --port 7860 --reload
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables Configuration

Copy `.env.example` to `.env` in the root:

```env
# Backend AI Settings
GROQ_API_KEY=gsk_your_groq_api_key_here
PORT=7860

# Frontend Settings (Default for local development)
NEXT_PUBLIC_API_URL=http://localhost:7860

# Production Vercel Deployment Setting:
# NEXT_PUBLIC_API_URL=https://01talha-arqa-chatbot.hf.space
```

---

## 🔄 Continuous Integration & Deployment

### 1. Frontend on Vercel
Deploy the `frontend/` directory to Vercel:
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Environment Variable**: `NEXT_PUBLIC_API_URL=https://01talha-arqa-chatbot.hf.space`

### 2. Auto-Sync Backend to Hugging Face Space
FlowCreator OS includes an automated GitHub Action [`.github/workflows/sync-huggingface.yml`](.github/workflows/sync-huggingface.yml). Whenever commits are pushed to `main` affecting `backend/**`:
1. It automatically packages the backend.
2. Pushes the Dockerfile and Python source to `https://huggingface.co/spaces/01talha/arqa-chatbot`.
3. Hugging Face automatically rebuilds and deploys the container!

> Add your Hugging Face write token as `HF_TOKEN` in your GitHub Repository Secrets.

---

## 📡 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check, FFmpeg status, and Groq configuration check |
| `/api/presets` | `GET` | Returns available styles, fonts, and positions |
| `/api/transcribe` | `POST` | Transcribes video audio with word-level timestamps |
| `/api/preview` | `POST` | Renders a single JPEG frame preview of captions |
| `/api/render` | `POST` | Burns vector `.ass` subtitles, SFX, and silence cuts into MP4 |
| `/api/upscale` | `POST` | Stepped Lanczos super-resolution to 4K / 8K PNG |
| `/api/voice/languages` | `GET` | Supported dubbing languages and voice models |
| `/api/voice/clone` | `POST` | Synthesizes neural voice sample from speaker audio |
| `/api/voice/dub` | `POST` | Dubs video into target language with music ducking |
| `/api/broll/library` | `GET` | Curated stock footage categories & keywords |
| `/api/broll/detect-keywords` | `POST` | Analyzes words to find B-roll overlay cut cues |
| `/api/broll/splice` | `POST` | Splices B-roll overlays into video with uninterrupted audio |

---

## 🤝 Contributing

Contributions make the open-source community an incredible place to learn, inspire, and create. Please see [CONTRIBUTING.md](CONTRIBUTING.md) for step-by-step instructions on:
- Adding new subtitle presets
- Adding custom font support
- Adding new workstation tools

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for full details.
