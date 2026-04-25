import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

export default function AuthLayout() {
  const { user, isLoading } = useAuth();

  // Redirect to complete-profile if authenticated but no role
  useEffect(() => {
    if (!isLoading && user && !user.role) {
      router.replace('/(auth)/complete-profile');
    }
  }, [isLoading, user]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="complete-profile" options={{ headerShown: false }} />
    </Stack>
  );
}