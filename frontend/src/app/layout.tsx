import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#090D16",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reel Studio Pro — AI Animated Subtitles (Alex Hormozi 2.0) & 4K/8K Super-Resolution",
  description:
    "Professional creator workstation for animated word-by-word subtitles, Alex Hormozi solid boxed highlights, auto-emojis, dead-silence remover, viral SFX, and 4K/8K image super-resolution. 100% Free & Open-Source.",
  keywords: [
    "Alex Hormozi subtitles",
    "Hormozi 2.0 boxed subtitles",
    "MrBeast subtitles generator",
    "AI reel caption generator",
    "word by word captions",
    "auto animated subtitles",
    "viral reel captions",
    "4K image upscaler",
    "8K image super resolution",
    "auto emoji subtitle generator",
    "submagic alternative",
    "capcut subtitle generator free",
    "instagram reels caption app",
    "tiktok auto captions",
    "silence remover video",
    "groq whisper transcription"
  ],
  authors: [{ name: "Talha Shaikh", url: "https://github.com/Talha-Shaikh1" }],
  creator: "Talha Shaikh",
  publisher: "Reel Creator Studio OS",
  metadataBase: new URL("https://reel-creator-studio.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Reel Studio Pro — AI Animated Subtitles & 4K/8K Enhancer",
    description:
      "Generate trending Alex Hormozi 2.0 boxed captions with auto-emojis, viral SFX, silence removal, and 4K/8K upscaler in seconds.",
    url: "https://reel-creator-studio.vercel.app",
    siteName: "Reel Studio Pro",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-preview.png",
        width: 1200,
        height: 630,
        alt: "Reel Studio Pro Workstation Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reel Studio Pro — AI Animated Subtitles & 4K/8K Super-Resolution",
    description:
      "Create viral Alex Hormozi 2.0 boxed subtitles, auto-emojis, and 4K/8K upscaling in your browser.",
    creator: "@talhashaikh",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
};

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://reel-creator-studio.vercel.app/#webapp",
      "name": "Reel Studio Pro",
      "url": "https://reel-creator-studio.vercel.app",
      "description":
        "Professional cloud workstation for generating trending Alex Hormozi 2.0 animated word-by-word subtitles, auto-emojis, silence cuts, and 4K/8K image super-resolution.",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "All (Web Browser, Windows, macOS, Linux, iOS, Android)",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "featureList": [
        "Alex Hormozi 2.0 Solid Boxed Background Highlights",
        "Word-by-word active karaoke synchronized pop animation",
        "Auto-Emoji keyword injection (💰, 🔥, 🚀, 🧠, 🛑)",
        "Auto-Silence and Dead Pause Cut Removers (>0.45s pauses)",
        "Viral Sound Effects auto-mix (Pop, Cash Ding, Whoosh)",
        "Groq Cloud Whisper Large-v3 Turbo (1-second transcription)",
        "4K (3840px) and 8K (7680px) Super-Resolution Image Scaling",
        "Interactive Non-Linear Timeline and Transcript Editor"
      ],
      "author": {
        "@type": "Person",
        "name": "Talha Shaikh"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://reel-creator-studio.vercel.app/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How to generate Alex Hormozi style animated subtitles for Instagram Reels and TikTok?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Upload your 9:16 vertical video into Reel Studio Pro, select the 'Hormozi Boxed 2.0' preset, toggle 'Auto-Emojis' on, and click Generate. The AI will transcribe speech in ~1 second using Whisper Large-v3 and burn solid yellow boxed background badges behind each active word."
          }
        },
        {
          "@type": "Question",
          "name": "What is the Hormozi 2.0 Boxed Subtitle style?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Hormozi 2.0 is the trending subtitle style where the currently spoken word is highlighted inside a high-contrast solid yellow or green rounded box badge with dark text, while non-active words remain white with black borders."
          }
        },
        {
          "@type": "Question",
          "name": "How does the 4K and 8K image enhancer work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The tool uses high-order Lanczos super-resolution and unsharp edge micro-texture refinement to upscale photos, video frame captures, and thumbnails up to 3840px (4K) or 7680px (8K) with zero cloud GPU timeouts."
          }
        },
        {
          "@type": "Question",
          "name": "Is Reel Studio Pro free to use?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Reel Studio Pro is completely free and open-source, powered by Hugging Face Spaces and Groq Cloud Whisper."
          }
        }
      ]
    },
    {
      "@type": "HowTo",
      "name": "How to create viral captioned reels in 3 steps",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Upload Reel",
          "text": "Drop your vertical 9:16 video into the studio monitor canvas."
        },
        {
          "@type": "HowToStep",
          "name": "Customize Style & Emojis",
          "text": "Select Hormozi Boxed 2.0 or MrBeast Green style, toggle Auto-Emojis, and adjust font size."
        },
        {
          "@type": "HowToStep",
          "name": "Export 4K Video",
          "text": "Click 'Generate Full Reel' to burn subtitles and download your high-retention video."
        }
      ]
    }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#090D16] text-slate-100">
        <Toaster richColors position="top-right" theme="dark" closeButton />
        {children}
      </body>
    </html>
  );
}
