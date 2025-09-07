import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'nutritrack',
  webDir: 'www/browser',
  plugins: {
    Keyboard: {
      resize: "body", // ili "none" ako želiš potpuno statičan layout
    },
  },
};

export default config;
