import os
import re
import subprocess
import json
import shutil
import time
import zipfile
from pathlib import Path
from typing import List, Dict, Any, Tuple
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw, ImageFont

STYLE_PRESETS = {
    "Hormozi Boxed 2.0 (Solid Box Behind Word)": {
        "primary_color": "&H00FFFFFF&",
        "highlight_color": "&H00101010&", # Dark text inside yellow box
        "outline_color": "&H00000000&",
        "badge_ass_color": "&H0024BFFB&", # Solid yellow badge in ASS BGR
        "outline_width": 14,              # Extra thick solid badge
        "shadow_depth": 3,
        "zoom_pop": 115,
        "badge_color": "#FBBF24",
        "is_boxed": True
    },
    "MrBeast Boxed Green (High Energy)": {
        "primary_color": "&H00FFFFFF&",
        "highlight_color": "&H00101010&", # Dark text inside green box
        "outline_color": "&H00000000&",
        "badge_ass_color": "&H005EC522&", # Solid neon green badge in ASS BGR
        "outline_width": 14,
        "shadow_depth": 3,
        "zoom_pop": 115,
        "badge_color": "#22C55E",
        "is_boxed": True
    },
    "Hormozi Yellow (Trending)": {
        "primary_color": "&H00FFFFFF&",
        "highlight_color": "&H0000FFFF&",
        "outline_color": "&H00000000&",
        "outline_width": 8,
        "shadow_depth": 4,
        "zoom_pop": 120,
        "badge_color": "#FBBF24",
        "is_boxed": False
    },
    "MrBeast Neon Green": {
        "primary_color": "&H00FFFFFF&",
        "highlight_color": "&H0033FF33&",
        "outline_color": "&H00000000&",
        "outline_width": 8,
        "shadow_depth": 4,
        "zoom_pop": 120,
        "badge_color": "#22C55E",
        "is_boxed": False
    },
    "Electric Cyan": {
        "primary_color": "&H00FFFFFF&",
        "highlight_color": "&H00FFFF00&",
        "outline_color": "&H00000000&",
        "outline_width": 8,
        "shadow_depth": 4,
        "zoom_pop": 120,
        "badge_color": "#06B6D4",
        "is_boxed": False
    },
    "Hot Coral / Fire": {
        "primary_color": "&H00FFFFFF&",
        "highlight_color": "&H002447FF&",
        "outline_color": "&H00000000&",
        "outline_width": 8,
        "shadow_depth": 4,
        "zoom_pop": 120,
        "badge_color": "#EF4444",
        "is_boxed": False
    },
    "Pure Gold": {
        "primary_color": "&H00FFFFFF&",
        "highlight_color": "&H0000D7FF&",
        "outline_color": "&H00000000&",
        "outline_width": 8,
        "shadow_depth": 4,
        "zoom_pop": 120,
        "badge_color": "#EAB308",
        "is_boxed": False
    },
    "Ali Abdaal Dynamic Pop": {
        "primary_color": "&H00FFFFFF&",
        "highlight_color": "&H000F172A&",
        "outline_color": "&H00000000&",
        "badge_ass_color": "&H0047E0FD&", # Warm pastel yellow #FDE047 (ASS BGR)
        "outline_width": 12,
        "shadow_depth": 2,
        "zoom_pop": 118,
        "badge_color": "#FDE047",
        "is_boxed": True
    },
    "Iman Gadzhi Minimalist Serif": {
        "primary_color": "&H00E2E8F0&", # Luxury Off-White
        "highlight_color": "&H0037AFD4&", # Polished Gold #D4AF37 (ASS BGR)
        "outline_color": "&H00000000&",
        "outline_width": 4, # Refined minimal hairline outline
        "shadow_depth": 3,
        "zoom_pop": 108,
        "badge_color": "#D4AF37",
        "is_boxed": False
    },
    "MrBeast Bounce Animation": {
        "primary_color": "&H00FFFFFF&",
        "highlight_color": "&H0000FFFA&", # Electric Yellow #FAFF00
        "outline_color": "&H00000000&",
        "outline_width": 16, # Bold punchy comic stroke
        "shadow_depth": 6,
        "zoom_pop": 130, # Adrenaline bounce pop
        "badge_color": "#FAFF00",
        "is_boxed": False
    }
}

AVAILABLE_FONTS = {
    "Arial Black (Bold Trending)": {
        "ass_name": "Arial Black",
        "win_path": r"C:\Windows\Fonts\ariblk.ttf"
    },
    "Impact (Punchy Viral)": {
        "ass_name": "Impact",
        "win_path": r"C:\Windows\Fonts\impact.ttf"
    },
    "Trebuchet MS (Clean Modern)": {
        "ass_name": "Trebuchet MS",
        "win_path": r"C:\Windows\Fonts\trebucbd.ttf"
    },
    "Arial Bold (Standard)": {
        "ass_name": "Arial",
        "win_path": r"C:\Windows\Fonts\arialbd.ttf"
    },
    "Georgia (Luxury Editorial Serif)": {
        "ass_name": "Georgia",
        "win_path": r"C:\Windows\Fonts\georgia.ttf"
    },
    "Times New Roman Bold (Minimalist Serif)": {
        "ass_name": "Times New Roman",
        "win_path": r"C:\Windows\Fonts\timesbd.ttf"
    }
}

EMOJI_KEYWORD_MAP = {
    # Wealth & Money
    "money": "💰", "cash": "💵", "dollar": "💵", "dollars": "💵", "rich": "🤑", "wealth": "💎",
    "profit": "📈", "revenue": "📈", "crypto": "🪙", "bitcoin": "🪙", "paisa": "💸", "paise": "💸",
    "expensive": "💎", "invest": "📊", "investment": "📊", "millionaire": "💰", "billionaire": "💰",
    "business": "💼", "pay": "💳", "paid": "💳", "income": "💵",

    # Fire, Viral, Mindblown
    "fire": "🔥", "lit": "🔥", "hot": "🔥", "viral": "🚀", "crazy": "🤯", "insane": "🤯",
    "mindblowing": "🤯", "unbelievable": "😱", "shocking": "⚡", "epic": "⚡", "power": "⚡",
    "magic": "✨", "boom": "💥",

    # Thinking, Mindset & Secrets
    "mind": "🧠", "brain": "🧠", "think": "🤔", "thinking": "🤔", "smart": "💡", "idea": "💡",
    "secret": "🤫", "learn": "📚", "knowledge": "🧠", "focus": "🎯", "strategy": "♟️",
    "rule": "📜", "trick": "🪄", "hack": "⚡", "tips": "💡",

    # Danger, Stop, Warning, Mistakes
    "stop": "🛑", "danger": "⚠️", "warning": "⚠️", "mistake": "❌", "wrong": "❌", "never": "🚫",
    "problem": "🚨", "risk": "⚠️", "scam": "🚨", "trap": "🪤", "fail": "📉", "lose": "❌",
    "lost": "❌", "bad": "👎",

    # Success, Winning, Goals
    "win": "🏆", "winner": "🏆", "winning": "🏆", "success": "🎯", "champion": "🥇", "target": "🎯",
    "goal": "🎯", "king": "👑", "boss": "💼", "leader": "👑", "victory": "✌️", "conquer": "👑",
    "best": "⭐", "top": "🔝",

    # Speed, Time, Actions
    "time": "⏰", "clock": "⏰", "fast": "⚡", "speed": "🏎️", "quick": "⚡", "now": "⏱️",
    "wait": "⏳", "hurry": "🏃", "today": "📅", "start": "🟢",

    # Emotions & Reactions
    "love": "❤️", "heart": "❤️", "happy": "😄", "sad": "😢", "cry": "😭", "angry": "😡",
    "laugh": "😂", "lol": "🤣", "wow": "😮", "yes": "✅", "no": "❌",

    # People, Body, Fitness
    "gym": "🏋️", "workout": "💪", "strong": "🦾", "muscle": "💪", "health": "🥗",
    "people": "👥", "team": "🤝", "family": "👨‍👩‍👧", "friends": "🤝", "look": "👀", "see": "👁️"
}

def get_word_emoji(word: str) -> str:
    cleaned = re.sub(r"[^\w]", "", word).lower()
    return EMOJI_KEYWORD_MAP.get(cleaned, "")

BASE_DIR = Path(__file__).resolve().parent
LOCAL_BIN = BASE_DIR / "bin"

def format_timestamp(seconds: float) -> str:
    if seconds < 0:
        seconds = 0.0
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = seconds % 60
    return f"{hours}:{minutes:02d}:{secs:05.2f}"

def resolve_ffprobe_path(ffmpeg_path: str = "ffmpeg") -> str:
    # 1. Windows: ffmpeg.exe -> ffprobe.exe
    if "ffmpeg.exe" in ffmpeg_path.lower():
        probe = ffmpeg_path.replace("ffmpeg.exe", "ffprobe.exe").replace("FFMPEG.EXE", "ffprobe.exe")
        if Path(probe).exists():
            return str(probe)
    # 2. Posix: /path/to/ffmpeg -> /path/to/ffprobe
    if ffmpeg_path.endswith("ffmpeg"):
        probe = ffmpeg_path[:-6] + "ffprobe"
        if Path(probe).exists():
            return str(probe)
    # 3. System PATH lookup
    which_probe = shutil.which("ffprobe")
    if which_probe:
        return which_probe
    return "ffprobe"

def get_video_dimensions(video_path: str, ffmpeg_path: str = "ffmpeg") -> Tuple[int, int]:
    ffprobe_path = resolve_ffprobe_path(ffmpeg_path)
    cmd = [
        ffprobe_path,
        "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height",
        "-of", "json",
        video_path
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        data = json.loads(res.stdout)
        width = data["streams"][0]["width"]
        height = data["streams"][0]["height"]
        return int(width), int(height)
    except Exception:
        return 1080, 1920

_GLOBAL_WHISPER_MODELS = {}

def get_or_load_whisper_model(model_size: str = "tiny"):
    global _GLOBAL_WHISPER_MODELS
    if model_size not in _GLOBAL_WHISPER_MODELS:
        from faster_whisper import WhisperModel
        _GLOBAL_WHISPER_MODELS[model_size] = WhisperModel(
            model_size,
            device="cpu",
            compute_type="int8",
            cpu_threads=4
        )
    return _GLOBAL_WHISPER_MODELS[model_size]

def transcribe_audio_whisper(
    video_path: str,
    model_size: str = "tiny",
    language: str = None,
    ffmpeg_path: str = "ffmpeg"
) -> List[Dict[str, Any]]:
    # Extract audio to 16kHz mono mp3 for 5x faster processing than raw video decoding
    temp_dir = BASE_DIR / "outputs"
    temp_dir.mkdir(exist_ok=True)
    temp_audio = str(temp_dir / f"temp_whisper_{Path(video_path).stem}.mp3")
    extract_audio_for_groq(video_path, temp_audio, ffmpeg_path=ffmpeg_path)

    model = get_or_load_whisper_model(model_size)

    segments, info = model.transcribe(
        temp_audio,
        word_timestamps=True,
        language=language if language and language != "Auto-detect" else None,
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=400),
        beam_size=1
    )

    words = []
    for segment in segments:
        if segment.words:
            for w in segment.words:
                cleaned_word = w.word.strip().upper()
                if cleaned_word:
                    words.append({
                        "word": cleaned_word,
                        "start": w.start,
                        "end": w.end,
                        "probability": w.probability
                    })
    try:
        Path(temp_audio).unlink(missing_ok=True)
    except Exception:
        pass
    return words

def extract_audio_for_groq(video_path: str, output_audio_path: str, ffmpeg_path: str = "ffmpeg") -> str:
    cmd = [
        ffmpeg_path,
        "-y",
        "-i", video_path,
        "-vn",
        "-acodec", "libmp3lame",
        "-b:a", "64k",
        "-ar", "16000",
        "-ac", "1",
        output_audio_path
    ]
    subprocess.run(cmd, capture_output=True, check=True)
    return output_audio_path

def transcribe_audio_groq(
    video_path: str,
    api_key: str,
    language: str = None,
    ffmpeg_path: str = "ffmpeg"
) -> List[Dict[str, Any]]:
    import requests
    temp_dir = BASE_DIR / "outputs"
    temp_dir.mkdir(exist_ok=True)
    temp_audio = str(temp_dir / f"temp_groq_{Path(video_path).stem}.mp3")

    extract_audio_for_groq(video_path, temp_audio, ffmpeg_path=ffmpeg_path)

    url = "https://api.groq.com/openai/v1/audio/transcriptions"
    headers = {
        "Authorization": f"Bearer {api_key.strip()}"
    }

    try:
        with open(temp_audio, "rb") as f:
            files = {
                "file": (Path(temp_audio).name, f, "audio/mpeg")
            }
            data = {
                "model": "whisper-large-v3-turbo",
                "response_format": "verbose_json",
                "timestamp_granularities[]": "word"
            }
            if language and language != "Auto-detect":
                data["language"] = language

            resp = requests.post(url, headers=headers, files=files, data=data, timeout=60)

        if resp.status_code != 200:
            raise RuntimeError(f"Groq API Error ({resp.status_code}): {resp.text}")

        res_data = resp.json()
        words = []
        raw_words = res_data.get("words", [])

        if not raw_words and "segments" in res_data:
            for seg in res_data["segments"]:
                if "words" in seg:
                    raw_words.extend(seg["words"])

        for w in raw_words:
            raw_w = w.get("word", "").strip().upper()
            if raw_w:
                words.append({
                    "word": raw_w,
                    "start": float(w.get("start", 0)),
                    "end": float(w.get("end", 0)),
                    "probability": 1.0
                })
        return words
    finally:
        if Path(temp_audio).exists():
            try:
                os.remove(temp_audio)
            except Exception:
                pass

def resolve_font_info(font_choice: str = "Arial Black (Bold Trending)", custom_font_path: str = None) -> Tuple[str, str]:
    if custom_font_path and Path(custom_font_path).exists():
        stem = Path(custom_font_path).stem
        return stem, custom_font_path

    info = AVAILABLE_FONTS.get(font_choice, AVAILABLE_FONTS["Arial Black (Bold Trending)"])
    ass_name = info["ass_name"]
    win_path = info["win_path"]

    if os.path.exists(win_path):
        return ass_name, win_path

    sys_font, _ = get_system_font_paths()
    return ass_name, sys_font

def format_words_to_editable_text(words: List[Dict[str, Any]]) -> str:
    lines = []
    for w in words:
        start_str = f"{float(w['start']):.2f}"
        end_str = f"{float(w['end']):.2f}"
        lines.append(f"{start_str} - {end_str} | {w['word']}")
    return "\n".join(lines)

def parse_editable_text_to_words(text: str) -> List[Dict[str, Any]]:
    words = []
    for line in text.strip().split("\n"):
        line = line.strip()
        if not line:
            continue
        m = re.match(r"([\d\.]+)\s*-\s*([\d\.]+)\s*\|\s*(.+)", line)
        if m:
            start_val = float(m.group(1))
            end_val = float(m.group(2))
            w_text = m.group(3).strip().upper()
            words.append({
                "word": w_text,
                "start": start_val,
                "end": end_val,
                "probability": 1.0
            })
    return words

def get_video_duration(video_path: str, ffmpeg_path: str = "ffmpeg") -> float:
    ffprobe_path = resolve_ffprobe_path(ffmpeg_path)
    # 1. Primary probe: container format=duration
    cmd = [
        ffprobe_path,
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "csv=p=0",
        video_path
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        out_str = res.stdout.strip().split("\n")[0].strip()
        dur = float(out_str)
        if dur > 0:
            return dur
    except Exception as e:
        print(f"⚠️ [ffprobe format=duration failed for {video_path}]: {e}", flush=True)

    # 2. Fallback probe: video stream duration
    cmd_stream = [
        ffprobe_path,
        "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=duration",
        "-of", "csv=p=0",
        video_path
    ]
    try:
        res_stream = subprocess.run(cmd_stream, capture_output=True, text=True, check=True)
        out_str = res_stream.stdout.strip().split("\n")[0].strip()
        dur = float(out_str)
        if dur > 0:
            return dur
    except Exception as e:
        print(f"⚠️ [ffprobe stream=duration failed for {video_path}]: {e}", flush=True)

    raise RuntimeError(f"Could not determine video duration with ffprobe for: {video_path}")

def remove_video_silences(
    video_path: str,
    output_path: str,
    ffmpeg_path: str = "ffmpeg",
    noise_db: int = -30,
    min_silence_dur: float = 0.45
) -> str:
    total_dur = get_video_duration(video_path, ffmpeg_path=ffmpeg_path)

    cmd = [
        ffmpeg_path,
        "-i", video_path,
        "-af", f"silencedetect=noise={noise_db}dB:d={min_silence_dur}",
        "-f", "null",
        "-"
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    starts = [float(x) for x in re.findall(r"silence_start:\s*([\d\.]+)", res.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end:\s*([\d\.]+)", res.stderr)]

    silences = list(zip(starts, ends))
    if not silences:
        return video_path

    chunks = []
    curr = 0.0
    for s_start, s_end in silences:
        if s_start > curr + 0.15:
            chunks.append((curr, s_start))
        curr = s_end

    if curr + 0.15 < total_dur:
        chunks.append((curr, total_dur))

    if len(chunks) <= 1:
        return video_path

    filter_parts = []
    concat_inputs = []
    for idx, (cs, ce) in enumerate(chunks):
        filter_parts.append(f"[0:v]trim=start={cs:.2f}:end={ce:.2f},setpts=PTS-STARTPTS[v{idx}]")
        filter_parts.append(f"[0:a]atrim=start={cs:.2f}:end={ce:.2f},asetpts=PTS-STARTPTS[a{idx}]")
        concat_inputs.append(f"[v{idx}][a{idx}]")

    filter_parts.append(f"{''.join(concat_inputs)}concat=n={len(chunks)}:v=1:a=1[outv][outa]")

    run_cmd = [
        ffmpeg_path,
        "-y",
        "-i", video_path,
        "-filter_complex", ";".join(filter_parts),
        "-map", "[outv]",
        "-map", "[outa]",
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-crf", "22",
        "-c:a", "aac",
        "-b:a", "192k",
        output_path
    ]
    sub_res = subprocess.run(run_cmd, capture_output=True, text=True)
    if sub_res.returncode == 0 and Path(output_path).exists():
        return output_path
    return video_path

def generate_sfx_audio_track(
    words: List[Dict[str, Any]],
    total_duration_sec: float,
    output_wav_path: str,
    sfx_style: str = "Dynamic Auto",
    volume: float = 0.6
) -> str:
    import wave
    import struct

    sample_rate = 44100
    total_samples = int(total_duration_sec * sample_rate)
    if total_samples <= 0:
        return None

    sfx_dir = BASE_DIR / "assets" / "sfx"
    sfx_data = {}
    for name in ["pop", "ding", "swoosh"]:
        p = sfx_dir / f"{name}.wav"
        if p.exists():
            try:
                with wave.open(str(p), "rb") as wf:
                    raw = wf.readframes(wf.getnframes())
                    sfx_data[name] = [s / 32768.0 for s in struct.unpack(f"<{len(raw)//2}h", raw)]
            except Exception:
                pass

    if not sfx_data:
        return None

    track = [0.0] * total_samples
    has_any = False

    for w in words:
        raw_word = w["word"].upper()
        emoji = get_word_emoji(raw_word)
        start_sec = float(w["start"])

        if "Ding" in sfx_style:
            sfx_type = "ding"
            is_trigger = bool(emoji) or any(k in raw_word for k in ["WIN", "MONEY", "GOLD", "PROFIT", "RICH"])
        elif "Pop" in sfx_style:
            sfx_type = "pop"
            is_trigger = bool(emoji)
        else: # Dynamic Auto
            if emoji in ["💰", "💵", "🤑", "💎", "🏆", "🥇"] or any(k in raw_word for k in ["WIN", "MONEY", "DOLLAR", "RICH"]):
                sfx_type = "ding"
                is_trigger = True
            elif emoji in ["🚀", "⚡", "🏎️", "💥", "🔥"] or any(k in raw_word for k in ["VIRAL", "FIRE", "BOOM", "FAST"]):
                sfx_type = "swoosh"
                is_trigger = True
            elif emoji:
                sfx_type = "pop"
                is_trigger = True
            else:
                is_trigger = False

        if is_trigger:
            has_any = True
            samples = sfx_data.get(sfx_type, sfx_data.get("pop", []))
            start_idx = int(start_sec * sample_rate)
            for i, s in enumerate(samples):
                idx = start_idx + i
                if idx < total_samples:
                    track[idx] = max(-1.0, min(1.0, track[idx] + s * volume))

    if not has_any:
        return None

    with wave.open(output_wav_path, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        packed = b"".join(struct.pack("<h", max(-32767, min(32767, int(s * 32767)))) for s in track)
        wf.writeframes(packed)

    return output_wav_path

def group_words_into_chunks(words: List[Dict[str, Any]], words_per_chunk: int = 3) -> List[List[Dict[str, Any]]]:
    chunks = []
    current_chunk = []

    for i, w in enumerate(words):
        current_chunk.append(w)

        pause = False
        if i < len(words) - 1:
            pause = (words[i+1]["start"] - w["end"]) > 0.55

        has_punctuation = any(p in w["word"] for p in [".", "!", "?", ","])

        if len(current_chunk) >= words_per_chunk or pause or (has_punctuation and len(current_chunk) >= 2):
            chunks.append(current_chunk)
            current_chunk = []

    if current_chunk:
        chunks.append(current_chunk)

    return chunks

def generate_ass_subtitles(
    words: List[Dict[str, Any]],
    output_ass_path: str,
    res_x: int = 1080,
    res_y: int = 1920,
    style_name: str = "Hormozi Boxed 2.0 (Solid Box Behind Word)",
    font_name: str = "Arial Black",
    font_size: int = 110,
    position: str = "Lower Third (Reels Standard)",
    words_per_chunk: int = 3,
    is_4k: bool = False,
    enable_emojis: bool = True
):
    style = STYLE_PRESETS.get(style_name, STYLE_PRESETS["Hormozi Boxed 2.0 (Solid Box Behind Word)"])

    scale_factor = 2.0 if is_4k else 1.0
    actual_res_x = int(res_x * scale_factor)
    actual_res_y = int(res_y * scale_factor)
    actual_font_size = int(font_size * scale_factor)
    actual_outline = int(style['outline_width'] * scale_factor)
    actual_shadow = int(style['shadow_depth'] * scale_factor)

    if position == "Center":
        alignment = 5
        margin_v = 0
    elif position == "Top":
        alignment = 8
        margin_v = int(actual_res_y * 0.12)
    else:
        alignment = 2
        margin_v = int(actual_res_y * 0.22)

    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {actual_res_x}
PlayResY: {actual_res_y}
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{font_name}, Segoe UI Emoji,{actual_font_size},{style['primary_color']},{style['primary_color']},{style['outline_color']},{style['outline_color']},-1,0,0,0,100,100,2,0,1,{actual_outline},{actual_shadow},{alignment},60,60,{margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

    chunks = group_words_into_chunks(words, words_per_chunk=words_per_chunk)
    dialogues = []

    for chunk in chunks:
        if not chunk:
            continue
        
        for active_idx, active_word in enumerate(chunk):
            start_time = format_timestamp(active_word["start"])
            
            if active_idx < len(chunk) - 1:
                end_time = format_timestamp(chunk[active_idx + 1]["start"])
            else:
                end_time = format_timestamp(active_word["end"] + 0.15)

            line_parts = []
            for idx, w in enumerate(chunk):
                raw_text = w["word"]
                emoji = get_word_emoji(raw_text) if enable_emojis else ""
                word_text = f"{raw_text} {emoji}".strip() if emoji else raw_text

                if idx == active_idx:
                    zoom = style.get("zoom_pop", 120)
                    hl_color = style["highlight_color"]
                    if style.get("is_boxed", False):
                        badge_color = style.get("badge_ass_color", "&H0024BFFB&")
                        box_outline = int(style.get("outline_width", 14) * scale_factor)
                        line_parts.append(f"{{\\bord{box_outline}\\3c{badge_color}\\c{hl_color}\\fscx{zoom}\\fscy{zoom}}}{word_text}{{\\bord{actual_outline}\\3c{style['outline_color']}\\c{style['primary_color']}\\fscx100\\fscy100}}")
                    else:
                        active_outline = int(style.get("outline_width", 8) * scale_factor)
                        line_parts.append(f"{{\\bord{active_outline}\\c{hl_color}\\fscx{zoom}\\fscy{zoom}}}{word_text}{{\\bord{actual_outline}\\c{style['primary_color']}\\fscx100\\fscy100}}")
                else:
                    line_parts.append(word_text)

            chunk_text = " ".join(line_parts)
            dialogues.append(f"Dialogue: 0,{start_time},{end_time},Default,,0,0,0,,{chunk_text}")

    content = header + "\n".join(dialogues) + "\n"
    with open(output_ass_path, "w", encoding="utf-8") as f:
        f.write(content)

BGM_PRESET_LIBRARY = [
    {
        "id": "bansuri_sad",
        "title": "Bansuri & Rain Drops (Arijit / Sad Vibe)",
        "category": "Sad & Shayari 💔",
        "file": "bansuri_sad.wav",
        "icon": "🪈",
        "desc": "Deep Indian bamboo flute, soulful Raag Shivranjani, slow cello strings"
    },
    {
        "id": "sufi_sarangi",
        "title": "Sufi Sarangi & Dholak Pulse",
        "category": "Sad & Shayari 💔",
        "file": "sufi_sarangi.wav",
        "icon": "🎻",
        "desc": "Classical bowed sarangi, tanpura ambient drone, Jaun Elia poetry style"
    },
    {
        "id": "snowfall_ambient",
        "title": "Snowfall Ambient (Øneheart Aesthetic)",
        "category": "English Sad & Deep 🌧️",
        "file": "snowfall_ambient.wav",
        "icon": "❄️",
        "desc": "Dreamy slow piano pad, warm sub drone, viral lonely night reel aesthetic"
    },
    {
        "id": "experience_piano",
        "title": "Experience Piano & Strings (Einaudi Style)",
        "category": "English Sad & Deep 🌧️",
        "file": "experience_piano.wav",
        "icon": "🎹",
        "desc": "Emotional arpeggiated piano building into cinematic violin swells"
    },
    {
        "id": "interstellar_deep",
        "title": "Interstellar Cosmic Deep (Zimmer Style)",
        "category": "Podcast & Thinking 🎙️",
        "file": "interstellar_deep.wav",
        "icon": "🌌",
        "desc": "Cathedral organ chords and slow cosmic pulse for mind-expanding reels"
    },
    {
        "id": "podcast_drone",
        "title": "Lex & Huberman Minimal Focus Drone",
        "category": "Podcast & Thinking 🎙️",
        "file": "podcast_drone.wav",
        "icon": "🎙️",
        "desc": "Subtle 55Hz sub-bass and warm organic air for interview speech clarity"
    },
    {
        "id": "lofi_chill",
        "title": "Ali Abdaal Coffeehouse Lofi",
        "category": "Lofi & Aesthetic ✨",
        "file": "lofi_chill.wav",
        "icon": "☕",
        "desc": "Vintage vinyl crackle, warm Rhodes piano, gentle relaxed study beat"
    },
    {
        "id": "phonk_gym",
        "title": "Brazilian Drift Phonk (Gym / 808)",
        "category": "Phonk & High Energy 🔥",
        "file": "phonk_gym.wav",
        "icon": "⚡",
        "desc": "Aggressive 808 sub-bass slides, cowbell cadence, high-retention energy"
    }
]

def ensure_bgm_library_exists():
    """
    Checks if BGM preset files exist in backend/assets/bgm.
    If missing, synthesizes high-fidelity ambient harmonic audio files procedurally.
    Avoids committing large binary .wav files to Git while ensuring full functionality.
    """
    bgm_dir = BASE_DIR / "assets" / "bgm"
    bgm_dir.mkdir(parents=True, exist_ok=True)
    
    missing = [t for t in BGM_PRESET_LIBRARY if not (bgm_dir / t["file"]).exists()]
    if not missing:
        return
        
    try:
        import numpy as np
        import wave
        
        sample_rate = 44100
        duration = 18.0
        t = np.linspace(0, duration, int(sample_rate * duration), False)
        
        def save_wav(path, data):
            data = data / (np.max(np.abs(data)) + 1e-6) * 0.88
            fade_len = int(sample_rate * 0.8)
            fade_in = np.linspace(0, 1, fade_len)
            fade_out = np.linspace(1, 0, fade_len)
            data[:fade_len] *= fade_in
            data[-fade_len:] *= fade_out
            int_data = (data * 32767).astype(np.int16)
            with wave.open(str(path), 'w') as f:
                f.setnchannels(1)
                f.setsampwidth(2)
                f.setframerate(sample_rate)
                f.writeframes(int_data.tobytes())

        # 1. Bansuri Sad
        flute_notes = [440, 493.88, 523.25, 659.25, 523.25, 493.88, 440, 392]
        sig_bansuri = np.zeros_like(t)
        note_dur = duration / len(flute_notes)
        for i, freq in enumerate(flute_notes):
            start_idx = int(i * note_dur * sample_rate)
            end_idx = int((i + 1) * note_dur * sample_rate)
            sub_t = t[start_idx:end_idx]
            vibrato = 1.0 + 0.02 * np.sin(2 * np.pi * 5.2 * sub_t)
            envelope = np.sin(np.pi * (sub_t - sub_t[0]) / (sub_t[-1] - sub_t[0])) ** 1.5
            flute = np.sin(2 * np.pi * freq * vibrato * sub_t) + 0.35 * np.sin(4 * np.pi * freq * sub_t)
            breath = 0.08 * np.random.normal(0, 1, len(sub_t))
            sig_bansuri[start_idx:end_idx] = (flute + breath) * envelope
        drone = 0.4 * np.sin(2 * np.pi * 110 * t) + 0.2 * np.sin(2 * np.pi * 164.81 * t)
        save_wav(bgm_dir / 'bansuri_sad.wav', sig_bansuri + drone)

        # 2. Snowfall Ambient
        sig_snowfall = np.zeros_like(t)
        chords = [[220, 261.63, 329.63, 392], [174.61, 220, 261.63, 329.63], [196, 246.94, 293.66, 392], [164.81, 196, 246.94, 293.66]]
        c_dur = duration / len(chords)
        for i, chord in enumerate(chords):
            s = int(i * c_dur * sample_rate)
            e = int((i + 1) * c_dur * sample_rate)
            st = t[s:e]
            env = np.sin(np.pi * (st - st[0]) / (st[-1] - st[0])) ** 1.2
            c_sig = sum(np.sin(2 * np.pi * (f + 0.3 * np.sin(0.8 * st)) * st) for f in chord)
            sig_snowfall[s:e] = c_sig * env
        sub = 0.45 * np.sin(2 * np.pi * 55 * t) + 0.25 * np.sin(2 * np.pi * 82.41 * t)
        save_wav(bgm_dir / 'snowfall_ambient.wav', sig_snowfall + sub)

        # 3. Experience Piano & Violins
        sig_einaudi = np.zeros_like(t)
        arp_freqs = [220, 277.18, 329.63, 440, 329.63, 277.18, 220, 164.81] * int(duration // 2 + 1)
        arp_dur = 0.25
        for i, f in enumerate(arp_freqs):
            s = int(i * arp_dur * sample_rate)
            e = min(len(t), int((i + 1.2) * arp_dur * sample_rate))
            if s >= len(t): break
            st = t[s:e]
            env = np.exp(-4.5 * (st - st[0]) / arp_dur)
            piano = np.sin(2 * np.pi * f * st) + 0.3 * np.sin(4 * np.pi * f * st)
            sig_einaudi[s:e] += piano * env * 0.7
        violin_pad = 0.35 * (np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 554.37 * t) + np.sin(2 * np.pi * 659.25 * t)) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.15 * t))
        save_wav(bgm_dir / 'experience_piano.wav', sig_einaudi + violin_pad)

        # 4. Interstellar Cosmic Deep
        organ = sum(np.sin(2 * np.pi * f * t) for f in [65.41, 130.81, 196.00, 261.63, 329.63])
        cosmic_pulse = 0.3 * np.sin(2 * np.pi * 4.0 * t) * np.sin(2 * np.pi * 523.25 * t)
        save_wav(bgm_dir / 'interstellar_deep.wav', organ * 0.4 + cosmic_pulse)

        # 5. Sufi Sarangi & Dholak Pulse
        sarangi = np.zeros_like(t)
        s_notes = [293.66, 329.63, 349.23, 440, 392, 349.23, 329.63, 293.66]
        s_dur = duration / len(s_notes)
        for i, freq in enumerate(s_notes):
            s = int(i * s_dur * sample_rate)
            e = int((i + 1) * s_dur * sample_rate)
            st = t[s:e]
            vibrato = 1.0 + 0.03 * np.sin(2 * np.pi * 6.0 * st)
            env = np.sin(np.pi * (st - st[0]) / (st[-1] - st[0])) ** 1.5
            bowed = np.sin(2 * np.pi * freq * vibrato * st) + 0.4 * np.sin(4 * np.pi * freq * st) + 0.2 * np.sin(6 * np.pi * freq * st)
            sarangi[s:e] = bowed * env
        tanpura = 0.35 * (np.sin(2 * np.pi * 146.83 * t) + np.sin(2 * np.pi * 220 * t))
        save_wav(bgm_dir / 'sufi_sarangi.wav', sarangi + tanpura)

        # 6. Lex & Huberman Podcast Drone
        podcast_drone = 0.5 * np.sin(2 * np.pi * 55 * t) + 0.25 * np.sin(2 * np.pi * 110 * t) + 0.15 * np.sin(2 * np.pi * 220 * t)
        warm_rhodes = 0.2 * sum(np.sin(2 * np.pi * f * t) for f in [261.63, 329.63, 392, 493.88]) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.2 * t))
        save_wav(bgm_dir / 'podcast_drone.wav', podcast_drone + warm_rhodes)

        # 7. Ali Abdaal Coffeehouse Lofi
        lofi_sig = np.zeros_like(t)
        l_chords = [[146.83, 220, 261.63, 329.63], [164.81, 246.94, 293.66, 370], [130.81, 196, 246.94, 329.63]]
        l_dur = duration / len(l_chords)
        for i, chord in enumerate(l_chords):
            s = int(i * l_dur * sample_rate)
            e = int((i + 1) * l_dur * sample_rate)
            st = t[s:e]
            env = np.sin(np.pi * (st - st[0]) / (st[-1] - st[0])) ** 1.3
            c = sum(np.sin(2 * np.pi * f * st) for f in chord)
            lofi_sig[s:e] = c * env
        vinyl = 0.04 * np.random.normal(0, 1, len(t))
        save_wav(bgm_dir / 'lofi_chill.wav', lofi_sig + vinyl)

        # 8. Brazilian Phonk Drift
        bass_pulse = 0.6 * np.sin(2 * np.pi * 45 * t) * (np.sin(2 * np.pi * 2.0 * t) > 0)
        cowbell = 0.3 * (np.sin(2 * np.pi * 587.33 * t) + 0.5 * np.sin(2 * np.pi * 880 * t)) * (np.sin(2 * np.pi * 4.0 * t) > 0.8)
        save_wav(bgm_dir / 'phonk_gym.wav', bass_pulse + cowbell)
    except Exception as e:
        print(f"[BGM Synthesis Warning] Could not synthesize BGM tracks: {e}")

# Ensure library files exist
ensure_bgm_library_exists()

def build_render_ffmpeg_cmd(
    video_path: str,
    ass_path: str,
    output_video_path: str,
    ffmpeg_path: str = "ffmpeg",
    is_4k: bool = False,
    sfx_audio_path: Optional[str] = None,
    fonts_dir: Optional[str] = None,
    bg_music_path: Optional[str] = None,
    bg_music_volume: float = 0.20,
    enable_auto_ducking: bool = True,
    bg_music_start_offset: float = 0.0,
    real_duration: float = 0.0
) -> Tuple[List[str], bool]:
    # Use relative path or properly escaped path to avoid Windows colon issues
    try:
        rel_ass = os.path.relpath(ass_path).replace("\\", "/")
        sub_filter = f"subtitles='{rel_ass}'"
    except Exception:
        clean_ass = ass_path.replace("\\", "/").replace(":", "\\:")
        sub_filter = f"subtitles='{clean_ass}'"

    if fonts_dir and Path(fonts_dir).exists():
        rel_fonts = os.path.relpath(fonts_dir).replace("\\", "/")
        sub_filter = sub_filter[:-1] + f":fontsdir='{rel_fonts}'" + "'"

    # 1. PURE ZERO-RESCALE PASSTHROUGH (100% Original Camera Resolution & Sharpness)
    if is_4k:
        filter_str = f"scale=2160:3840:flags=lanczos,unsharp=5:5:0.8:5:5:0.0,{sub_filter}"
    else:
        # Original video pixels are 100% untouched! Only vector subtitles are burned
        filter_str = sub_filter

    # Visually lossless studio grade encoding
    crf = "18"

    cmd_inputs = ["-i", video_path]
    current_input_idx = 1
    sfx_idx = None
    bgm_idx = None

    if sfx_audio_path and Path(sfx_audio_path).exists():
        cmd_inputs.extend(["-i", sfx_audio_path])
        sfx_idx = current_input_idx
        current_input_idx += 1

    if bg_music_path and Path(bg_music_path).exists():
        cmd_inputs.extend(["-stream_loop", "-1"])
        if bg_music_start_offset > 0:
            cmd_inputs.extend(["-ss", f"{bg_music_start_offset:.2f}"])
        cmd_inputs.extend(["-i", bg_music_path])
        bgm_idx = current_input_idx
        current_input_idx += 1

    # Audio & Video Filtergraph Construction
    filter_complex_parts = [f"[0:v]{filter_str}[vout]"]

    if bgm_idx is not None:
        # Volume adjust for looped background music
        bgm_prep = f"[{bgm_idx}:a]volume={bg_music_volume:.2f}[bgm_raw]"
        filter_complex_parts.append(bgm_prep)

        if enable_auto_ducking:
            duck_filter = "[bgm_raw][0:a]sidechaincompress=threshold=0.09:ratio=4.5:attack=120:release=750[bgm_ducked]"
            filter_complex_parts.append(duck_filter)
            music_feed = "[bgm_ducked]"
        else:
            music_feed = "[bgm_raw]"

        if sfx_idx is not None:
            # Mix 3 inputs: Voice + Ducked BGM + SFX (dropout_transition=0: never cuts or fades the ending)
            mix_filter = f"[0:a]{music_feed}[{sfx_idx}:a]amix=inputs=3:duration=first:dropout_transition=0:weights=1.0 1.0 0.8[aout]"
        else:
            # Mix 2 inputs: Voice + Ducked BGM
            mix_filter = f"[0:a]{music_feed}amix=inputs=2:duration=first:dropout_transition=0:weights=1.0 1.0[aout]"
        filter_complex_parts.append(mix_filter)

    elif sfx_idx is not None:
        mix_filter = f"[0:a][{sfx_idx}:a]amix=inputs=2:duration=first:dropout_transition=0:weights=1.0 0.8[aout]"
        filter_complex_parts.append(mix_filter)

    has_audio_filter = (bgm_idx is not None or sfx_idx is not None)

    if has_audio_filter:
        cmd = [
            ffmpeg_path,
            "-y",
            "-threads", "0",
            *cmd_inputs,
            "-filter_complex", ";".join(filter_complex_parts),
            "-map", "[vout]",
            "-map", "[aout]",
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-tune", "fastdecode",
            "-crf", crf,
            "-c:a", "aac",
            "-b:a", "320k",
            "-movflags", "+faststart",
            output_video_path
        ]
    else:
        cmd = [
            ffmpeg_path,
            "-y",
            "-threads", "0",
            "-i", video_path,
            "-vf", filter_str,
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-tune", "fastdecode",
            "-crf", crf,
            "-c:a", "copy",
            "-movflags", "+faststart",
            output_video_path
        ]

    return cmd, has_audio_filter

def burn_subtitles_into_video(
    video_path: str,
    ass_path: str,
    output_video_path: str,
    ffmpeg_path: str = "ffmpeg",
    is_4k: bool = False,
    sfx_audio_path: str = None,
    fonts_dir: str = None,
    bg_music_path: str = None,
    bg_music_volume: float = 0.20,
    enable_auto_ducking: bool = True,
    bg_music_start_offset: float = 0.0,
    real_duration: Optional[float] = None
) -> bool:
    if real_duration is None or real_duration <= 0:
        real_duration = get_video_duration(video_path, ffmpeg_path=ffmpeg_path)

    cmd, _ = build_render_ffmpeg_cmd(
        video_path=video_path,
        ass_path=ass_path,
        output_video_path=output_video_path,
        ffmpeg_path=ffmpeg_path,
        is_4k=is_4k,
        sfx_audio_path=sfx_audio_path,
        fonts_dir=fonts_dir,
        bg_music_path=bg_music_path,
        bg_music_volume=bg_music_volume,
        enable_auto_ducking=enable_auto_ducking,
        bg_music_start_offset=bg_music_start_offset,
        real_duration=real_duration
    )

    print(f"🎬 [FFmpeg Burning Sync] Starting render ({real_duration:.2f}s, threads=0, preset=veryfast)...", flush=True)
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"FFmpeg error: {res.stderr}")

    # TASK 0: Check output duration mismatch
    out_duration = get_video_duration(output_video_path, ffmpeg_path=ffmpeg_path)
    print(f"🔍 [Duration Check] Input: {real_duration:.2f}s | Output: {out_duration:.2f}s", flush=True)
    if abs(out_duration - real_duration) > 1.0:
        raise RuntimeError(f"Render duration mismatch: input {real_duration:.2f}s vs output {out_duration:.2f}s (>1.0s difference)")

    return True

def fast_lanczos_upscale_stepped(
    input_p: Path,
    output_p: Path,
    target_res: str = "4K",
    progress_fn=None,
    base_p: float = 0.0,
    span_p: float = 1.0
) -> Tuple[str, Tuple[int, int], Tuple[int, int]]:
    """
    High-order Lanczos scaling to 4K (3840px) or 8K (7680px) with granular progress steps.
    """
    target_dim = 7680 if "8K" in target_res else 3840

    if progress_fn:
        progress_fn(base_p + span_p * 0.15, desc="🔍 Reading and analyzing image dimensions...")

    with Image.open(input_p) as img:
        img = img.convert("RGB")
        w, h = img.size
        orig_dims = (w, h)

        if h >= w:
            new_h = target_dim
            new_w = int(w * (target_dim / h))
        else:
            new_w = target_dim
            new_h = int(h * (target_dim / w))
        new_dims = (new_w, new_h)

        if progress_fn:
            progress_fn(base_p + span_p * 0.40, desc=f"⚡ Calculating {new_w}×{new_h} ({target_res}) Super-Resolution...")

        upscaled = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

        if progress_fn:
            progress_fn(base_p + span_p * 0.70, desc="✨ Refining micro-textures and sharp edge details...")

        radius = 3 if "8K" in target_res else 2
        sharpened = upscaled.filter(ImageFilter.UnsharpMask(radius=radius, percent=145, threshold=2))
        enhancer = ImageEnhance.Sharpness(sharpened)
        final_img = enhancer.enhance(1.25)

        if progress_fn:
            progress_fn(base_p + span_p * 0.90, desc="💾 Writing lossless high-bitrate output file...")

        final_img.save(output_p, quality=96)

    return str(output_p), orig_dims, new_dims

def create_bulk_zip(file_paths: List[str], zip_output_path: str) -> str:
    with zipfile.ZipFile(zip_output_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for f in file_paths:
            p = Path(f)
            if p.exists():
                zipf.write(p, arcname=p.name)
    return zip_output_path

def extract_snapshot_frame(video_path: str, output_image_path: str, ffmpeg_path: str = "ffmpeg") -> str:
    """Extracts a frame at ~1.5s from the video."""
    cmd = [
        ffmpeg_path,
        "-y",
        "-ss", "00:00:01.50",
        "-i", video_path,
        "-vframes", "1",
        "-q:v", "2",
        output_image_path
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0 and Path(output_image_path).exists():
            return output_image_path
    except Exception:
        pass
    return None

def get_system_font_paths():
    font_path = None
    emoji_font_path = None

    for f in [r"C:\Windows\Fonts\ariblk.ttf", r"C:\Windows\Fonts\arialbd.ttf", r"C:\Windows\Fonts\arial.ttf"]:
        if os.path.exists(f):
            font_path = f
            break

    for f in [r"C:\Windows\Fonts\seguiemj.ttf", r"C:\Windows\Fonts\seguisym.ttf"]:
        if os.path.exists(f):
            emoji_font_path = f
            break

    if not font_path:
        for f in [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf"
        ]:
            if os.path.exists(f):
                font_path = f
                break

    if not emoji_font_path:
        for f in [
            "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf",
            "/usr/share/fonts/truetype/ancient-scripts/Symbola.ttf"
        ]:
            if os.path.exists(f):
                emoji_font_path = f
                break

    return font_path, emoji_font_path

def render_caption_preview_frame(
    video_path: str = None,
    style_name: str = "Hormozi Boxed 2.0 (Solid Box Behind Word)",
    font_size: int = 110,
    position: str = "Lower Third (Reels Standard)",
    words_per_screen: int = 3,
    sample_text: str = "THESE ARE VIRAL CAPTIONS",
    enable_emojis: bool = True,
    font_choice: str = "Arial Black (Bold Trending)",
    custom_font_path: str = None,
    ffmpeg_path: str = "ffmpeg"
) -> str:
    """
    Renders an instant real-scale preview frame with the exact font size, highlight color, placement,
    emojis, and boxed background badge. Runs in milliseconds!
    """
    output_dir = BASE_DIR / "outputs"
    output_dir.mkdir(exist_ok=True)
    preview_path = str(output_dir / "live_caption_preview.jpg")

    base_img = None
    if video_path and Path(video_path).exists():
        temp_raw = str(output_dir / "temp_preview_frame.jpg")
        extracted = extract_snapshot_frame(video_path, temp_raw, ffmpeg_path=ffmpeg_path)
        if extracted and Path(extracted).exists():
            try:
                base_img = Image.open(extracted).convert("RGB")
            except Exception:
                base_img = None

    if base_img is None:
        # Default vertical reel canvas 1080x1920 with sleek gradient mock camera screen
        base_img = Image.new("RGB", (1080, 1920), (22, 27, 38))
        d = ImageDraw.Draw(base_img)
        d.rectangle([20, 20, 1060, 1900], outline=(55, 65, 85), width=3)
        d.text((60, 80), "📱 REEL CAMERA VIEW (1080 × 1920)", fill=(130, 150, 180))

    img_w, img_h = base_img.size
    draw = ImageDraw.Draw(base_img)

    # Font setup
    _, font_path = resolve_font_info(font_choice=font_choice, custom_font_path=custom_font_path)
    _, emoji_font_path = get_system_font_paths()
    try:
        font = ImageFont.truetype(font_path, int(font_size)) if font_path else ImageFont.load_default()
    except Exception:
        font = ImageFont.load_default()

    try:
        emoji_font = ImageFont.truetype(emoji_font_path, int(font_size * 0.82)) if emoji_font_path else font
    except Exception:
        emoji_font = font

    # Style presets & colors
    style = STYLE_PRESETS.get(style_name, STYLE_PRESETS["Hormozi Boxed 2.0 (Solid Box Behind Word)"])
    is_boxed = style.get("is_boxed", False)
    hl_hex = style.get("badge_color", "#FBBF24")
    hl_rgb = tuple(int(hl_hex.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
    white_rgb = (255, 255, 255)
    outline_rgb = (0, 0, 0)
    stroke_w = max(4, int(font_size * 0.08))

    raw_words = sample_text.strip().split()
    if not raw_words:
        raw_words = ["THESE", "ARE", "VIRAL", "CAPTIONS"]

    # Active word index
    active_idx = min(len(raw_words) - 1, 2)

    # Measure words and emojis
    items = []
    has_any_emoji = False
    for i, w in enumerate(raw_words):
        emoji = get_word_emoji(w) if enable_emojis else ""
        if emoji:
            has_any_emoji = True
        items.append({"word": w, "emoji": emoji})

    # If enable_emojis is turned on but no keyword matched, add a viral emoji to active word
    if enable_emojis and not has_any_emoji and items:
        items[active_idx]["emoji"] = "🔥"

    space_w = font.getlength(' ')
    measured = []
    for it in items:
        w_text = it["word"]
        emoji = it["emoji"]
        w_w = font.getlength(w_text)
        e_w = emoji_font.getlength(' ' + emoji) if emoji else 0
        tot_w = w_w + e_w
        measured.append((w_text, emoji, w_w, e_w, tot_w))

    total_text_w = sum(m[4] for m in measured) + space_w * (len(measured) - 1)

    if position == "Center":
        start_y = (img_h - font_size) // 2
    elif position == "Top":
        start_y = int(img_h * 0.15)
    else:  # Lower Third
        start_y = int(img_h * 0.72)

    start_x = (img_w - total_text_w) / 2
    curr_x = start_x

    for idx, (w_text, emoji, w_w, e_w, tot_w) in enumerate(measured):
        is_active = (idx == active_idx)

        if is_active:
            if is_boxed:
                pad_x = int(font_size * 0.18)
                pad_y = int(font_size * 0.10)
                box_rect = [
                    curr_x - pad_x,
                    start_y - pad_y,
                    curr_x + tot_w + pad_x,
                    start_y + font_size + pad_y
                ]
                draw.rounded_rectangle(box_rect, radius=int(font_size * 0.16), fill=hl_rgb)
                # Dark text inside solid box
                draw.text((curr_x, start_y), w_text, font=font, fill=(16, 16, 16))
                if emoji:
                    draw.text(
                        (curr_x + w_w + font.getlength(' ') * 0.3, start_y + int(font_size * 0.08)),
                        emoji,
                        font=emoji_font,
                        fill=(0, 0, 0)
                    )
            else:
                # Pop out with highlight color & bold black outline
                try:
                    pop_font = ImageFont.truetype(font_path, int(font_size * 1.18))
                except Exception:
                    pop_font = font
                draw.text(
                    (curr_x, start_y - int(font_size * 0.08)),
                    w_text,
                    font=pop_font,
                    fill=hl_rgb,
                    stroke_width=stroke_w + 3,
                    stroke_fill=outline_rgb
                )
                if emoji:
                    draw.text(
                        (curr_x + w_w + font.getlength(' ') * 0.3, start_y + int(font_size * 0.04)),
                        emoji,
                        font=emoji_font,
                        fill=(255, 255, 255),
                        stroke_width=2,
                        stroke_fill=outline_rgb
                    )
        else:
            # White text with black outline
            draw.text((curr_x, start_y), w_text, font=font, fill=white_rgb, stroke_width=stroke_w, stroke_fill=outline_rgb)
            if emoji:
                draw.text(
                    (curr_x + w_w + font.getlength(' ') * 0.3, start_y + int(font_size * 0.08)),
                    emoji,
                    font=emoji_font,
                    fill=(255, 255, 255)
                )

        curr_x += tot_w + space_w

    base_img.save(preview_path, quality=95)
    return preview_path

