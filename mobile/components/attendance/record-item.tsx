/**
 * Attendance Record Item Component - AttendX Dark Pro Theme
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../constants/theme';

interface AttendanceRecordItemProps {
  name: string;
  rollNumber?: string;
  subjectName?: string;
  date: string;
  status: 'PRESENT' | 'ABSENT';
  type?: 'student' | 'teacher';
  onPress?: () => void;
}

export function AttendanceRecordItem({
  name,
  rollNumber,
  subjectName,
  date,
  status,
  type = 'student',
  onPress,
}: AttendanceRecordItemProps) {
  const isPresent = status === 'PRESENT';

  const Content = (
    <View style={styles.container}>
      <Avatar name={name} size="md" type={type} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.details}>
          {rollNumber && (
            <View style={styles.detailChip}>
              <Text style={styles.detailText}>{rollNumber}</Text>
            </View>
          )}
          {subjectName && (
            <View style={[styles.detailChip, styles.subjectChip]}>
              <Text style={[styles.detailText, styles.subjectText]}>{subjectName}</Text>
            </View>
          )}
          <Text style={styles.date}>{date}</Text>
        </View>
      </View>
      <Badge
        text={status}
        variant={isPresent ? 'present' : 'absent'}
        size="sm"
      />
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {Content}
      </TouchableOpacity>
    );
  }

  return Content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141828',
    padding: spacing.md,
    borderRadius: 14,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#1E2235',
    ...shadows.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#F0F2FF',
    letterSpacing: 0.2,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  detailChip: {
    backgroundColor: '#1E2235',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#2D2D3A',
  },
  subjectChip: {
    backgroundColor: '#4F6EF720',
    borderColor: '#4F6EF730',
  },
  detailText: {
    fontSize: fontSize.xs,
    color: '#8E8E93',
    fontWeight: '500',
  },
  subjectText: {
    color: '#4F6EF7',
  },
  date: {
    fontSize: fontSize.sm,
    color: '#5C5C5C',
  },
});
