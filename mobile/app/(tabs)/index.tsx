/**
 * Home Screen - AttendX Design System
 * Role-Based Dashboard with Teacher (Blue) and Student (Green) themes
 */
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { Badge, Avatar, Loading } from '@/components/ui';
import { colors, spacing, fontSize, borderRadius } from '@/src/constants/theme';
import { StudentProfile, TeacherProfile } from '@/types';

const theme = {
  background: colors.bg.base,
  surface: colors.bg.surface,
  card: colors.bg.card,
  elevated: colors.bg.elevated,
  primary: colors.primary.primary,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  textPrimary: colors.text.primary,
  textSecondary: colors.text.secondary,
  border: colors.border.subtle,
  borderLight: colors.border.default,
};

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

  const accentColor = isTeacher ? theme.primary : theme.success;
  const accentGradient = isTeacher
    ? [colors.primary.primary, '#6B5BFF']
    : [colors.success, '#059669'];

  const loadData = useCallback(async () => {
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
  }, [isTeacher]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  if (isTeacher) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentColor} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
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
                <Avatar name={profile?.name || user?.email || 'T'} size="lg" type="teacher" />
                <View style={[styles.statusIndicator, { backgroundColor: theme.success }]} />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>{activeSessions.length}</Text>
              <Text style={styles.heroStatLabel}>Active</Text>
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
                <View style={[styles.statIconBg, { backgroundColor: colors.primary.primaryGlow }]}>
                  <MaterialIcons name="bar-chart" size={20} color={theme.primary} />
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
                <View style={[styles.statIconBg, { backgroundColor: colors.successMuted }]}>
                  <MaterialIcons name="today" size={20} color={theme.success} />
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
                <View style={[styles.statIconBg, { backgroundColor: 'rgba(138, 43, 226, 0.15)' }]}>
                  <MaterialIcons name="groups" size={20} color="#A855F7" />
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
                <View style={[styles.statIconBg, { backgroundColor: colors.infoMuted }]}>
                  <MaterialIcons name="check-circle" size={20} color={colors.info} />
                </View>
                <Text style={[styles.statNumber, { color: colors.info }]}>
                  {overview?.todayAttendanceMarked || 0}
                </Text>
                <Text style={styles.statLabel}>Marked Today</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Sessions Alert */}
        {activeSessions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.alertBanner}>
              <View style={styles.alertDot} />
              <Text style={styles.alertText}>
                {activeSessions.length} Active Session{activeSessions.length > 1 ? 's' : ''}
              </Text>
              <TouchableOpacity
                style={styles.alertAction}
                onPress={() => router.push('/(tabs)/scan')}
              >
                <Text style={styles.alertActionText}>View QR</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <Pressable
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
              onPress={() => router.push('/(tabs)/scan')}
            >
              <LinearGradient
                colors={[colors.primary.primary, '#6B5BFF']}
                style={styles.actionIconBg}
              >
                <MaterialIcons name="qr-code-2" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.actionText}>Start Session</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
              onPress={() => router.push('/(tabs)/subjects')}
            >
              <LinearGradient
                colors={[colors.success, '#059669']}
                style={styles.actionIconBg}
              >
                <MaterialIcons name="menu-book" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.actionText}>Subjects</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
              onPress={() => router.push('/(tabs)/attendance')}
            >
              <LinearGradient
                colors={[colors.warning, '#D97706']}
                style={styles.actionIconBg}
              >
                <MaterialIcons name="list-alt" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.actionText}>Sessions</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
              onPress={() => router.push('/(tabs)/students')}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.actionIconBg}
              >
                <MaterialIcons name="people" size={24} color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.actionText}>Students</Text>
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
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accentColor} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Header */}
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
              <Avatar name={profile?.name || user?.email || 'S'} size="lg" type="student" />
              <View style={[styles.statusIndicator, { backgroundColor: theme.success }]} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.heroStatsRow}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNumber}>{(profile as TeacherProfile)?.employeeId || 'N/A'}</Text>
            <Text style={styles.heroStatLabel}>Employee ID</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNumber}>{(profile as TeacherProfile)?.department || 'N/A'}</Text>
            <Text style={styles.heroStatLabel}>Department</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <Pressable
            style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
            onPress={() => router.push('/(tabs)/scan')}
          >
            <LinearGradient
              colors={[colors.success, '#059669']}
              style={styles.actionIconBg}
            >
              <MaterialIcons name="qr-code-scanner" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.actionText}>Scan QR</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
            onPress={() => router.push('/(tabs)/subjects')}
          >
            <LinearGradient
              colors={[colors.primary.primary, '#6B5BFF']}
              style={styles.actionIconBg}
            >
              <MaterialIcons name="menu-book" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.actionText}>Subjects</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
            onPress={() => router.push('/(tabs)/attendance')}
          >
            <LinearGradient
              colors={[colors.warning, '#D97706']}
              style={styles.actionIconBg}
            >
              <MaterialIcons name="assignment" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.actionText}>Attendance</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.actionIconBg}
            >
              <MaterialIcons name="person" size={24} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.actionText}>Profile</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  contentContainer: {
    paddingBottom: spacing.xxxl,
  },
  heroHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  heroName: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  heroBadge: {
    alignSelf: 'flex-start',
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
    borderColor: theme.background,
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: spacing.xl,
    gap: spacing.xl,
  },
  heroStat: {
    alignItems: 'flex-start',
  },
  heroStatNumber: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroStatLabel: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
    letterSpacing: 0.2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCardWrapper: {
    width: '47%',
  },
  statCard: {
    backgroundColor: theme.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    minHeight: 100,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statNumber: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: theme.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.success,
  },
  alertText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: theme.success,
    fontWeight: '600',
  },
  alertAction: {
    backgroundColor: theme.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  alertActionText: {
    fontSize: fontSize.xs,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    width: '47%',
    backgroundColor: theme.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  actionCardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85,
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionText: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    fontWeight: '600',
  },
});