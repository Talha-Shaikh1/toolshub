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

def get_video_dimensions(video_path: str, ffmpeg_path: str = "ffmpeg") -> Tuple[int, int]:
    ffprobe_path = ffmpeg_path.replace("ffmpeg.exe", "ffprobe.exe")
    if not Path(ffprobe_path).exists():
        ffprobe_path = "ffprobe"
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

def transcribe_audio_whisper(
    video_path: str,
    model_size: str = "base",
    language: str = None
) -> List[Dict[str, Any]]:
    from faster_whisper import WhisperModel

    model = WhisperModel(model_size, device="cpu", compute_type="int8")

    segments, info = model.transcribe(
        video_path,
        word_timestamps=True,
        language=language if language and language != "Auto-detect" else None,
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=400)
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
    ffprobe_path = ffmpeg_path.replace("ffmpeg.exe", "ffprobe.exe")
    if not Path(ffprobe_path).exists():
        ffprobe_path = "ffprobe"
    cmd = [
        ffprobe_path,
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        video_path
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return float(res.stdout.strip())
    except Exception:
        return 30.0

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

def burn_subtitles_into_video(
    video_path: str,
    ass_path: str,
    output_video_path: str,
    ffmpeg_path: str = "ffmpeg",
    is_4k: bool = False,
    sfx_audio_path: str = None,
    fonts_dir: str = None
) -> bool:
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

    if is_4k:
        filter_str = f"scale=2160:3840:flags=lanczos,unsharp=5:5:0.8:5:5:0.0,{sub_filter}"
        crf = "18"
    else:
        filter_str = sub_filter
        crf = "22"

    if sfx_audio_path and Path(sfx_audio_path).exists():
        complex_filter = f"[0:v]{filter_str}[vout];[0:a][1:a]amix=inputs=2:duration=first:dropout_transition=0:weights=1.0 0.8[aout]"
        cmd = [
            ffmpeg_path,
            "-y",
            "-i", video_path,
            "-i", sfx_audio_path,
            "-filter_complex", complex_filter,
            "-map", "[vout]",
            "-map", "[aout]",
            "-c:v", "libx264",
            "-preset", "ultrafast",
            "-crf", crf,
            "-c:a", "aac",
            "-b:a", "192k",
            output_video_path
        ]
    else:
        cmd = [
            ffmpeg_path,
            "-y",
            "-i", video_path,
            "-vf", filter_str,
            "-c:v", "libx264",
            "-preset", "ultrafast",
            "-crf", crf,
            "-c:a", "copy",
            output_video_path
        ]

    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"FFmpeg error: {res.stderr}")
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

