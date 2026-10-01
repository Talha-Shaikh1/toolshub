# 🤝 Contributing to FlowCreator OS (ReelStudio Pro)

First off, thank you for considering contributing to **FlowCreator OS**! Creators worldwide rely on fast, open-source, non-bloated AI tools to produce viral content. We welcome developers, designers, and AI engineers to join our open-source mission.

---

## 🏛️ Monorepo Architecture Overview

FlowCreator OS is organized as a unified monorepo:

```text
flowcreator-os/
├── frontend/             # Next.js 16 (React 19, Tailwind CSS, Lucide Icons)
│   ├── src/app/          # App router pages
│   │   ├── page.tsx      # Tools Hub & AEO Knowledge Base
│   │   ├── studio/       # Workstation 1: Viral Caption Studio Pro
│   │   ├── upscaler/     # Workstation 2: 4K/8K Super-Resolution Lab
│   │   ├── voice-dubbing/# Workstation 3: AI Voice Clone & Dubbing
│   │   └── b-roll/       # Workstation 4: Auto B-Roll Splicer
│   └── public/           # Static icons & assets
│
├── backend/              # FastAPI Python Server (Hugging Face Docker / local)
│   ├── main.py           # REST API endpoints, routing, and upload handlers
│   ├── caption_engine.py # ASS generator, Groq Whisper, Silence cutter, SFX auto-mix
│   ├── Dockerfile        # Container recipe for Hugging Face Spaces & Docker
│   └── requirements.txt  # Python dependencies
│
├── .github/              # Automation
│   └── workflows/
│       ├── sync-huggingface.yml # Auto-syncs backend/ to Hugging Face Spaces
│       └── ci.yml               # Verifies Python syntax and Next.js builds
├── docker-compose.yml    # 1-command startup for entire workstation suite
├── CONTRIBUTING.md       # This guide
├── README.md             # Project documentation & benchmarks
└── LICENSE               # MIT License
```

---

## ⚡ 1. Local Development Setup

### Prerequisites
- **Node.js**: v20 or newer
- **Python**: v3.10 or v3.11
- **FFmpeg**: Must be available on system path or in `backend/bin/`

### 🚀 1-Command Setup (Docker Compose)
```bash
# Clone the repository
git clone https://github.com/01talha/flow-creator-os.git
cd flow-creator-os

# Configure environment variables
cp .env.example .env

# Launch both Frontend (port 3000) and Backend (port 7860)
docker-compose up --build
```

### 💻 Manual Local Setup

#### Backend Setup
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 7860 --reload
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000 in your browser
```

---

## 🎨 2. How to Add a New Subtitle Preset

Adding a viral creator subtitle preset is easy and requires updating both the backend ASS engine and frontend preview styling:

### Step 1: Add preset to `backend/caption_engine.py`
Locate `STYLE_PRESETS` in [backend/caption_engine.py](file:///c:/Work/reel-caption-tool/backend/caption_engine.py) and add your preset configuration:

```python
STYLE_PRESETS["Your New Preset Name"] = {
    "primary_color": "&H00FFFFFF&",    # Default text color in ASS BGR (&HAABBGGRR&)
    "highlight_color": "&H00101010&",  # Active word text color
    "outline_color": "&H00000000&",    # Outline border color
    "badge_ass_color": "&H0024BFFB&",  # Solid badge color (if is_boxed is True)
    "outline_width": 14,               # Thickness of badge or stroke
    "shadow_depth": 3,                 # Depth of shadow
    "zoom_pop": 120,                   # Active word zoom percentage (e.g. 120 = 120%)
    "badge_color": "#FBBF24",          # Hex color for frontend badges
    "is_boxed": True                   # Set True for Hormozi-style solid box badges
}
```

> **Note on ASS Colors**: ASS format is in BGR hexadecimal: `&H00<Blue><Green><Red>&`.
> For example: `#FBBF24` (Red=FB, Green=BF, Blue=24) becomes `&H0024BFFB&`.

### Step 2: Add preset to `frontend/src/app/studio/page.tsx`
Add the styling definitions to `STYLE_PRESETS` in [frontend/src/app/studio/page.tsx](file:///c:/Work/reel-caption-tool/frontend/src/app/studio/page.tsx):

```typescript
"Your New Preset Name": {
  label: "Preset Display Label",
  badge: "#FBBF24", // Accent hex color
  text: "#0F172A",  // Text color on badge
  bg: "rgba(251, 191, 36, 0.15)",
  border: "#FBBF24",
  desc: "Brief description of the style"
}
```

---

## 🔤 3. How to Add New System Fonts

1. In `backend/caption_engine.py`, add font details to `AVAILABLE_FONTS`:
```python
AVAILABLE_FONTS["Custom Font Name"] = {
    "ass_name": "PostScript / Font Family Name",
    "win_path": r"C:\Windows\Fonts\customfont.ttf"
}
```
2. In `frontend/src/app/studio/page.tsx`, add the option to the `<select>` in the Typography tab and update `getFontFamilyCss()`.

---

## 🛠️ 4. How to Add a New Workstation Tool

1. **Create the page**: Add a new folder in `frontend/src/app/<tool-name>/page.tsx`.
2. **Add backend API endpoints**: In `backend/main.py`, define endpoints under `/api/<tool-name>`.
3. **Link to Tools Hub**: In `frontend/src/app/page.tsx`, add a workstation card with features and direct launch link.
4. **Update Sitemap & SEO**: Include the new route in `frontend/src/app/sitemap.ts` and `frontend/src/app/layout.tsx`.

---

## 🧪 5. Testing & Verification Before Submitting a PR

Before submitting your Pull Request, ensure both backend and frontend tests pass:

```bash
# 1. Verify Python Backend Syntax & Import Checks
python -m py_compile backend/main.py
python -m py_compile backend/caption_engine.py

# 2. Verify Frontend Build & TypeScript
cd frontend
npm run build
```

---

## 📜 Code of Conduct & Contribution Rules

- Maintain zero developer clutter in user-facing UI.
- Use Tailwind CSS with dark-mode aesthetic (`#07090F` canvas, slate accents).
- Keep all operations blazing fast with zero unwanted blocking overhead.
- Be respectful and supportive of fellow contributors!
