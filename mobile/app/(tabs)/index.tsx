/**
 * Beautified Home Screen - Teacher Dashboard
 */
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { Card, Badge, Avatar, Loading, EmptyState } from '@/components/ui';
import { SessionCard } from '@/components/attendance';
import { colors, spacing, fontSize, borderRadius, shadows } from '@/constants/theme';
import { StudentProfile, TeacherProfile, Subject } from '@/types';

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
        setActiveSessions(sessionsRes.sessions);
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{profile?.name || 'User'}</Text>
          </View>
          <Avatar
            name={profile?.name || user?.email || 'U'}
            size="lg"
          />
        </View>
        <Badge
          text={user?.role || 'USER'}
          variant={user?.role === 'TEACHER' ? 'primary' : 'info'}
        />
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{overview?.totalSessions || 0}</Text>
          <Text style={styles.statLabel}>Total Sessions</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.success }]}>
            {overview?.todaySessions || 0}
          </Text>
          <Text style={styles.statLabel}>Today</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>
            {overview?.totalStudents || 0}
          </Text>
          <Text style={styles.statLabel}>Students</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>
            {overview?.todayAttendanceMarked || 0}
          </Text>
          <Text style={styles.statLabel}>Marked</Text>
        </Card>
      </View>

      {/* Active Sessions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Sessions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {activeSessions.length === 0 ? (
          <Card>
            <EmptyState
              title="No active sessions"
              message="Start a new attendance session from the Scan tab"
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
              onPress={() => {}}
            />
          ))
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: colors.primary + '15' }]}>
              <Text style={styles.actionIconText}>📷</Text>
            </View>
            <Text style={styles.actionLabel}>Scan QR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: colors.success + '15' }]}>
              <Text style={styles.actionIconText}>📊</Text>
            </View>
            <Text style={styles.actionLabel}>View Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: colors.warning + '15' }]}>
              <Text style={styles.actionIconText}>👥</Text>
            </View>
            <Text style={styles.actionLabel}>Students</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: colors.info + '15' }]}>
              <Text style={styles.actionIconText}>📚</Text>
            </View>
            <Text style={styles.actionLabel}>Subjects</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    ...shadows.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  greeting: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.white,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statNumber: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
    fontWeight: '600',
    color: colors.text,
  },
  seeAll: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionCard: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
