/**
 * Attendance Screen - AttendX Dark Pro Theme
 * Teacher: Session management with gradient stats
 * Student: Attendance records with filter chips and status badges
 */
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Modal,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { Badge, Loading, EmptyState } from '@/components/ui';
import { AttendanceRecordItem } from '@/components/attendance/record-item';
import { colors, spacing, fontSize } from '@/constants/theme';
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
  const [sessions, setSessions] = useState<any[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedSessionDetails, setSelectedSessionDetails] = useState<any>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const isTeacher = user?.role === 'TEACHER';
  const accentColor = isTeacher ? theme.primary : theme.success;

  const loadData = useCallback(async () => {
    try {
      if (isTeacher) {
        const historyRes = await apiService.getSessionHistory();
        setSessions(historyRes.sessions || []);
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
  }, [isTeacher, selectedSubject]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function openSessionDetails(session: any) {
    setSelectedSessionDetails({
      session,
      summary: session.attendanceCount || { total: 0, present: 0, absent: 0 },
      presentStudents: [],
      absentStudents: [],
    });
    setIsDetailsLoading(true);
    try {
      const res = await apiService.getSessionDetails(session._id);
      setSelectedSessionDetails(res);
    } catch (err) {
      console.error('Error loading session details:', err);
    } finally {
      setIsDetailsLoading(false);
    }
  }

  if (loading) {
    return <Loading message="Loading attendance..." />;
  }

  // Teacher: Show session management and student attendance
  if (isTeacher) {
    const activeSessions = sessions.filter(s => s.status === 'ACTIVE');

    return (
      <View style={styles.container}>
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
          {/* Active Sessions Alert */}
          {activeSessions.length > 0 && (
            <View style={styles.section}>
              <View style={styles.alertBanner}>
                <View style={styles.alertDot} />
                <Text style={styles.alertText}>{activeSessions.length} Active Session{activeSessions.length > 1 ? 's' : ''}</Text>
                <Pressable
                  style={styles.alertAction}
                  onPress={() => router.push('/(tabs)/scan')}
                >
                  <Text style={styles.alertActionText}>View QR</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Recent Sessions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Sessions</Text>
              <Text style={styles.sessionCount}>{sessions.length} total</Text>
            </View>
            {sessions.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconBox}>
                  <MaterialIcons name="inbox" size={30} color={theme.primary} />
                </View>
                <Text style={styles.emptyTitle}>No Sessions Yet</Text>
                <Text style={styles.emptyText}>Start your first attendance session to see it here</Text>
                <Pressable
                  style={styles.emptyButton}
                  onPress={() => router.push('/(tabs)/scan')}
                >
                  <Text style={styles.emptyButtonText}>Start Session</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.sessionsList}>
                {sessions.slice(0, 15).map((session) => (
                  <Pressable
                    key={session._id}
                    style={({ pressed }) => [
                      styles.sessionItem,
                      pressed && styles.sessionItemPressed,
                    ]}
                    onPress={() => openSessionDetails(session)}
                  >
                    <View style={styles.sessionItemContent}>
                      <View style={styles.sessionItemLeft}>
                        <View style={[styles.sessionItemIconBg, { backgroundColor: session.status === 'ACTIVE' ? theme.success + '20' : theme.primary + '20' }]}>
                          <MaterialIcons
                            name="menu-book"
                            size={18}
                            color={session.status === 'ACTIVE' ? theme.success : theme.primary}
                          />
                        </View>
                        <View style={styles.sessionItemInfo}>
                          <Text style={styles.sessionSubject}>
                            {(session.subjectId as any)?.name || 'Unknown'}
                          </Text>
                          <Text style={[styles.sessionCode, { color: session.status === 'ACTIVE' ? theme.success : theme.primary }]}>
                            {(session.subjectId as any)?.code}
                          </Text>
                          <View style={styles.sessionCounts}>
                            <Text style={styles.sessionCountText}>
                              {session.attendanceCount?.present || 0} present
                            </Text>
                            <Text style={styles.sessionCountText}>
                              {session.attendanceCount?.absent || 0} absent
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.sessionItemRight}>
                        <Badge
                          text={session.status}
                          variant={session.status === 'ACTIVE' ? 'success' : 'default'}
                          size="sm"
                        />
                        <Text style={styles.sessionDate}>
                          {new Date(session.startedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Text>
                        <Text style={styles.sessionTime}>
                          {new Date(session.startedAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <Modal
          visible={!!selectedSessionDetails}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedSessionDetails(null)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={() => setSelectedSessionDetails(null)}
            />
            <View style={styles.detailsSheet}>
              <View style={styles.detailsHeader}>
                <View style={styles.detailsTitleBlock}>
                  <Text style={styles.detailsTitle}>
                    {(selectedSessionDetails?.session?.subjectId as any)?.name ||
                      (selectedSessionDetails?.session?.subjectId as any)?.code ||
                      'Session Details'}
                  </Text>
                  <Text style={styles.detailsSubtitle}>
                    {selectedSessionDetails?.session?.startedAt
                      ? new Date(selectedSessionDetails.session.startedAt).toLocaleString()
                      : ''}
                  </Text>
                </View>
                <Pressable onPress={() => setSelectedSessionDetails(null)}>
                  <MaterialIcons name="close" size={22} color={theme.textSecondary} />
                </Pressable>
              </View>

              {isDetailsLoading ? (
                <View style={styles.detailsLoading}>
                  <ActivityIndicator color={theme.primary} />
                  <Text style={styles.detailsLoadingText}>Loading records...</Text>
                </View>
              ) : (
                <>
                  <View style={styles.detailsStats}>
                    <View style={styles.detailsStat}>
                      <Text style={styles.detailsStatValue}>
                        {selectedSessionDetails?.summary?.total || 0}
                      </Text>
                      <Text style={styles.detailsStatLabel}>Total</Text>
                    </View>
                    <View style={styles.detailsStatDivider} />
                    <View style={styles.detailsStat}>
                      <Text style={[styles.detailsStatValue, { color: theme.success }]}>
                        {selectedSessionDetails?.summary?.present || 0}
                      </Text>
                      <Text style={styles.detailsStatLabel}>Present</Text>
                    </View>
                    <View style={styles.detailsStatDivider} />
                    <View style={styles.detailsStat}>
                      <Text style={[styles.detailsStatValue, { color: theme.danger }]}>
                        {selectedSessionDetails?.summary?.absent || 0}
                      </Text>
                      <Text style={styles.detailsStatLabel}>Absent</Text>
                    </View>
                  </View>

                  {selectedSessionDetails?.session?.status === 'ACTIVE' && (
                    <Pressable
                      style={styles.detailsQrButton}
                      onPress={() => {
                        setSelectedSessionDetails(null);
                        router.push('/(tabs)/scan');
                      }}
                    >
                      <MaterialIcons name="qr-code-2" size={18} color={colors.white} />
                      <Text style={styles.detailsQrButtonText}>Display Live QR</Text>
                    </Pressable>
                  )}

                  <ScrollView
                    style={styles.detailsList}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={styles.detailsSectionTitle}>Present Students</Text>
                    {(selectedSessionDetails?.presentStudents || []).length === 0 ? (
                      <Text style={styles.detailsEmptyText}>No students marked present</Text>
                    ) : (
                      selectedSessionDetails.presentStudents.map((entry: any) => (
                        <View key={entry._id} style={styles.detailsStudentRow}>
                          <View style={[styles.detailsStudentAvatar, { backgroundColor: theme.success }]}>
                            <Text style={styles.detailsStudentAvatarText}>
                              {entry.student?.name?.charAt(0)?.toUpperCase() || '?'}
                            </Text>
                          </View>
                          <View style={styles.detailsStudentInfo}>
                            <Text style={styles.detailsStudentName}>{entry.student?.name || 'Student'}</Text>
                            <Text style={styles.detailsStudentMeta}>
                              {entry.student?.rollNumber || 'No roll'} •{' '}
                              {entry.markedAt ? new Date(entry.markedAt).toLocaleTimeString() : 'Marked'}
                            </Text>
                          </View>
                          <Badge text="Present" variant="success" size="sm" />
                        </View>
                      ))
                    )}

                    <Text style={styles.detailsSectionTitle}>Absent Students</Text>
                    {(selectedSessionDetails?.absentStudents || []).length === 0 ? (
                      <Text style={styles.detailsEmptyText}>No absent students recorded</Text>
                    ) : (
                      selectedSessionDetails.absentStudents.map((entry: any) => (
                        <View key={entry._id} style={styles.detailsStudentRow}>
                          <View style={[styles.detailsStudentAvatar, { backgroundColor: theme.danger }]}>
                            <Text style={styles.detailsStudentAvatarText}>
                              {entry.student?.name?.charAt(0)?.toUpperCase() || '?'}
                            </Text>
                          </View>
                          <View style={styles.detailsStudentInfo}>
                            <Text style={styles.detailsStudentName}>{entry.student?.name || 'Student'}</Text>
                            <Text style={styles.detailsStudentMeta}>
                              {entry.student?.rollNumber || 'No roll'}
                            </Text>
                          </View>
                          <Badge text="Absent" variant="danger" size="sm" />
                        </View>
                      ))
                    )}
                  </ScrollView>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
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
            <Text style={styles.statItemLabel}>Sessions</Text>
            <Text style={styles.statItemValue}>{stats?.overall?.totalSessions || 0}</Text>
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
              icon={<MaterialIcons name="history" size={24} color={theme.textSecondary} />}
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
  // Quick Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  // New Hero Card Styles
  heroCard: {
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  heroBadgeText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  heroStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: spacing.md,
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: fontSize.xxl,
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
    marginHorizontal: spacing.md,
  },
  // New Action Card Styles
  actionCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  actionCardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85,
  },
  actionCardGradient: {
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: fontSize.xs,
    color: theme.textSecondary,
  },
  // Alert Banner
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.success + '15',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.success + '30',
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.success,
    marginRight: spacing.sm,
  },
  alertText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: theme.success,
  },
  alertAction: {
    paddingHorizontal: spacing.sm,
  },
  alertActionText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: theme.success,
  },
  // Empty State
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyIconLarge: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  emptyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  emptyButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  quickActionCardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85,
    backgroundColor: theme.elevated,
  },
  quickActionIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickActionIcon: {
    fontSize: 24,
  },
  quickActionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 2,
  },
  quickActionDesc: {
    fontSize: fontSize.xs,
    color: theme.textSecondary,
    textAlign: 'center',
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
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    padding: spacing.md,
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
  sessionCounts: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  sessionCountText: {
    fontSize: fontSize.xs,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  sessionItemRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  sessionDate: {
    fontSize: fontSize.xs,
    color: theme.textSecondary,
  },
  sessionTime: {
    fontSize: fontSize.xs,
    color: theme.textSecondary,
    fontWeight: '600',
    marginTop: 2,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  detailsSheet: {
    backgroundColor: theme.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: theme.border,
    padding: spacing.lg,
    maxHeight: '86%',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  detailsTitleBlock: {
    flex: 1,
  },
  detailsTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: theme.textPrimary,
  },
  detailsSubtitle: {
    fontSize: fontSize.sm,
    color: theme.textSecondary,
    marginTop: spacing.xs,
  },
  detailsLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  detailsLoadingText: {
    color: theme.textSecondary,
    fontSize: fontSize.sm,
  },
  detailsStats: {
    flexDirection: 'row',
    backgroundColor: theme.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  detailsStat: {
    flex: 1,
    alignItems: 'center',
  },
  detailsStatValue: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: theme.textPrimary,
  },
  detailsStatLabel: {
    fontSize: fontSize.xs,
    color: theme.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  detailsStatDivider: {
    width: 1,
    backgroundColor: theme.borderLight,
    marginHorizontal: spacing.sm,
  },
  detailsQrButton: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  detailsQrButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  detailsList: {
    maxHeight: 440,
  },
  detailsSectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: theme.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  detailsEmptyText: {
    color: theme.textSecondary,
    fontSize: fontSize.sm,
    backgroundColor: theme.background,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  detailsStudentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: theme.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  detailsStudentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsStudentAvatarText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: fontSize.sm,
  },
  detailsStudentInfo: {
    flex: 1,
  },
  detailsStudentName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  detailsStudentMeta: {
    fontSize: fontSize.xs,
    color: theme.textSecondary,
    marginTop: 2,
  },
});
