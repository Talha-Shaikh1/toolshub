import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.toolshub.flowcreator',
  appName: 'FlowCreator Studio Pro',
  webDir: 'out',
  server: {
    // Allows loading live Next.js Studio with cloud & local sync
    url: 'https://01talha-arqa-chatbot.hf.space/studio',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
