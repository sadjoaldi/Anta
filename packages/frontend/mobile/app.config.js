/**
 * Expo App Configuration
 * Uses environment variables for sensitive data
 */

module.exports = {
  expo: {
    name: 'ANTA',
    slug: 'anta',
    scheme: 'anta',
    version: '0.1.0',
    orientation: 'portrait',
    android: {
      package: 'gn.anta.app',
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'gn.anta.app',
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
    web: {
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'ANTA a besoin de votre position pour trouver des chauffeurs près de vous.',
        },
      ],
    ],
    extra: {
      router: {},
      eas: {
        projectId: 'e3d9e688-da20-4711-9f9c-2e4813b13218',
      },
    },
    owner: 'sadjoaldi',
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      url: 'https://u.expo.dev/e3d9e688-da20-4711-9f9c-2e4813b13218',
    },
  },
};
