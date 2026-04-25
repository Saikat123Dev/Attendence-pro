import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';

import { AuthProvider } from '@/context/AuthContext';
import { updateService } from '@/services/updateService';

export default function RootLayout() {
  useEffect(() => {
    updateService.initialize();
    updateService.setupAutoUpdate();

    return () => updateService.cleanup();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={DarkTheme}>
        <AuthProvider>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="light" />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
