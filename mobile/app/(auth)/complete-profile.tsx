/**
 * Complete Profile Screen - AttendX Design System
 * Role selection and profile completion
 */
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { Button, Input, Avatar } from '@/components/ui';
import { spacing, fontSize, borderRadius, colors } from '@/src/constants/theme';

export default function CompleteProfileScreen() {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'TEACHER' | 'STUDENT' | null>(user?.role ?? null);
  const [formData, setFormData] = useState({
    employeeId: '',
    department: '',
    rollNumber: '',
    registrationNumber: '',
    branch: '',
    semester: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (user?.role && !role) {
      setRole(user.role);
    }
  }, [role, user?.role]);

  async function handleComplete() {
    if (!role) return;

    setIsLoading(true);
    try {
      const data: any = { role };

      if (role === 'TEACHER') {
        data.employeeId = formData.employeeId;
        data.department = formData.department;
      } else {
        data.rollNumber = formData.rollNumber;
        data.registrationNumber = formData.registrationNumber;
        data.branch = formData.branch;
        data.semester = parseInt(formData.semester, 10);
      }

      const { user } = await apiService.completeProfile(data);
      setUser(user);
      router.replace('/(tabs)');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to complete profile';
      Alert.alert('Error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  const isFormValid = () => {
    if (!role) return false;

    if (role === 'TEACHER') {
      return formData.employeeId && formData.department;
    } else {
      return (
        formData.rollNumber &&
        formData.registrationNumber &&
        formData.branch &&
        formData.semester
      );
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 10}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarGlowOuter} />
            <Avatar name={user?.name || 'User'} size="xxl" type={role === 'TEACHER' ? 'teacher' : 'student'} />
          </View>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Welcome {firstName}! Tell us more about yourself.
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Role Selection */}
          <View style={styles.roleSection}>
            <Text style={styles.sectionTitle}>I am a...</Text>
            <View style={styles.roleButtons}>
              <Pressable
                onPress={() => !isLoading && setRole('TEACHER')}
                disabled={isLoading}
                style={({ pressed }) => [pressed && styles.rolePressed]}
              >
                <LinearGradient
                  colors={role === 'TEACHER' ? [colors.primary.primary, '#6B5BFF'] : ['transparent', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.roleButton,
                    role === 'TEACHER' && styles.roleButtonActive,
                  ]}
                >
                  <View style={[styles.roleIcon, role === 'TEACHER' && styles.roleIconActive]}>
                    <MaterialIcons
                      name="school"
                      size={18}
                      color={role === 'TEACHER' ? '#FFFFFF' : colors.text.secondary}
                    />
                  </View>
                  <Text style={[styles.roleButtonText, role === 'TEACHER' && styles.roleButtonTextActive]}>
                    Teacher
                  </Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => !isLoading && setRole('STUDENT')}
                disabled={isLoading}
                style={({ pressed }) => [pressed && styles.rolePressed]}
              >
                <LinearGradient
                  colors={role === 'STUDENT' ? [colors.success, '#059669'] : ['transparent', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.roleButton,
                    role === 'STUDENT' && styles.roleButtonActive,
                  ]}
                >
                  <View style={[styles.roleIcon, role === 'STUDENT' && styles.roleIconActive]}>
                    <MaterialIcons
                      name="person"
                      size={18}
                      color={role === 'STUDENT' ? '#FFFFFF' : colors.text.secondary}
                    />
                  </View>
                  <Text style={[styles.roleButtonText, role === 'STUDENT' && styles.roleButtonTextActive]}>
                    Student
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>

          {/* Teacher Fields */}
          {role === 'TEACHER' && (
            <>
              <Input
                label="Employee ID"
                placeholder="Enter your employee ID"
                value={formData.employeeId}
                onChangeText={(v) => updateField('employeeId', v)}
                editable={!isLoading}
                leftIcon={<MaterialIcons name="badge" size={20} color={colors.primary.primaryLight} />}
              />
              <Input
                label="Department"
                placeholder="Enter your department"
                value={formData.department}
                onChangeText={(v) => updateField('department', v)}
                editable={!isLoading}
                leftIcon={<MaterialIcons name="business" size={20} color={colors.primary.primaryLight} />}
              />
            </>
          )}

          {/* Student Fields */}
          {role === 'STUDENT' && (
            <>
              <Input
                label="Roll Number"
                placeholder="Enter your roll number"
                value={formData.rollNumber}
                onChangeText={(v) => updateField('rollNumber', v)}
                editable={!isLoading}
                leftIcon={<MaterialIcons name="tag" size={20} color={colors.success} />}
              />
              <Input
                label="Registration Number"
                placeholder="Enter registration number"
                value={formData.registrationNumber}
                onChangeText={(v) => updateField('registrationNumber', v)}
                editable={!isLoading}
                leftIcon={<MaterialIcons name="qr-code" size={20} color={colors.success} />}
              />
              <View style={styles.rowFields}>
                <Input
                  label="Branch"
                  placeholder="e.g. CS"
                  value={formData.branch}
                  onChangeText={(v) => updateField('branch', v)}
                  editable={!isLoading}
                  containerStyle={styles.halfField}
                  leftIcon={<MaterialIcons name="account-tree" size={20} color={colors.success} />}
                />
                <Input
                  label="Semester"
                  placeholder="1-8"
                  value={formData.semester}
                  onChangeText={(v) => updateField('semester', v)}
                  keyboardType="number-pad"
                  editable={!isLoading}
                  containerStyle={styles.halfField}
                  leftIcon={<MaterialIcons name="school" size={20} color={colors.success} />}
                />
              </View>
            </>
          )}

          <Button
            title={isLoading ? 'Completing...' : 'Complete Profile'}
            onPress={handleComplete}
            disabled={!isFormValid() || isLoading}
            loading={isLoading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  avatarGlowOuter: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primary.primary,
    opacity: 0.15,
    top: -10,
    left: -10,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: colors.bg.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.xl,
  },
  roleSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.md,
    letterSpacing: 0.2,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rolePressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing.sm,
  },
  roleButtonActive: {
    borderColor: 'transparent',
  },
  roleIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  roleButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  rowFields: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfField: {
    flex: 1,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});