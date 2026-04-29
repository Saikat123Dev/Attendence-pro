import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
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
import { spacing, fontSize, borderRadius, shadows } from '@/constants/theme';

// Theme colors
const theme = {
  bg: {
    base: '#0A0D14',
    card: '#141828',
  },
  primary: '#4F6EF7',
  accent: '#7B93FC',
  teacher: '#4F6EF7',
  student: '#10B981',
  text: {
    primary: '#F0F2FF',
    secondary: '#C0C5E0',
    muted: '#6B7194',
  },
  border: '#1E2235',
  danger: '#FF5A5A',
  success: '#4ADE80',
};

const PRIMARY_GRADIENT = ['#4F6EF7', '#7B93FC'] as const;

export default function CompleteProfileScreen() {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'TEACHER' | 'STUDENT' | null>(user?.role ?? null);
  const [isPressed, setIsPressed] = useState(false);
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
      const errorCode = error.response?.data?.error;
      const errorMsg = error.response?.data?.message || 'Failed to complete profile';

      // We should just show the error to the user so they can fix it.
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

  const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          {/* Avatar with glow */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarGlowOuter} />
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitial}</Text>
            </View>
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
                style={styles.rolePressable}
              >
                <View
                  style={[
                    styles.roleButton,
                    role === 'TEACHER' && styles.roleButtonTeacherActive,
                  ]}
                >
                  <View
                    style={[
                      styles.roleIcon,
                      role === 'TEACHER' && styles.roleIconTeacherActive,
                    ]}
                  >
                    <MaterialIcons
                      name="school"
                      size={16}
                      color={role === 'TEACHER' ? '#FFFFFF' : theme.text.secondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.roleButtonText,
                      role === 'TEACHER' && styles.roleButtonTextTeacherActive,
                    ]}
                  >
                    Teacher
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => !isLoading && setRole('STUDENT')}
                disabled={isLoading}
                style={styles.rolePressable}
              >
                <View
                  style={[
                    styles.roleButton,
                    role === 'STUDENT' && styles.roleButtonStudentActive,
                  ]}
                >
                  <View
                    style={[
                      styles.roleIcon,
                      role === 'STUDENT' && styles.roleIconStudentActive,
                    ]}
                  >
                    <MaterialIcons
                      name="person"
                      size={16}
                      color={role === 'STUDENT' ? '#FFFFFF' : theme.text.secondary}
                    />
                  </View>
                  <Text
                    style={[
                      styles.roleButtonText,
                      role === 'STUDENT' && styles.roleButtonTextStudentActive,
                    ]}
                  >
                    Student
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Teacher Fields */}
          {role === 'TEACHER' && (
            <View style={styles.fieldsSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Employee ID</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <MaterialIcons name="badge" size={16} color={theme.text.secondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., EMP001"
                    placeholderTextColor={theme.text.muted}
                    value={formData.employeeId}
                    onChangeText={(v) => updateField('employeeId', v)}
                    autoCapitalize="characters"
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Department</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <MaterialIcons name="domain" size={16} color={theme.text.secondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Computer Science"
                    placeholderTextColor={theme.text.muted}
                    value={formData.department}
                    onChangeText={(v) => updateField('department', v)}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Student Fields */}
          {role === 'STUDENT' && (
            <View style={styles.fieldsSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Roll Number</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <MaterialIcons name="tag" size={16} color={theme.text.secondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., CS2021001"
                    placeholderTextColor={theme.text.muted}
                    value={formData.rollNumber}
                    onChangeText={(v) => updateField('rollNumber', v)}
                    autoCapitalize="characters"
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Registration Number</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <MaterialIcons name="numbers" size={16} color={theme.text.secondary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="University registration number"
                    placeholderTextColor={theme.text.muted}
                    value={formData.registrationNumber}
                    onChangeText={(v) => updateField('registrationNumber', v)}
                    autoCapitalize="characters"
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Branch</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <MaterialIcons name="account-tree" size={16} color={theme.text.secondary} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="CSE"
                      placeholderTextColor={theme.text.muted}
                      value={formData.branch}
                      onChangeText={(v) => updateField('branch', v)}
                      autoCapitalize="characters"
                      editable={!isLoading}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Semester</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <MaterialIcons name="calendar-view-week" size={16} color={theme.text.secondary} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="1-8"
                      placeholderTextColor={theme.text.muted}
                      value={formData.semester}
                      onChangeText={(v) => updateField('semester', v)}
                      keyboardType="number-pad"
                      editable={!isLoading}
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Complete Button */}
          <Pressable
            onPress={handleComplete}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            disabled={!isFormValid() || isLoading}
            style={styles.buttonPressable}
          >
            <LinearGradient
              colors={!isFormValid() || isLoading ? ['#2A3A5C', '#3A4A6C'] : PRIMARY_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.button,
                isPressed && styles.buttonPressed,
              ]}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.loadingText}>Completing...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Complete Profile</Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg.base,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.xxl,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  avatarGlowOuter: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'transparent',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(79, 110, 247, 0.25)',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.bg.card,
    borderWidth: 3,
    borderColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    ...shadows.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.primary,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: theme.text.primary,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: theme.text.secondary,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: theme.bg.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: theme.border,
    ...shadows.lg,
  },
  roleSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: theme.text.secondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rolePressable: {
    flex: 1,
  },
  roleButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: 'center',
    backgroundColor: theme.bg.base,
  },
  roleButtonTeacherActive: {
    borderColor: theme.teacher,
    backgroundColor: 'rgba(79, 110, 247, 0.1)',
  },
  roleButtonStudentActive: {
    borderColor: theme.student,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.bg.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: theme.border,
  },
  roleIconTeacherActive: {
    backgroundColor: theme.teacher,
    borderColor: theme.teacher,
  },
  roleIconStudentActive: {
    backgroundColor: theme.student,
    borderColor: theme.student,
  },
  roleButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: theme.text.muted,
  },
  roleButtonTextTeacherActive: {
    color: theme.teacher,
  },
  roleButtonTextStudentActive: {
    color: theme.student,
  },
  fieldsSection: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bg.base,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: theme.border,
  },
  inputIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: theme.border,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: spacing.md,
    fontSize: fontSize.md,
    color: theme.text.primary,
    height: 44,
  },
  buttonPressable: {
    marginTop: spacing.sm,
  },
  button: {
    height: 52,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: 1 }],
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
  },
  buttonDisabled: {
    backgroundColor: '#2A3A5C',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});
