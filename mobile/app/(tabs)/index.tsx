/**
 * Home Screen - AttendX Dark Pro Theme
 * Role-Based Dashboard with Teacher (Blue) and Student (Green) themes
 */
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { Card, Badge, Avatar, Loading, EmptyState } from '@/components/ui';
import { SessionCard } from '@/components/attendance/session-card';
import { colors, spacing, fontSize, borderRadius, shadows } from '@/constants/theme';
import { StudentProfile, TeacherProfile, Subject } from '@/types';

// AttendX Dark Pro Theme Colors
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Get time-based greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);

  const isTeacher = user?.role === 'TEACHER';
  const profile = isTeacher
    ? (user?.profile as TeacherProfile)
    : (user?.profile as StudentProfile);

  // Role-based accent colors
  const accentColor = isTeacher ? theme.primary : theme.success;
  const accentGradient = isTeacher
    ? ['#4F6EF7', '#2D7DD2']
    : ['#10B981', '#059669'];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      if (isTeacher) {
        const [sessionsRes, overviewRes] = await Promise.all([
          apiService.getActiveSessions(),
          apiService.getAnalyticsOverview(),
        ]);
        setActiveSessions(sessionsRes.sessions || []);
        setOverview(overviewRes);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  // Teacher Dashboard
  if (isTeacher) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={accentColor}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header with Gradient */}
        <LinearGradient
          colors={accentGradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroHeader}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroLeft}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.heroName}>{profile?.name || 'Teacher'}</Text>
              <View style={styles.heroBadge}>
                <Badge text="TEACHER" variant="light" size="md" />
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.8}>
              <View style={styles.avatarWrapper}>
                <Avatar name={profile?.name || user?.email || 'T'} size="lg" />
                <View style={[styles.statusIndicator, { backgroundColor: theme.success }]} />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>{activeSessions.length}</Text>
              <Text style={styles.heroStatLabel}>Active Sessions</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>{overview?.todaySessions || 0}</Text>
              <Text style={styles.heroStatLabel}>Today</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>{overview?.totalStudents || 0}</Text>
              <Text style={styles.heroStatLabel}>Students</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <TouchableOpacity activeOpacity={0.7} style={styles.statCardWrapper}>
              <LinearGradient
                colors={[theme.card, theme.elevated]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.statCard, { borderColor: theme.border }]}
              >
                <View style={[styles.statIconBg, { backgroundColor: theme.primary + '20' }]}>
                  <Text style={styles.statIcon}>📊</Text>
                </View>
                <Text style={styles.statNumber}>{overview?.totalSessions || 0}</Text>
                <Text style={styles.statLabel}>Total Sessions</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} style={styles.statCardWrapper}>
              <LinearGradient
                colors={[theme.card, theme.elevated]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.statCard, { borderColor: theme.border }]}
              >
                <View style={[styles.statIconBg, { backgroundColor: theme.success + '20' }]}>
                  <Text style={styles.statIcon}>📅</Text>
                </View>
                <Text style={[styles.statNumber, { color: theme.success }]}>
                  {overview?.todaySessions || 0}
                </Text>
                <Text style={styles.statLabel}>Today</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} style={styles.statCardWrapper}>
              <LinearGradient
                colors={[theme.card, theme.elevated]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.statCard, { borderColor: theme.border }]}
              >
                <View style={[styles.statIconBg, { backgroundColor: '#9333EA' + '20' }]}>
                  <Text style={styles.statIcon}>👥</Text>
                </View>
                <Text style={[styles.statNumber, { color: '#A855F7' }]}>
                  {overview?.totalStudents || 0}
                </Text>
                <Text style={styles.statLabel}>Students</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} style={styles.statCardWrapper}>
              <LinearGradient
                colors={[theme.card, theme.elevated]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.statCard, { borderColor: theme.border }]}
              >
                <View style={[styles.statIconBg, { backgroundColor: theme.warning + '20' }]}>
                  <Text style={styles.statIcon}>✓</Text>
                </View>
                <Text style={[styles.statNumber, { color: theme.warning }]}>
                  {overview?.todayAttendanceMarked || 0}
                </Text>
                <Text style={styles.statLabel}>Marked</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Sessions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Sessions</Text>
            <Pressable onPress={() => router.push('/(tabs)/scan')}>
              <Text style={styles.seeAll}>See All →</Text>
            </Pressable>
          </View>

          {activeSessions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <EmptyState
                title="No active sessions"
                message="Start a new attendance session from the Scan tab"
                icon="📭"
              />
            </Card>
          ) : (
            activeSessions.map((session) => (
              <SessionCard
                key={session._id}
                subjectName={(session.subjectId as any)?.name || 'Unknown'}
                subjectCode={(session.subjectId as any)?.code}
                status={session.status}
                date={new Date(session.startedAt).toLocaleTimeString()}
                onPress={() => router.push('/(tabs)/scan')}
              />
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionCardPressed,
              ]}
              onPress={() => router.push('/(tabs)/scan')}
            >
              <LinearGradient
                colors={[theme.primary + '20', theme.primary + '10']}
                style={styles.actionIcon}
              >
                <Text style={styles.actionIconText}>▶</Text>
              </LinearGradient>
              <Text style={styles.actionLabel}>Start Session</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionCardPressed,
              ]}
              onPress={() => router.push('/(tabs)/attendance')}
            >
              <LinearGradient
                colors={[theme.success + '20', theme.success + '10']}
                style={styles.actionIcon}
              >
                <Text style={styles.actionIconText}>📈</Text>
              </LinearGradient>
              <Text style={styles.actionLabel}>Analytics</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionCardPressed,
              ]}
              onPress={() => router.push('/(tabs)/subjects')}
            >
              <LinearGradient
                colors={[theme.warning + '20', theme.warning + '10']}
                style={styles.actionIcon}
              >
                <Text style={styles.actionIconText}>⚙</Text>
              </LinearGradient>
              <Text style={styles.actionLabel}>Manage</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionCardPressed,
              ]}
              onPress={() => router.push('/(tabs)/students')}
            >
              <LinearGradient
                colors={['#9333EA20', '#9333EA10']}
                style={styles.actionIcon}
              >
                <Text style={styles.actionIconText}>👥</Text>
              </LinearGradient>
              <Text style={styles.actionLabel}>Students</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Student Dashboard
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={accentColor}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Header with Green Gradient */}
      <LinearGradient
        colors={accentGradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroHeader}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroLeft}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.heroName}>{profile?.name || 'Student'}</Text>
            <View style={styles.heroBadge}>
              <Badge text="STUDENT" variant="light" size="md" />
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.8}>
            <View style={styles.avatarWrapper}>
              <Avatar name={profile?.name || user?.email || 'S'} size="lg" />
              <View style={[styles.statusIndicator, { backgroundColor: theme.success }]} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.heroSubtext}>
          <Text style={styles.heroSubtextText}>
            {(profile as StudentProfile)?.branch || 'University'} • Semester {(profile as StudentProfile)?.semester || 'N/A'}
          </Text>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.actionCardPressed,
            ]}
            onPress={() => router.push('/(tabs)/scan')}
          >
            <LinearGradient
              colors={[theme.primary + '20', theme.primary + '10']}
              style={styles.actionIcon}
            >
              <Text style={styles.actionIconText}>📷</Text>
            </LinearGradient>
            <Text style={styles.actionLabel}>Scan QR</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.actionCardPressed,
            ]}
            onPress={() => router.push('/(tabs)/attendance')}
          >
            <LinearGradient
              colors={[theme.success + '20', theme.success + '10']}
              style={styles.actionIcon}
            >
              <Text style={styles.actionIconText}>📋</Text>
            </LinearGradient>
            <Text style={styles.actionLabel}>Attendance</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.actionCardPressed,
            ]}
          >
            <LinearGradient
              colors={[theme.warning + '20', theme.warning + '10']}
              style={styles.actionIcon}
            >
              <Text style={styles.actionIconText}>📚</Text>
            </LinearGradient>
            <Text style={styles.actionLabel}>Subjects</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.actionCardPressed,
            ]}
          >
            <LinearGradient
              colors={['#9333EA20', '#9333EA10']}
              style={styles.actionIcon}
            >
              <Text style={styles.actionIconText}>📊</Text>
            </LinearGradient>
            <Text style={styles.actionLabel}>Reports</Text>
          </Pressable>
        </View>
      </View>

      {/* Student Info Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Details</Text>
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Text style={styles.infoLabel}>Roll Number</Text>
            </View>
            <Text style={styles.infoValue}>{(profile as StudentProfile)?.rollNumber || 'N/A'}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <View style={styles.infoLabelContainer}>
              <Text style={styles.infoLabel}>Branch</Text>
            </View>
            <Text style={styles.infoValue}>{(profile as StudentProfile)?.branch || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Text style={styles.infoLabel}>Semester</Text>
            </View>
            <Text style={styles.infoValue}>{(profile as StudentProfile)?.semester || 'N/A'}</Text>
          </View>
        </Card>
      </View>

      {/* Enrolled Subjects */}
      {(profile as StudentProfile)?.subjects && (profile as StudentProfile)?.subjects?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enrolled Subjects</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subjectsScroll}
          >
            {(profile as StudentProfile)?.subjects?.map((subject: Subject) => (
              <LinearGradient
                key={subject._id}
                colors={[theme.card, theme.elevated]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.subjectCard}
              >
                <Text style={styles.subjectCode}>{subject.code}</Text>
                <Text style={styles.subjectName} numberOfLines={2}>{subject.name}</Text>
              </LinearGradient>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  heroHeader: {
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLeft: {
    flex: 1,
  },
  heroRight: {
    alignItems: 'flex-end',
  },
  avatarWrapper: {
    position: 'relative',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.primary,
  },
  greeting: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 2,
  },
  heroName: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
  },
  heroBadge: {
    marginTop: spacing.sm,
  },
  heroSubtext: {
    marginTop: spacing.md,
  },
  heroSubtextText: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  heroStatsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: spacing.md,
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatNumber: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.white,
  },
  heroStatLabel: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: spacing.sm,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: theme.textPrimary,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: fontSize.sm,
    color: theme.primary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCardWrapper: {
    width: '48%',
  },
  statCard: {
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statIcon: {
    fontSize: 18,
  },
  statNumber: {
    fontSize: fontSize.xxxl,
    fontWeight: '800',
    color: theme.textPrimary,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: theme.textSecondary,
    marginTop: spacing.xs,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionCard: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: theme.surface,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  actionCardPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actionIconText: {
    fontSize: 20,
  },
  actionLabel: {
    fontSize: fontSize.xs,
    color: theme.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  infoCard: {
    padding: 0,
    overflow: 'hidden',
    backgroundColor: theme.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  infoRowBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  infoLabelContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: fontSize.md,
    color: theme.textSecondary,
  },
  infoValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  subjectsScroll: {
    paddingVertical: spacing.xs,
  },
  subjectCard: {
    alignItems: 'center',
    padding: spacing.md,
    marginRight: spacing.sm,
    minWidth: 110,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  subjectCode: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: theme.success,
    letterSpacing: -0.5,
  },
  subjectName: {
    fontSize: fontSize.sm,
    color: theme.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
