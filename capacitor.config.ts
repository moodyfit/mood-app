import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moodfit.app',
  appName: 'MOODFIT',
  webDir: 'out',
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#FAFAF8',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#FAFAF8',
    },
  },
};

export default config;
