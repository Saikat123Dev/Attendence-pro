/**
 * Session Card Component - AttendX Dark Pro Theme
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Badge } from '../ui/badge';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../constants/theme';

interface SessionCardProps {
  subjectName: string;
  subjectCode?: string;
  status: 'ACTIVE' | 'STOPPED';
  date: string;
  attendance?: { present: number; absent: number; total: number };
  onPress?: () => void;
  onStart?: () => void;
  onStop?: () => void;
}

export function SessionCard({
  subjectName,
  subjectCode,
  status,
  date,
  attendance,
  onPress,
  onStart,
  onStop,
}: SessionCardProps) {
  const isActive = status === 'ACTIVE';

  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.activeContainer]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.subjectInfo}>
          <View style={styles.subjectRow}>
            <Text style={styles.subjectName}>{subjectName}</Text>
            {isActive && <View style={styles.liveDot} />}
          </View>
          {subjectCode && <Text style={styles.subjectCode}>{subjectCode}</Text>}
        </View>
        <Badge
          text={isActive ? 'LIVE' : 'ENDED'}
          variant={isActive ? 'success' : 'default'}
          size="sm"
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          <View style={styles.dateRow}>
            <View style={[styles.dateIcon, isActive && styles.liveIcon]}>
              <Text style={styles.dateIconText}>S</Text>
            </View>
            <Text style={styles.dateLabel}>Started</Text>
          </View>
          <Text style={styles.dateValue}>{date}</Text>
        </View>

        {attendance && (
          <View style={styles.attendanceContainer}>
            <View style={styles.attendanceRow}>
              <Text style={styles.attendanceValue}>{attendance.present}</Text>
              <Text style={styles.attendanceSep}>/</Text>
              <Text style={styles.attendanceTotal}>{attendance.total}</Text>
            </View>
            <Text style={styles.attendanceLabel}>Present</Text>
          </View>
        )}

        {isActive && (
          <View style={styles.actions}>
            {onStop && (
              <TouchableOpacity style={styles.stopButton} onPress={onStop} activeOpacity={0.8}>
                <Text style={styles.stopButtonText}>Stop</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#141828',
    borderRadius: 14,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#1E2235',
    ...shadows.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  activeContainer: {
    borderColor: '#10B981',
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  subjectInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  subjectName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#F0F2FF',
    letterSpacing: 0.2,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  subjectCode: {
    fontSize: fontSize.sm,
    color: '#8E8E93',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#1E2235',
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateContainer: {},
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  dateIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1E2235',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveIcon: {
    backgroundColor: '#10B98130',
  },
  dateIconText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
  },
  dateLabel: {
    fontSize: fontSize.xs,
    color: '#5C5C5C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: fontSize.sm,
    color: '#F0F2FF',
    fontWeight: '500',
  },
  attendanceContainer: {
    alignItems: 'center',
  },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  attendanceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10B981',
  },
  attendanceSep: {
    fontSize: fontSize.md,
    color: '#5C5C5C',
    marginHorizontal: 4,
  },
  attendanceTotal: {
    fontSize: 28,
    fontWeight: '700',
    color: '#5C5C5C',
  },
  attendanceLabel: {
    fontSize: fontSize.xs,
    color: '#5C5C5C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stopButton: {
    backgroundColor: '#EF444420',
    borderWidth: 1,
    borderColor: '#EF444440',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  stopButtonText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: fontSize.sm,
    letterSpacing: 0.3,
  },
});
