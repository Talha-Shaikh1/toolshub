// Fast In-Browser Audio Extraction & Direct Groq Cloud Transcription
// Extracts 16kHz mono PCM WAV in ~200ms directly in browser memory
// Eliminates sending 50MB-100MB video across the ocean!

export async function extractAudioBlob(file: File): Promise<Blob> {
  const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtxClass) {
    throw new Error("Web Audio API not supported in this browser");
  }

  const audioCtx = new AudioCtxClass();
  try {
    const arrayBuffer = await file.arrayBuffer();
    const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const targetSampleRate = 16000;
    const duration = decodedBuffer.duration;
    const targetLength = Math.ceil(duration * targetSampleRate);

    // Resample to 16kHz mono using high-performance OfflineAudioContext
    const offlineCtx = new OfflineAudioContext(1, targetLength, targetSampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = decodedBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    const renderedBuffer = await offlineCtx.startRendering();
    return audioBufferToWavBlob(renderedBuffer);
  } finally {
    if (audioCtx.state !== "closed") {
      audioCtx.close().catch(() => {});
    }
  }
}

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = 1;
  const sampleRate = buffer.sampleRate;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const channelData = buffer.getChannelData(0);
  const dataLength = channelData.length * bytesPerSample;
  const bufferLength = 44 + dataLength;

  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // WAV header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // PCM Chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);

  // Write 16-bit PCM samples
  let offset = 44;
  for (let i = 0; i < channelData.length; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export interface TranscribedWord {
  word: string;
  start: number;
  end: number;
  probability?: number;
}

export async function transcribeWithGroqDirect(
  audioBlob: Blob,
  apiKey: string,
  language?: string
): Promise<{ words: TranscribedWord[]; text: string }> {
  const cleanKey = (apiKey || "").trim();
  if (!cleanKey) {
    throw new Error("Missing Groq API key");
  }

  const formData = new FormData();
  formData.append("file", audioBlob, "extracted_audio.wav");
  formData.append("model", "whisper-large-v3-turbo");
  formData.append("response_format", "verbose_json");
  formData.append("timestamp_granularities[]", "word");

  if (language && language !== "Auto-detect") {
    formData.append("language", language);
  }

  const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cleanKey}`
    },
    body: formData
  });

  if (!response.ok) {
    const errText = await response.text();
    let msg = errText;
    try {
      const parsed = JSON.parse(errText);
      if (parsed?.error?.message) {
        msg = parsed.error.message;
      }
    } catch {}
    throw new Error(`Groq API Error (${response.status}): ${msg}`);
  }

  const data = await response.json();
  const rawWords: Array<{ word?: string; start?: number; end?: number; probability?: number }> = data.words || [];

  if ((!rawWords || rawWords.length === 0) && Array.isArray(data.segments)) {
    for (const seg of data.segments) {
      if (Array.isArray(seg.words)) {
        rawWords.push(...seg.words);
      }
    }
  }

  const words: TranscribedWord[] = rawWords
    .map((w) => ({
      word: (w.word || "").trim().toUpperCase(),
      start: Number(w.start ?? 0),
      end: Number(w.end ?? 0),
      probability: typeof w.probability === "number" ? w.probability : 1.0
    }))
    .filter((w) => w.word.length > 0);

  return {
    words,
    text: data.text || ""
  };
}

export function formatWordsToEditableText(words: TranscribedWord[]): string {
  return words
    .map((w) => `${Number(w.start).toFixed(2)} - ${Number(w.end).toFixed(2)} | ${w.word}`)
    .join("\n");
}
