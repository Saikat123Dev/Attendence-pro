/**
 * Attendance Record Item Component
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';

interface AttendanceRecordItemProps {
  name: string;
  rollNumber?: string;
  subjectName?: string;
  date: string;
  status: 'PRESENT' | 'ABSENT';
  type?: 'student' | 'teacher';
}

export function AttendanceRecordItem({
  name,
  rollNumber,
  subjectName,
  date,
  status,
  type = 'student',
}: AttendanceRecordItemProps) {
  return (
    <View style={styles.container}>
      <Avatar name={name} size="md" />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.details}>
          {rollNumber && <Text style={styles.detail}>{rollNumber}</Text>}
          {subjectName && <Text style={styles.detail}>{subjectName}</Text>}
          <Text style={styles.date}>{date}</Text>
        </View>
      </View>
      <Badge
        text={status}
        variant={status === 'PRESENT' ? 'success' : 'error'}
        size="sm"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
    gap: spacing.sm,
  },
  detail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
