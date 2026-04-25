/**
 * Attendance Screen - AttendX Dark Pro Theme
 * Teacher: Session management with gradient stats
 * Student: Attendance records with filter chips and status badges
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { Card, Badge, Loading, EmptyState } from '@/components/ui';
import { StatsCard } from '@/components/attendance/stats-card';
import { AttendanceRecordItem } from '@/components/attendance/record-item';
import { colors, spacing, fontSize, borderRadius, shadows } from '@/constants/theme';
import { AttendanceRecord } from '@/types';

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

export default function AttendanceScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const isTeacher = user?.role === 'TEACHER';
  const accentColor = isTeacher ? theme.primary : theme.success;

  useEffect(() => {
    loadData();
  }, [selectedSubject, isTeacher]);

  async function loadData() {
    try {
      if (isTeacher) {
        const historyRes = await apiService.getSessionHistory();
        setRecords(historyRes.records || []);
      } else {
        const [recordsRes, statsRes] = await Promise.all([
          apiService.getMyAttendance(selectedSubject ? { subjectId: selectedSubject } : undefined),
          apiService.getMyStats(selectedSubject || undefined),
        ]);
        setRecords(recordsRes.records || []);
        setStats(statsRes);
      }
    } catch (err) {
      console.error('Error loading attendance:', err);
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
    return <Loading message="Loading attendance..." />;
  }

  // Teacher: Show session management and student attendance
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
        {/* Quick Actions Card with Gradient */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attendance Management</Text>
          <LinearGradient
            colors={[theme.card, theme.elevated]}
            style={styles.manageCard}
          >
            <View style={styles.manageActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.manageButton,
                  pressed && styles.manageButtonPressed,
                ]}
                onPress={() => router.push('/(tabs)/scan')}
              >
                <LinearGradient
                  colors={[theme.primary, '#2D7DD2']}
                  style={styles.manageButtonGradient}
                >
                  <Text style={styles.manageButtonIcon}>▶</Text>
                  <Text style={styles.manageButtonText}>Start Session</Text>
                </LinearGradient>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.manageButtonOutline,
                  pressed && styles.manageButtonOutlinePressed,
                ]}
              >
                <View style={styles.manageButtonContent}>
                  <Text style={styles.manageButtonOutlineIcon}>📋</Text>
                  <Text style={styles.manageButtonOutlineText}>View All</Text>
                </View>
              </Pressable>
            </View>
          </LinearGradient>
        </View>

        {/* Recent Sessions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            <Text style={styles.sessionCount}>{records.length} total</Text>
          </View>
          {records.length === 0 ? (
            <LinearGradient
              colors={[theme.card, theme.elevated]}
              style={styles.emptyCard}
            >
              <EmptyState
                title="No sessions found"
                message="Your attendance sessions will appear here"
                icon="📭"
              />
            </LinearGradient>
          ) : (
            <View style={styles.sessionsList}>
              {records.slice(0, 20).map((record, index) => (
                <Pressable
                  key={record._id}
                  style={({ pressed }) => [
                    styles.sessionItem,
                    pressed && styles.sessionItemPressed,
                  ]}
                >
                  <LinearGradient
                    colors={[theme.card, theme.elevated]}
                    style={styles.sessionItemGradient}
                  >
                    <View style={styles.sessionItemContent}>
                      <View style={styles.sessionItemLeft}>
                        <View style={[styles.sessionItemIconBg, { backgroundColor: theme.primary + '20' }]}>
                          <Text style={styles.sessionItemIcon}>📚</Text>
                        </View>
                        <View style={styles.sessionItemInfo}>
                          <Text style={styles.sessionSubject}>
                            {(record.subjectId as any)?.name || 'Unknown'}
                          </Text>
                          <Text style={[styles.sessionCode, { color: theme.primary }]}>
                            {(record.subjectId as any)?.code}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.sessionItemRight}>
                        <Badge
                          text={record.status}
                          variant={record.status === 'PRESENT' ? 'success' : 'error'}
                          size="sm"
                        />
                        <Text style={styles.sessionDate}>
                          {new Date(record.createdAt || record.markedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Text>
                      </View>
                    </View>
                    {index < Math.min(records.length, 20) - 1 && (
                      <View style={styles.sessionDivider} />
                    )}
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  // Student: Show personal attendance
  const attendancePercentage = stats?.overall?.attendancePercentage || 0;
  const isGoodAttendance = attendancePercentage >= 75;

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
      {/* Stats Card with Gradient */}
      <LinearGradient
        colors={isGoodAttendance ? ['#1B4332', '#2D6A4F'] : ['#7B2D26', '#9D3F3A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statsCard}
      >
        <View style={styles.statsHeader}>
          <View>
            <Text style={styles.statsTitle}>Attendance Overview</Text>
            <Text style={styles.statsSubtitle}>
              {stats?.overall?.totalSessions || 0} total sessions
            </Text>
          </View>
          <View style={[
            styles.percentageBadge,
            isGoodAttendance ? styles.percentageGood : styles.percentageBad
          ]}>
            <Text style={styles.percentageText}>{Math.round(attendancePercentage)}%</Text>
          </View>
        </View>

        {/* Attendance Ring Indicator */}
        <View style={styles.ringContainer}>
          <View style={styles.ringBackground}>
            <View style={[
              styles.ringProgress,
              {
                backgroundColor: isGoodAttendance ? theme.success : theme.danger,
                width: `${Math.min(attendancePercentage, 100)}%`
              }
            ]} />
          </View>
        </View>

        <View style={styles.statsDetails}>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: theme.success }]} />
            <Text style={styles.statItemLabel}>Present</Text>
            <Text style={styles.statItemValue}>{stats?.overall?.presentCount || 0}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: theme.danger }]} />
            <Text style={styles.statItemLabel}>Absent</Text>
            <Text style={styles.statItemValue}>{stats?.overall?.absentCount || 0}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: theme.warning }]} />
            <Text style={styles.statItemLabel}>Late</Text>
            <Text style={styles.statItemValue}>{stats?.overall?.lateCount || 0}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Subject Filter */}
      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Text style={styles.sectionTitle}>By Subject</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <Pressable
            style={({ pressed }) => [
              styles.filterChip,
              !selectedSubject && styles.filterChipActive,
              pressed && styles.filterChipPressed,
            ]}
            onPress={() => setSelectedSubject(null)}
          >
            {!selectedSubject && (
              <LinearGradient
                colors={[theme.success, '#059669']}
                style={styles.filterChipActiveGradient}
              >
                <Text style={styles.filterTextActive}>All</Text>
              </LinearGradient>
            )}
            {selectedSubject && (
              <Text style={styles.filterText}>All</Text>
            )}
          </Pressable>
          {stats?.bySubject?.map((s: any) => (
            <Pressable
              key={s._id}
              style={({ pressed }) => [
                styles.filterChip,
                selectedSubject === s.subjectId._id && styles.filterChipActive,
                pressed && styles.filterChipPressed,
              ]}
              onPress={() => setSelectedSubject(s.subjectId._id)}
            >
              {selectedSubject === s.subjectId._id ? (
                <LinearGradient
                  colors={[theme.success, '#059669']}
                  style={styles.filterChipActiveGradient}
                >
                  <Text style={styles.filterTextActive}>{s.subjectId.code}</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.filterText}>{s.subjectId.code}</Text>
              )}
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Recent History */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Attendance</Text>
          <Text style={styles.recordCount}>{records.length} records</Text>
        </View>
        {records.length === 0 ? (
          <LinearGradient
            colors={[theme.card, theme.elevated]}
            style={styles.emptyCard}
          >
            <EmptyState
              title="No records found"
              message="Your attendance history will appear here"
              icon="📋"
            />
          </LinearGradient>
        ) : (
          <View style={styles.recordsList}>
            {records.slice(0, 20).map((record) => (
              <AttendanceRecordItem
                key={record._id}
                name={(record.subjectId as any)?.name || 'Unknown'}
                subjectName={(record.subjectId as any)?.code}
                date={new Date(record.createdAt || record.markedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
                status={record.status}
              />
            ))}
          </View>
        )}
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
    padding: spacing.md,
    paddingBottom: 120,
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
  sessionCount: {
    fontSize: fontSize.sm,
    color: theme.textSecondary,
  },
  recordCount: {
    fontSize: fontSize.sm,
    color: theme.textSecondary,
  },
  statsCard: {
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statsTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.white,
  },
  statsSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  percentageBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  percentageGood: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  percentageBad: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  percentageText: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.white,
  },
  ringContainer: {
    marginTop: spacing.lg,
  },
  ringBackground: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ringProgress: {
    height: '100%',
    borderRadius: 4,
  },
  statsDetails: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: spacing.md,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statItemLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  statItemValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.white,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: spacing.md,
  },
  filterSection: {
    marginBottom: spacing.md,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  filterScroll: {
    paddingVertical: spacing.xs,
  },
  filterChip: {
    marginRight: spacing.sm,
    borderRadius: 20,
    overflow: 'hidden',
  },
  filterChipActive: {
    backgroundColor: theme.success,
  },
  filterChipPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  filterChipActiveGradient: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterText: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontWeight: '600',
  },
  manageCard: {
    padding: spacing.lg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  manageActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  manageButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  manageButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  manageButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  manageButtonIcon: {
    fontSize: 14,
    color: colors.white,
  },
  manageButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  manageButtonOutline: {
    flex: 1,
    borderWidth: 2,
    borderColor: theme.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageButtonOutlinePressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  manageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  manageButtonOutlineIcon: {
    fontSize: 14,
  },
  manageButtonOutlineText: {
    color: theme.primary,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  sessionsList: {
    gap: spacing.sm,
  },
  sessionItem: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  sessionItemPressed: {
    opacity: 0.7,
  },
  sessionItemGradient: {
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  sessionItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  sessionItemIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionItemIcon: {
    fontSize: 18,
  },
  sessionItemInfo: {
    flex: 1,
  },
  sessionSubject: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  sessionCode: {
    fontSize: fontSize.sm,
    marginTop: 2,
    fontWeight: '600',
  },
  sessionItemRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  sessionDate: {
    fontSize: fontSize.xs,
    color: theme.textSecondary,
    marginTop: 4,
  },
  sessionDivider: {
    height: 1,
    backgroundColor: theme.border,
    marginTop: spacing.md,
    marginLeft: 56,
  },
  recordsList: {
    gap: spacing.sm,
  },
});
