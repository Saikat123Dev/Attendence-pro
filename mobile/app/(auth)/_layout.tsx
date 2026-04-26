import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const THEME = {
  bg: '#0A0D14',
};

export default function AuthLayout() {
  const { user, isLoading } = useAuth();

  // Redirect authenticated users away from auth stack
  useEffect(() => {
    if (!isLoading && user?.role) {
      router.replace('/(tabs)');
      return;
    }
    if (!isLoading && user && !user.role) {
      router.replace('/(auth)/complete-profile');
    }
  }, [isLoading, user]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: THEME.bg },
        animation: 'fade',
        animationDuration: 250,
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          headerShown: false,
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="complete-profile"
        options={{
          headerShown: false,
          animation: 'fade',
        }}
      />
    </Stack>
  );
}
