/**
 * Attendance Stats Card Component
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/card';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';

interface StatsCardProps {
  percentage: number;
  present: number;
  absent: number;
  total: number;
}

export function StatsCard({ percentage, present, absent, total }: StatsCardProps) {
  const getPercentageColor = () => {
    if (percentage >= 75) return colors.success;
    if (percentage >= 50) return colors.warning;
    return colors.danger;
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance Overview</Text>
        <View style={[styles.percentageBadge, { backgroundColor: getPercentageColor() + '20' }]}>
          <Text style={[styles.percentageText, { color: getPercentageColor() }]}>
            {percentage.toFixed(1)}%
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{present}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{absent}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: getPercentageColor(),
              },
            ]}
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  percentageBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  percentageText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  progressContainer: {
    marginTop: spacing.xs,
  },
  progressBackground: {
    height: 8,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});
