/**
 * Beautified Attendance Screen
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
import { Card, Badge, Loading, EmptyState } from '@/components/ui';
import { StatsCard } from '@/components/attendance/stats-card';
import { AttendanceRecordItem } from '@/components/attendance/record-item';
import { colors, spacing, fontSize, borderRadius, shadows } from '@/constants/theme';
import { AttendanceRecord } from '@/types';

export default function AttendanceScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const isTeacher = user?.role === 'TEACHER';

  useEffect(() => {
    loadData();
  }, [selectedSubject]);

  async function loadData() {
    try {
      if (!isTeacher) {
        const [recordsRes, statsRes] = await Promise.all([
          apiService.getMyAttendance(selectedSubject ? { subjectId: selectedSubject } : undefined),
          apiService.getMyStats(selectedSubject || undefined),
        ]);
        setRecords(recordsRes.records);
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

  // Teacher: Show placeholder
  if (isTeacher) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Attendance Management"
          message="View and manage student attendance from the Students tab"
          icon={<Text style={styles.emptyEmoji}>📋</Text>}
        />
      </View>
    );
  }

  // Student: Show personal attendance
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Stats Card */}
      <StatsCard
        percentage={stats?.overall?.attendancePercentage || 0}
        present={stats?.overall?.presentCount || 0}
        absent={stats?.overall?.absentCount || 0}
        total={stats?.overall?.totalSessions || 0}
      />

      {/* Subject Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>By Subject</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedSubject && styles.filterChipActive]}
            onPress={() => setSelectedSubject(null)}
          >
            <Text style={[styles.filterText, !selectedSubject && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {stats?.bySubject?.map((s: any) => (
            <TouchableOpacity
              key={s._id}
              style={[styles.filterChip, selectedSubject === s.subjectId._id && styles.filterChipActive]}
              onPress={() => setSelectedSubject(s.subjectId._id)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedSubject === s.subjectId._id && styles.filterTextActive,
                ]}
              >
                {s.subjectId.code}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recent History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Attendance</Text>
        {records.length === 0 ? (
          <Card>
            <EmptyState
              title="No records found"
              message="Your attendance history will appear here"
            />
          </Card>
        ) : (
          records.slice(0, 20).map((record) => (
            <AttendanceRecordItem
              key={record._id}
              name={(record.subjectId as any)?.name || 'Unknown'}
              subjectName={(record.subjectId as any)?.code}
              date={new Date(record.createdAt || record.markedAt).toLocaleDateString()}
              status={record.status}
            />
          ))
        )}
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
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  filterSection: {
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.white,
  },
  emptyEmoji: {
    fontSize: 48,
  },
});
