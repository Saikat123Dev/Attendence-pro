import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

export default function RootIndex() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
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

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
