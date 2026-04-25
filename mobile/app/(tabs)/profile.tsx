/**
 * Beautified Profile Screen
 */
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Card, Avatar, Badge, Button } from '@/components/ui';
import { colors, spacing, fontSize, borderRadius, shadows } from '@/constants/theme';
import { StudentProfile, TeacherProfile } from '@/types';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const isTeacher = user?.role === 'TEACHER';
  const profile = isTeacher
    ? (user?.profile as TeacherProfile)
    : (user?.profile as StudentProfile);

  function handleLogout() {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (err) {
              console.error('Logout error:', err);
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <Card style={styles.headerCard}>
        <Avatar
          name={profile?.name || user?.email || 'U'}
          size="xl"
        />
        <Text style={styles.name}>{profile?.name || user?.email}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Badge
          text={user?.role || 'USER'}
          variant={user?.role === 'TEACHER' ? 'primary' : 'info'}
          style={styles.roleBadge}
        />
      </Card>

      {/* Profile Details */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Details</Text>

        {isTeacher ? (
          <>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Employee ID</Text>
              <Text style={styles.detailValue}>
                {(profile as TeacherProfile)?.employeeId || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Department</Text>
              <Text style={styles.detailValue}>
                {(profile as TeacherProfile)?.department || 'N/A'}
              </Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Roll Number</Text>
              <Text style={styles.detailValue}>
                {(profile as StudentProfile)?.rollNumber || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Registration</Text>
              <Text style={styles.detailValue}>
                {(profile as StudentProfile)?.registrationNumber || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Branch</Text>
              <Text style={styles.detailValue}>
                {(profile as StudentProfile)?.branch || 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Semester</Text>
              <Text style={styles.detailValue}>
                {(profile as StudentProfile)?.semester || 'N/A'}
              </Text>
            </View>
          </>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Member Since</Text>
          <Text style={styles.detailValue}>
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
          </Text>
        </View>
      </Card>

      {/* Subjects */}
      {!isTeacher && (profile as StudentProfile)?.subjects && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Enrolled Subjects</Text>
          <View style={styles.subjectsGrid}>
            {(profile as StudentProfile)?.subjects?.map((subject: any) => (
              <View key={subject._id} style={styles.subjectChip}>
                <Text style={styles.subjectName}>{subject.code}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Settings */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Notification Settings</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Privacy Policy</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Terms of Service</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>App Version</Text>
          <Text style={styles.menuItemValue}>1.0.0</Text>
        </TouchableOpacity>
      </Card>

      {/* Logout */}
      <View style={styles.logoutSection}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          size="lg"
        />
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
  headerCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.md,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  email: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  roleBadge: {
    marginTop: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  subjectChip: {
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  subjectName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  menuItemArrow: {
    fontSize: fontSize.xl,
    color: colors.textSecondary,
  },
  menuItemValue: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  logoutSection: {
    marginTop: spacing.lg,
  },
});
