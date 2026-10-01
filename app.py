import os
import sys
import shutil
import tempfile
import warnings
from pathlib import Path
from PIL import Image
import gradio as gr

# Silence Windows symlink info warnings
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
warnings.filterwarnings("ignore")

from caption_engine import (
    STYLE_PRESETS,
    AVAILABLE_FONTS,
    get_video_dimensions,
    get_video_duration,
    resolve_font_info,
    transcribe_audio_whisper,
    transcribe_audio_groq,
    format_words_to_editable_text,
    parse_editable_text_to_words,
    remove_video_silences,
    generate_sfx_audio_track,
    generate_ass_subtitles,
    burn_subtitles_into_video,
    fast_lanczos_upscale_stepped,
    create_bulk_zip,
    render_caption_preview_frame
)

BASE_DIR = Path(__file__).resolve().parent

def load_env_file():
    env_file = BASE_DIR / ".env"
    if env_file.exists():
        try:
            for line in env_file.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip("'\"")
                    if k in ["GROQ_API_KEY", "QROQ_API_KEY"]:
                        os.environ["GROQ_API_KEY"] = v
                    else:
                        os.environ[k] = v
        except Exception:
            pass

load_env_file()

LOCAL_BIN = BASE_DIR / "bin"
LOCAL_FFMPEG = LOCAL_BIN / "ffmpeg.exe"

def resolve_ffmpeg_path() -> str:
    if LOCAL_FFMPEG.exists():
        return str(LOCAL_FFMPEG)
    system_ffmpeg = shutil.which("ffmpeg")
    if system_ffmpeg:
        return system_ffmpeg
    return "ffmpeg"

def handle_transcribe_for_review(video_path, whisper_model, language, groq_api_key, progress=gr.Progress()):
    if not video_path:
        raise gr.Error("Please upload a video file first!")
    ffmpeg_bin = resolve_ffmpeg_path()
    input_file = Path(video_path)
    effective_key = groq_api_key.strip() if groq_api_key and groq_api_key.strip() else os.getenv("GROQ_API_KEY", "").strip()

    if effective_key:
        progress(0.40, desc="⚡ Transcribing speech with Groq Cloud (~1s)...")
        words = transcribe_audio_groq(str(input_file), api_key=effective_key, language=language, ffmpeg_path=ffmpeg_bin)
    else:
        progress(0.40, desc=f"🎙️ Transcribing speech with Local Whisper ({whisper_model})...")
        actual_model = "base" if "base" in whisper_model else "small"
        words = transcribe_audio_whisper(str(input_file), model_size=actual_model, language=language)

    if not words:
        raise gr.Error("No clear speech detected in video! Please ensure audio is audible.")

    progress(1.0, desc="✅ Transcript loaded into editor! You can now edit words below.")
    return format_words_to_editable_text(words)

def update_live_preview(video_path, style_name, font_size, position, sample_text, enable_emojis, font_choice, custom_font_file):
    ffmpeg_bin = resolve_ffmpeg_path()
    text = sample_text.strip() if sample_text and sample_text.strip() else "THESE ARE VIRAL CAPTIONS"
    custom_font_path = custom_font_file.name if hasattr(custom_font_file, 'name') else (str(custom_font_file) if custom_font_file else None)
    return render_caption_preview_frame(
        video_path=video_path,
        style_name=style_name,
        font_size=int(font_size) if font_size else 110,
        position=position,
        sample_text=text,
        enable_emojis=enable_emojis,
        font_choice=font_choice,
        custom_font_path=custom_font_path,
        ffmpeg_path=ffmpeg_bin
    )

def process_video(
    video_path,
    style_name,
    words_per_chunk,
    caption_position,
    font_size,
    whisper_model,
    language,
    export_resolution,
    enable_emojis,
    font_choice,
    custom_font_file,
    edited_transcript_text,
    remove_silence,
    enable_sfx,
    sfx_style,
    sfx_volume,
    groq_api_key="",
    progress=gr.Progress()
):
    if not video_path:
        raise gr.Error("Please upload a video file first!")

    ffmpeg_bin = resolve_ffmpeg_path()
    output_dir = BASE_DIR / "outputs"
    output_dir.mkdir(exist_ok=True)

    input_file = Path(video_path)
    is_4k = "4K" in export_resolution
    prefix = "4k_captioned" if is_4k else "captioned"
    output_video_path = output_dir / f"{prefix}_{input_file.stem}.mp4"
    temp_ass_path = output_dir / f"temp_{input_file.stem}.ass"
    temp_sfx_path = output_dir / f"temp_sfx_{input_file.stem}.wav"

    try:
        active_video_path = str(input_file)

        # Step 1: Optional Silence Removal
        if remove_silence:
            progress(0.10, desc="✂️ Step 1/5: Cutting dead pauses (>0.45s) for snappy pacing...")
            trimmed_video = str(output_dir / f"tight_{input_file.stem}.mp4")
            active_video_path = remove_video_silences(active_video_path, trimmed_video, ffmpeg_path=ffmpeg_bin)

        progress(0.20, desc="🔍 Step 2/5: Analyzing video dimensions...")
        width, height = get_video_dimensions(active_video_path, ffmpeg_path=ffmpeg_bin)
        total_duration = get_video_duration(active_video_path, ffmpeg_path=ffmpeg_bin)

        # Step 2: Speech Transcription / Transcript
        if edited_transcript_text and edited_transcript_text.strip():
            progress(0.35, desc="📝 Step 3/5: Loading your edited word transcript...")
            words = parse_editable_text_to_words(edited_transcript_text)
            engine_name = "✍️ User-Edited Custom Transcript"
        else:
            effective_key = groq_api_key.strip() if groq_api_key and groq_api_key.strip() else os.getenv("GROQ_API_KEY", "").strip()
            if effective_key:
                progress(0.35, desc="⚡ Step 3/5: Transcribing with Groq Cloud (whisper-large-v3-turbo, ~1s)...")
                words = transcribe_audio_groq(
                    video_path=active_video_path,
                    api_key=effective_key,
                    language=language,
                    ffmpeg_path=ffmpeg_bin
                )
                engine_name = "⚡ Groq Cloud (whisper-large-v3-turbo)"
            else:
                progress(0.35, desc=f"🎙️ Step 3/5: Transcribing speech with Whisper ({whisper_model})...")
                actual_model = "base" if "base" in whisper_model else "small"
                words = transcribe_audio_whisper(
                    video_path=active_video_path,
                    model_size=actual_model,
                    language=language
                )
                engine_name = f"💻 Local Whisper ({actual_model})"

        if not words:
            raise gr.Error("No clear speech detected in the video! Please ensure audio is audible.")

        # Font resolution
        custom_font_path = custom_font_file.name if hasattr(custom_font_file, 'name') else (str(custom_font_file) if custom_font_file else None)
        ass_font, font_file_path = resolve_font_info(font_choice=font_choice, custom_font_path=custom_font_path)
        fonts_dir = str(Path(font_file_path).parent) if font_file_path else None

        progress(0.60, desc=f"🎨 Step 4/5: Generating {'4K Vector-Sharp' if is_4k else '1080p'} animated subtitles...")
        generate_ass_subtitles(
            words=words,
            output_ass_path=str(temp_ass_path),
            res_x=width,
            res_y=height,
            style_name=style_name,
            font_name=ass_font,
            font_size=int(font_size),
            position=caption_position,
            words_per_chunk=int(words_per_chunk),
            is_4k=is_4k,
            enable_emojis=enable_emojis
        )

        # Step 5: Sound Effects Track (Optional)
        sfx_audio_file = None
        if enable_sfx:
            progress(0.75, desc="🔔 Step 5/5: Auto-mixing viral sound effects (Pop & Ding)...")
            sfx_audio_file = generate_sfx_audio_track(
                words=words,
                total_duration_sec=total_duration,
                output_wav_path=str(temp_sfx_path),
                sfx_style=sfx_style,
                volume=float(sfx_volume)
            )

        progress(0.85, desc=f"⚡ Burning captions into video {'with 4K Lanczos' if is_4k else ''}...")
        burn_subtitles_into_video(
            video_path=active_video_path,
            ass_path=str(temp_ass_path),
            output_video_path=str(output_video_path),
            ffmpeg_path=ffmpeg_bin,
            is_4k=is_4k,
            sfx_audio_path=sfx_audio_file,
            fonts_dir=fonts_dir
        )

        if temp_ass_path.exists():
            temp_ass_path.unlink()
        if temp_sfx_path and Path(temp_sfx_path).exists():
            temp_sfx_path.unlink()

        progress(1.0, desc="🎉 Reel successfully exported!")

        full_text = " ".join([w["word"] for w in words])
        res_tag = "2160 × 3840 (4K Ultra HD)" if is_4k else f"{width} × {height} (HD)"
        summary = f"""### 🎬 Reel Export Summary
- 🚀 **Export Quality:** `{res_tag}`
- ⚡ **Transcription Engine:** `{engine_name}`
- 🔤 **Typography Font:** `{ass_font}`
- ✂️ **Silence Cuts:** `{'Enabled (Snappy fast-cut)' if remove_silence else 'Disabled'}`
- 🔔 **Viral SFX:** `{'Active (' + sfx_style + ')' if enable_sfx else 'Disabled'}`
- 📝 **Total Words Detected:** `{len(words)}`
- 🎨 **Caption Style:** `{style_name}`

**Speech Transcript:**
> *"{full_text}"*
"""
        return str(output_video_path), summary

    except Exception as e:
        if temp_ass_path.exists():
            temp_ass_path.unlink()
        if temp_sfx_path and Path(temp_sfx_path).exists():
            temp_sfx_path.unlink()
        raise gr.Error(f"Error processing video: {str(e)}")

def process_bulk_images(
    files,
    target_res,
    progress=gr.Progress()
):
    if not files:
        raise gr.Error("Please upload at least one image!")

    output_dir = BASE_DIR / "outputs"
    output_dir.mkdir(exist_ok=True)

    file_list = files if isinstance(files, list) else [files]
    total = len(file_list)
    is_8k = "8K" in target_res
    prefix = "8k" if is_8k else "4k"
    tag_label = "8K Extreme HD" if is_8k else "4K Ultra HD"

    processed_paths = []
    first_slider_pair = None
    first_stats = ""

    for idx, f in enumerate(file_list):
        base_p = idx / total
        span_p = 1.0 / total

        file_path = f.name if hasattr(f, 'name') else str(f)
        input_p = Path(file_path)
        output_path = output_dir / f"{prefix}_enhanced_{input_p.stem}.png"

        result_path, (ow, oh), (nw, nh) = fast_lanczos_upscale_stepped(
            input_p=input_p,
            output_p=output_path,
            target_res=target_res,
            progress_fn=progress,
            base_p=base_p,
            span_p=span_p
        )

        processed_paths.append(result_path)

        orig_mp = (ow * oh) / 1_000_000
        new_mp = (nw * nh) / 1_000_000
        pixel_multiplier = round(new_mp / orig_mp, 1) if orig_mp > 0 else 1

        if idx == 0:
            first_slider_pair = (str(input_p), str(output_path))
            first_stats = f"""### 🔍 Inspection Metrics ({input_p.name})
| Metric | 📸 Before (Original) | 🚀 After ({tag_label}) |
| :--- | :--- | :--- |
| **Resolution** | `{ow} × {oh} px` | **`{nw} × {nh} px`** |
| **Megapixels** | `{orig_mp:.2f} MP` | **`{new_mp:.2f} MP`** |
| **Pixel Boost** | *Baseline* | **`+{pixel_multiplier}× Detail Density`** |
"""

    zip_path = None
    if total > 1:
        progress(0.96, desc="📦 Creating Download All ZIP archive...")
        zip_file = output_dir / f"bulk_{prefix}_images.zip"
        zip_path = create_bulk_zip(processed_paths, str(zip_file))

    progress(1.0, desc="🎉 Upscaling complete!")

    summary_log = f"{first_stats}\n\n**Processed Total:** `{total} Image{'s' if total > 1 else ''}` ready!"

    return first_slider_pair, processed_paths, zip_path, summary_log

# Custom Theme
custom_theme = gr.themes.Soft(
    primary_hue="amber",
    secondary_hue="slate",
    neutral_hue="slate",
    font=[gr.themes.GoogleFont("Inter"), "ui-sans-serif", "sans-serif"]
)

custom_css = """
.gradio-container {
    max-width: 1280px !important;
    margin: auto !important;
}
.header-badge {
    background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
    color: white;
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 700;
    display: inline-block;
}
.stat-card {
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(245, 158, 11, 0.2);
    border-radius: 12px;
    padding: 16px;
}
"""

with gr.Blocks(title="Reel Creator Studio & 4K/8K Enhancer") as demo:
    gr.Markdown(
        """
        # 🎬 Reel Creator Studio & 4K/8K Enhancer
        <span class="header-badge">AI Animated Subtitles</span> &nbsp; <span class="header-badge">Instant 4K & 8K Super-Resolution</span>
        """
    )

    with gr.Tabs():
        # TAB 1: REEL CAPTIONS
        with gr.Tab("🎬 Reel Captions (Live Real-Size Preview & 4K Export)"):
            with gr.Row():
                with gr.Column(scale=5):
                    gr.Markdown("### 1. Upload Video & Customize Styling")
                    input_video = gr.Video(label="Drag & Drop Reel (Vertical 9:16)", sources=["upload"])

                    # ACCORDION 1: ✍️ Step 1: Review & Edit Transcript (Optional)
                    with gr.Accordion("✍️ Step 1: Review & Edit AI Transcript (Optional)", open=False):
                        gr.Markdown("*Generate karne se pehle speech sun kar words check karein, spelling ya emoji edit karein:*")
                        transcribe_btn = gr.Button("🎙️ Transcribe Audio & Load Into Editor", variant="secondary", size="sm")
                        words_editor = gr.Textbox(
                            label="📝 Word-by-Word Editor (Format: start - end | WORD)",
                            lines=5,
                            placeholder="Click 'Transcribe Audio' above to load words here. Edit any word or emoji, then generate!"
                        )

                    # ACCORDION 2: 🎨 Caption Styling, Emojis & Placement
                    with gr.Accordion("🎨 Caption Styling, Emojis & Placement", open=True):
                        style_dropdown = gr.Dropdown(
                            choices=list(STYLE_PRESETS.keys()),
                            value="Hormozi Boxed 2.0 (Solid Box Behind Word)",
                            label="Highlight Color Style"
                        )
                        enable_emojis = gr.Checkbox(
                            value=True,
                            label="🔥 Auto-Emojis Integration (Keywords automatically get 💰, 🔥, 🚀, 🧠, 🛑, etc.)"
                        )
                        with gr.Row():
                            position_radio = gr.Radio(
                                choices=["Lower Third (Reels Standard)", "Center", "Top"],
                                value="Lower Third (Reels Standard)",
                                label="Placement"
                            )
                            words_slider = gr.Slider(
                                minimum=1,
                                maximum=5,
                                value=3,
                                step=1,
                                label="Words Per Screen (1 = TikTok Flash Mode, 3 = Hormozi)"
                            )
                        font_size_slider = gr.Slider(
                            minimum=60,
                            maximum=180,
                            value=110,
                            step=5,
                            label="Caption Font Size (Trending Bold: 100-130)"
                        )
                        sample_text_input = gr.Textbox(
                            value="THESE ARE VIRAL CAPTIONS",
                            label="Sample Preview Text (Live Frame me yehi words dikhenge)",
                            placeholder="Type sample words..."
                        )

                    # ACCORDION 3: 🔤 Custom Fonts & Typography
                    with gr.Accordion("🔤 Typography & Custom Font Upload (.ttf / .otf)", open=False):
                        font_dropdown = gr.Dropdown(
                            choices=list(AVAILABLE_FONTS.keys()),
                            value="Arial Black (Bold Trending)",
                            label="Font Family Preset"
                        )
                        custom_font_upload = gr.File(
                            label="Upload Your Own Font File (.ttf / .otf)",
                            file_types=[".ttf", ".otf"]
                        )

                    # ACCORDION 4: ✂️ Auto-Silence Cuts
                    with gr.Accordion("✂️ Auto-Silence Cuts (Fast-Paced Talking Head)", open=False):
                        remove_silence_checkbox = gr.Checkbox(
                            value=False,
                            label="✂️ Cut Dead Silences (>0.45s Pauses for High-Retention Fast Cuts)"
                        )

                    # ACCORDION 5: 🔔 Viral Sound Effects (SFX Auto-Mix)
                    with gr.Accordion("🔔 Viral Sound Effects (Pop, Ding, Whoosh on Emojis)", open=False):
                        enable_sfx_checkbox = gr.Checkbox(
                            value=False,
                            label="🔔 Auto-Mix Viral SFX (Pop & Ding on Highlight Words / Emojis)"
                        )
                        with gr.Row():
                            sfx_style_radio = gr.Radio(
                                choices=["Dynamic Auto (Pop on words, Ding on 💰, Swoosh on 🚀)", "Pop Only", "Ding / Bell Only"],
                                value="Dynamic Auto (Pop on words, Ding on 💰, Swoosh on 🚀)",
                                label="SFX Sound Style"
                            )
                            sfx_volume_slider = gr.Slider(
                                minimum=0.1,
                                maximum=1.0,
                                value=0.6,
                                step=0.05,
                                label="SFX Volume Level"
                            )

                    # ACCORDION 6: ⚡ AI Engines & Export Resolution
                    with gr.Accordion("⚡ AI Engines & Export Resolution", open=True):
                        with gr.Row():
                            export_res_dropdown = gr.Dropdown(
                                choices=[
                                    "4K Ultra HD (2160 × 3840 - Extra Sharp Subtitles & Video)",
                                    "1080p Full HD (1080 × 1920 - Standard)"
                                ],
                                value="4K Ultra HD (2160 × 3840 - Extra Sharp Subtitles & Video)",
                                label="🚀 Export Resolution Quality"
                            )
                            model_dropdown = gr.Dropdown(
                                choices=["base (Super Fast, ~5s)", "small (Higher Accuracy, ~15s)"],
                                value="base (Super Fast, ~5s)",
                                label="Local Whisper AI Model"
                            )
                        language_dropdown = gr.Dropdown(
                            choices=["Auto-detect", "en", "ur", "hi"],
                            value="Auto-detect",
                            label="Audio Language"
                        )
                        groq_api_key_input = gr.Textbox(
                            value=os.getenv("GROQ_API_KEY", ""),
                            label="⚡ Groq API Key (Optional - Free Cloud Whisper in ~1s)",
                            placeholder="Paste gsk_... key here (Free from console.groq.com/keys) or leave blank for Local Whisper",
                            type="password"
                        )

                with gr.Column(scale=5):
                    gr.Markdown("### 2. Live Real-Size Frame Preview (Instant)")
                    preview_frame = gr.Image(
                        value="C:/Work/reel-caption-tool/outputs/live_caption_preview.jpg",
                        label="👁️ Real-Size Caption Preview (Font size ya style change karein — ye foran update hoga!)",
                        type="filepath",
                        interactive=False
                    )
                    refresh_preview_btn = gr.Button("🔄 Refresh Live Preview", size="sm", variant="secondary")

                    gr.Markdown("### 3. Generate Full Video")
                    generate_btn = gr.Button("🚀 Generate Full Reel (Poori Reel Ke Liye Banayein)", variant="primary", size="lg")

                    output_video = gr.Video(label="🎬 Final Captioned Reel (Play or Download)", autoplay=True)
                    transcript_box = gr.Markdown(label="Export Details")

            # Real-time preview event listeners (instant 8ms updates)
            preview_inputs = [
                input_video,
                style_dropdown,
                font_size_slider,
                position_radio,
                sample_text_input,
                enable_emojis,
                font_dropdown,
                custom_font_upload
            ]

            for comp in [font_size_slider, style_dropdown, position_radio, sample_text_input, enable_emojis, font_dropdown, custom_font_upload]:
                comp.change(fn=update_live_preview, inputs=preview_inputs, outputs=preview_frame)

            input_video.change(fn=update_live_preview, inputs=preview_inputs, outputs=preview_frame)
            refresh_preview_btn.click(fn=update_live_preview, inputs=preview_inputs, outputs=preview_frame)

            # Transcribe audio for review listener
            transcribe_btn.click(
                fn=handle_transcribe_for_review,
                inputs=[input_video, model_dropdown, language_dropdown, groq_api_key_input],
                outputs=words_editor
            )

            # Full video generation
            generate_btn.click(
                fn=process_video,
                inputs=[
                    input_video,
                    style_dropdown,
                    words_slider,
                    position_radio,
                    font_size_slider,
                    model_dropdown,
                    language_dropdown,
                    export_res_dropdown,
                    enable_emojis,
                    font_dropdown,
                    custom_font_upload,
                    words_editor,
                    remove_silence_checkbox,
                    enable_sfx_checkbox,
                    sfx_style_radio,
                    sfx_volume_slider,
                    groq_api_key_input
                ],
                outputs=[output_video, transcript_box]
            )

        # TAB 2: 4K / 8K BULK IMAGE ENHANCER
        with gr.Tab("🖼️ 4K / 8K Bulk Image Enhancer"):
            with gr.Row():
                with gr.Column(scale=5):
                    gr.Markdown("### 1. Upload Images (Single or Bulk / Multiple)")
                    image_files = gr.File(
                        file_count="multiple",
                        file_types=["image"],
                        label="📁 Select or Drag & Drop Photos / Thumbnails (Bulk Supported)"
                    )

                    res_choice = gr.Radio(
                        choices=[
                            "4K Ultra HD (3840px - Super Fast ~3s)",
                            "8K Extreme HD (7680px - Maximum Detail ~6s)"
                        ],
                        value="4K Ultra HD (3840px - Super Fast ~3s)",
                        label="🎯 Target Output Resolution"
                    )

                    bulk_upscale_btn = gr.Button("✨ Upscale to 4K / 8K (Real-Time)", variant="primary", size="lg")

                with gr.Column(scale=5):
                    gr.Markdown("### 2. Before vs After Comparison & Results")
                    before_after_slider = gr.ImageSlider(
                        label="🔍 Interactive Before (Left) vs After (Right) — Drag slider to inspect detail!",
                        type="filepath",
                        show_label=True
                    )
                    comparison_metrics = gr.Markdown(label="Resolution Difference")

            with gr.Row():
                with gr.Column():
                    gr.Markdown("### 3. All Processed Images & Bulk Download")
                    output_gallery = gr.Gallery(
                        label="🖼️ Enhanced Images Gallery",
                        columns=3,
                        height="auto",
                        show_label=True
                    )
                    output_zip = gr.File(label="📦 Download All Processed Images as ZIP (Bulk)")

            bulk_upscale_btn.click(
                fn=process_bulk_images,
                inputs=[image_files, res_choice],
                outputs=[before_after_slider, output_gallery, output_zip, comparison_metrics]
            )

if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        inbrowser=True,
        theme=custom_theme,
        css=custom_css
    )
