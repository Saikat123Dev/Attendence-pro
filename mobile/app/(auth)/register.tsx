import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

export default function RegisterScreen() {
  const { register, isLoading, error, clearError } = useAuth();

  const [role, setRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    // Teacher
    employeeId: '',
    department: '',
    // Student
    rollNumber: '',
    registrationNumber: '',
    branch: '',
    semester: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    clearError();
  };

  async function handleRegister() {
    if (!role) return;

    const data: any = {
      email: formData.email,
      password: formData.password,
      role,
      name: formData.name,
    };

    if (role === 'TEACHER') {
      data.employeeId = formData.employeeId;
      data.department = formData.department;
    } else {
      data.rollNumber = formData.rollNumber;
      data.registrationNumber = formData.registrationNumber;
      data.branch = formData.branch;
      data.semester = parseInt(formData.semester, 10);
    }

    try {
      await register(data);
    } catch (err) {
      // Handled by context
    }
  }

  const isFormValid = () => {
    if (!role || !formData.email || !formData.password || !formData.name) return false;
    if (formData.password !== formData.confirmPassword) return false;
    if (formData.password.length < 6) return false;

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Smart Attendance</Text>
        </View>

        <View style={styles.form}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={clearError}>
                <Text style={styles.dismissText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Role Selection */}
          <View style={styles.roleContainer}>
            <Text style={styles.sectionTitle}>I am a...</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[styles.roleButton, role === 'TEACHER' && styles.roleButtonActive]}
                onPress={() => setRole('TEACHER')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'TEACHER' && styles.roleButtonTextActive,
                  ]}
                >
                  Teacher
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, role === 'STUDENT' && styles.roleButtonActive]}
                onPress={() => setRole('STUDENT')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'STUDENT' && styles.roleButtonTextActive,
                  ]}
                >
                  Student
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Common Fields */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#999"
              value={formData.name}
              onChangeText={(v) => updateField('name', v)}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={formData.email}
              onChangeText={(v) => updateField('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Min 6 characters"
              placeholderTextColor="#999"
              value={formData.password}
              onChangeText={(v) => updateField('password', v)}
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#999"
              value={formData.confirmPassword}
              onChangeText={(v) => updateField('confirmPassword', v)}
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          {/* Teacher-specific Fields */}
          {role === 'TEACHER' && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Employee ID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., EMP001"
                  placeholderTextColor="#999"
                  value={formData.employeeId}
                  onChangeText={(v) => updateField('employeeId', v)}
                  autoCapitalize="characters"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Department</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Computer Science"
                  placeholderTextColor="#999"
                  value={formData.department}
                  onChangeText={(v) => updateField('department', v)}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
            </>
          )}

          {/* Student-specific Fields */}
          {role === 'STUDENT' && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Roll Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., CS2021001"
                  placeholderTextColor="#999"
                  value={formData.rollNumber}
                  onChangeText={(v) => updateField('rollNumber', v)}
                  autoCapitalize="characters"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Registration Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="University registration number"
                  placeholderTextColor="#999"
                  value={formData.registrationNumber}
                  onChangeText={(v) => updateField('registrationNumber', v)}
                  autoCapitalize="characters"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Branch</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., CSE, ECE, ME"
                  placeholderTextColor="#999"
                  value={formData.branch}
                  onChangeText={(v) => updateField('branch', v)}
                  autoCapitalize="characters"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Semester</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1-8"
                  placeholderTextColor="#999"
                  value={formData.semester}
                  onChangeText={(v) => updateField('semester', v)}
                  keyboardType="number-pad"
                  editable={!isLoading}
                />
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, !isFormValid() && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fcc',
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
    flex: 1,
  },
  dismissText: {
    color: '#c00',
    fontWeight: '600',
    marginLeft: 8,
  },
  roleContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f7ff',
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  roleButtonTextActive: {
    color: '#007AFF',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});
