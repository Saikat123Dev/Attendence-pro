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
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';

export default function CompleteProfileScreen() {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'TEACHER' | 'STUDENT' | null>(null);
  const [formData, setFormData] = useState({
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
  };

  async function handleComplete() {
    if (!role) {
      Alert.alert('Error', 'Please select a role');
      return;
    }

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

      const response = await apiService.completeProfile(data);
      setUser(response.user);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to complete profile');
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Welcome {user?.name}! Tell us more about yourself.</Text>
        </View>

        <View style={styles.form}>
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
            onPress={handleComplete}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Complete Profile</Text>
            )}
          </TouchableOpacity>
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
});