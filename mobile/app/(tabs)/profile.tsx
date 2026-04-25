/**
 * Profile Screen - AttendX Dark Pro Theme
 * Gradient header with avatar, info rows, subject chips, logout button
 */
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { Card, Avatar, Badge, Button } from '@/components/ui';
import { colors, spacing, fontSize, borderRadius, shadows } from '@/constants/theme';
import { StudentProfile, TeacherProfile, Subject } from '@/types';

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

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const isTeacher = user?.role === 'TEACHER';
  const profile = isTeacher
    ? (user?.profile as TeacherProfile)
    : (user?.profile as StudentProfile);

  // Role-based gradient colors
  const headerGradient = isTeacher
    ? ['#4F6EF7', '#2D7DD2']
    : ['#10B981', '#059669'];

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header with Gradient */}
      <LinearGradient
        colors={headerGradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.avatarContainer}>
          <TouchableOpacity activeOpacity={0.8}>
            <View style={styles.avatarWrapper}>
              <Avatar
                name={profile?.name || user?.email || 'U'}
                size="xxl"
              />
              <View style={styles.avatarEditBadge}>
                <Text style={styles.avatarEditIcon}>✏</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{profile?.name || user?.email}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadgeContainer}>
          <Badge
            text={user?.role || 'USER'}
            variant="light"
            size="md"
          />
        </View>
      </LinearGradient>

      {/* Profile Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Details</Text>
        <LinearGradient
          colors={[theme.card, theme.elevated]}
          style={styles.detailsCard}
        >
          {isTeacher ? (
            <>
              <View style={styles.detailRow}>
                <View style={styles.detailLabelContainer}>
                  <Text style={styles.detailLabel}>Employee ID</Text>
                </View>
                <Text style={styles.detailValue}>
                  {(profile as TeacherProfile)?.employeeId || 'N/A'}
                </Text>
              </View>
              <View style={[styles.detailRow, styles.detailRowBorder]}>
                <View style={styles.detailLabelContainer}>
                  <Text style={styles.detailLabel}>Department</Text>
                </View>
                <Text style={styles.detailValue}>
                  {(profile as TeacherProfile)?.department || 'N/A'}
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.detailRow}>
                <View style={styles.detailLabelContainer}>
                  <Text style={styles.detailLabel}>Roll Number</Text>
                </View>
                <Text style={styles.detailValue}>
                  {(profile as StudentProfile)?.rollNumber || 'N/A'}
                </Text>
              </View>
              <View style={[styles.detailRow, styles.detailRowBorder]}>
                <View style={styles.detailLabelContainer}>
                  <Text style={styles.detailLabel}>Registration</Text>
                </View>
                <Text style={styles.detailValue}>
                  {(profile as StudentProfile)?.registrationNumber || 'N/A'}
                </Text>
              </View>
              <View style={[styles.detailRow, styles.detailRowBorder]}>
                <View style={styles.detailLabelContainer}>
                  <Text style={styles.detailLabel}>Branch</Text>
                </View>
                <Text style={styles.detailValue}>
                  {(profile as StudentProfile)?.branch || 'N/A'}
                </Text>
              </View>
              <View style={[styles.detailRow, styles.detailRowBorder]}>
                <View style={styles.detailLabelContainer}>
                  <Text style={styles.detailLabel}>Semester</Text>
                </View>
                <Text style={styles.detailValue}>
                  {(profile as StudentProfile)?.semester || 'N/A'}
                </Text>
              </View>
            </>
          )}
          <View style={styles.detailRow}>
            <View style={styles.detailLabelContainer}>
              <Text style={styles.detailLabel}>Member Since</Text>
            </View>
            <Text style={styles.detailValue}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              }) : '-'}
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Subjects - Teacher teaches, Student enrolled */}
      {isTeacher ? (
        (profile as TeacherProfile)?.subjects && (profile as TeacherProfile)?.subjects?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subjects You Teach</Text>
            <View style={styles.subjectsGrid}>
              {(profile as TeacherProfile)?.subjects?.map((subject: Subject) => (
                <LinearGradient
                  key={subject._id}
                  colors={[theme.card, theme.elevated]}
                  style={styles.subjectChip}
                >
                  <Text style={[styles.subjectCode, { color: theme.primary }]}>{subject.code}</Text>
                  <Text style={styles.subjectName} numberOfLines={1}>{subject.name}</Text>
                </LinearGradient>
              ))}
            </View>
          </View>
        )
      ) : (
        (profile as StudentProfile)?.subjects && (profile as StudentProfile)?.subjects?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Enrolled Subjects</Text>
            <View style={styles.subjectsGrid}>
              {(profile as StudentProfile)?.subjects?.map((subject: Subject) => (
                <LinearGradient
                  key={subject._id}
                  colors={[theme.card, theme.elevated]}
                  style={styles.subjectChip}
                >
                  <Text style={[styles.subjectCode, { color: theme.success }]}>{subject.code}</Text>
                  <Text style={styles.subjectName} numberOfLines={1}>{subject.name}</Text>
                </LinearGradient>
              ))}
            </View>
          </View>
        )
      )}

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <LinearGradient
          colors={[theme.card, theme.elevated]}
          style={styles.settingsCard}
        >
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>🔔</Text>
              <Text style={styles.menuItemText}>Notification Settings</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </Pressable>
          <View style={styles.menuDivider} />
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>🔒</Text>
              <Text style={styles.menuItemText}>Privacy Policy</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </Pressable>
          <View style={styles.menuDivider} />
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>📄</Text>
              <Text style={styles.menuItemText}>Terms of Service</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </Pressable>
          <View style={styles.menuDivider} />
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>ℹ️</Text>
              <Text style={styles.menuItemText}>App Version</Text>
            </View>
            <Text style={styles.menuItemValue}>1.0.0</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Logout Button with Danger Gradient */}
      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.logoutButtonPressed,
        ]}
        onPress={handleLogout}
      >
        <LinearGradient
          colors={[theme.danger, '#D93A33']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.logoutGradient}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </LinearGradient>
      </Pressable>
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
  headerGradient: {
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatarEditIcon: {
    fontSize: 14,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.white,
    marginTop: spacing.md,
    letterSpacing: -0.5,
  },
  email: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.75)',
    marginTop: spacing.xs,
  },
  roleBadgeContainer: {
    marginTop: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  detailsCard: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  detailRowBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  detailLabelContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: fontSize.md,
    color: theme.textSecondary,
  },
  detailValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: theme.textPrimary,
    textAlign: 'right',
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  subjectChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    minWidth: 100,
  },
  subjectCode: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subjectName: {
    fontSize: fontSize.xs,
    color: theme.textSecondary,
    marginTop: 2,
    maxWidth: 100,
  },
  settingsCard: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuItemPressed: {
    opacity: 0.7,
    backgroundColor: theme.elevated,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemIcon: {
    fontSize: 18,
  },
  menuItemText: {
    fontSize: fontSize.md,
    color: theme.textPrimary,
  },
  menuItemArrow: {
    fontSize: fontSize.xl,
    color: theme.textSecondary,
  },
  menuItemValue: {
    fontSize: fontSize.md,
    color: theme.textSecondary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.border,
    marginLeft: 52,
  },
  logoutButton: {
    marginTop: spacing.lg,
    borderRadius: 14,
    overflow: 'hidden',
  },
  logoutButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  logoutGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.md,
    letterSpacing: 0.5,
  },
});
