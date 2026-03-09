import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.73a0606f8dbe4b3e932383262df24390',
  appName: 'kusadalocalgovernment',
  webDir: 'dist',
  server: {
    url: 'https://73a0606f-8dbe-4b3e-9323-83262df24390.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    Network: {
      // Network status is available by default
    },
    Preferences: {
      // Local key-value storage available by default
    },
  },
};

export default config;
