/**
 * Session Card Component - For teachers to see active/past sessions
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
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.subjectInfo}>
          <Text style={styles.subjectName}>{subjectName}</Text>
          {subjectCode && <Text style={styles.subjectCode}>{subjectCode}</Text>}
        </View>
        <Badge
          text={isActive ? 'LIVE' : status}
          variant={isActive ? 'success' : 'default'}
          size="sm"
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Started</Text>
          <Text style={styles.dateValue}>{date}</Text>
        </View>

        {attendance && (
          <View style={styles.attendanceContainer}>
            <Text style={styles.attendanceText}>
              <Text style={styles.attendanceValue}>{attendance.present}</Text>
              <Text style={styles.attendanceSep}> / </Text>
              <Text style={styles.attendanceTotal}>{attendance.total}</Text>
            </Text>
            <Text style={styles.attendanceLabel}>Present</Text>
          </View>
        )}

        {isActive && (
          <View style={styles.actions}>
            {onStop && (
              <TouchableOpacity style={styles.stopButton} onPress={onStop}>
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
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  activeContainer: {
    borderColor: colors.success,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  subjectCode: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateContainer: {},
  dateLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  dateValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  attendanceContainer: {
    alignItems: 'center',
  },
  attendanceText: {},
  attendanceValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.success,
  },
  attendanceSep: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  attendanceTotal: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  attendanceLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stopButton: {
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  stopButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
});
