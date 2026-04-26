/**
 * Tab Layout - AttendX Dark Pro Theme
 * Tab Bar with active dot indicator and role-based navigation
 */
import { Tabs, Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View, StyleSheet, Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';

// Theme colors for AttendX Dark Pro
const theme = {
  background: '#0A0D14',
  surface: '#0F1320',
  card: '#141828',
  elevated: '#1A2035',
  primary: '#4F6EF7',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  textPrimary: '#F0F2FF',
  textSecondary: '#C0C5E0',
  border: '#1E2235',
  borderLight: '#252B42',
};

export default function TabLayout() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const isTeacher = user?.role === 'TEACHER';
  const accentColor = isTeacher ? theme.primary : theme.success;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: accentColor,
        tabBarInactiveTintColor: theme.textSecondary,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          marginHorizontal: 12,
          marginBottom: Platform.OS === 'ios' ? 8 : 10,
          borderRadius: 22,
          height: Platform.OS === 'ios' ? 88 : 72,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 24,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
        headerStyle: {
          backgroundColor: theme.background,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          letterSpacing: -0.5,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <IconSymbol size={24} name="house.fill" color={color} />
              {focused && <View style={[styles.activeDot, { backgroundColor: accentColor }]} />}
            </View>
          ),
          headerTitle: isTeacher ? 'Teacher Dashboard' : 'Student Dashboard',
          headerTransparent: false,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: isTeacher ? 'QR Code' : 'Scan',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <IconSymbol size={24} name="qrcode.viewfinder" color={color} />
              {focused && <View style={[styles.activeDot, { backgroundColor: accentColor }]} />}
            </View>
          ),
          headerTitle: isTeacher ? 'Display QR Code' : 'Scan QR Code',
        }}
      />
      <Tabs.Screen
        name="subjects"
        options={{
          title: 'Subjects',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <IconSymbol size={24} name="books.vertical.fill" color={color} />
              {focused && <View style={[styles.activeDot, { backgroundColor: accentColor }]} />}
            </View>
          ),
          headerTitle: isTeacher ? 'My Subjects' : 'Enrolled Subjects',
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: isTeacher ? 'Sessions' : 'Attendance',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <IconSymbol size={24} name="list.clipboard" color={color} />
              {focused && <View style={[styles.activeDot, { backgroundColor: accentColor }]} />}
            </View>
          ),
          headerTitle: isTeacher ? 'Attendance Sessions' : 'My Attendance',
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          href: null, // Hide from tab bar - access via Quick Actions in dashboard
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <IconSymbol size={24} name="person.fill" color={color} />
              {focused && <View style={[styles.activeDot, { backgroundColor: accentColor }]} />}
            </View>
          ),
          headerTitle: 'My Profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.primary,
  },
});
