/**
 * Attendance Stats Card Component - AttendX Dark Pro Theme
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    if (percentage >= 75) return '#10B981';
    if (percentage >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const percentageColor = getPercentageColor();

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance Overview</Text>
        <View style={[styles.percentageBadge, { backgroundColor: percentageColor + '20' }]}>
          <Text style={[styles.percentageText, { color: percentageColor }]}>
            {percentage.toFixed(1)}%
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#10B98120' }]}>
            <Text style={[styles.statIconText, { color: '#10B981' }]}>P</Text>
          </View>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{present}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#EF444420' }]}>
            <Text style={[styles.statIconText, { color: '#EF4444' }]}>A</Text>
          </View>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>{absent}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#4F6EF720' }]}>
            <Text style={[styles.statIconText, { color: '#4F6EF7' }]}>T</Text>
          </View>
          <Text style={[styles.statValue, { color: '#4F6EF7' }]}>{total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <LinearGradient
            colors={['#4F6EF7', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%` }]}
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
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#F0F2FF',
    letterSpacing: 0.2,
  },
  percentageBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E2235',
  },
  percentageText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statIconText: {
    fontSize: 16,
    fontWeight: '800',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F0F2FF',
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: '#8E8E93',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 48,
    backgroundColor: '#1E2235',
  },
  progressContainer: {
    marginTop: spacing.xs,
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#1E2235',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});
