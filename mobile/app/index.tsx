import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Loading } from '@/components/ui';

export default function RootIndex() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading message="Restoring your session..." />;
  }

  if (isAuthenticated && user) {
    // Check if user has completed profile (has a role)
    if (!user.role) {
      // User is authenticated but hasn't completed profile
      return <Redirect href="/(auth)/complete-profile" />;
    }
    // User has a role, go to main app
    return <Redirect href="/(tabs)" />;
  }

  // Not authenticated, go to login
  return <Redirect href="/(auth)/login" />;
}

