/**
 * Subjects Screen - AttendX Dark Pro Theme
 * Teacher: Manage subjects (CRUD)
 * Student: View enrolled subjects (read-only)
 */
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { Badge, Input } from '@/components/ui';
import { colors, spacing, fontSize } from '@/constants/theme';

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

export default function SubjectsScreen() {
  const { user, refreshUser } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [actionSubjectId, setActionSubjectId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    branch: '',
    semester: '',
  });

  const isTeacher = user?.role === 'TEACHER';

  const loadSubjects = useCallback(async () => {
    try {
      if (isTeacher) {
        const res = await apiService.getMySubjects();
        setSubjects(res.subjects || []);
        setAvailableSubjects([]);
      } else {
        const [enrolledRes, availableRes] = await Promise.all([
          apiService.getStudentSubjects(),
          apiService.getAvailableSubjects(),
        ]);
        setSubjects(enrolledRes.subjects || []);
        setAvailableSubjects(availableRes.subjects || []);
      }
    } catch (err: any) {
      console.error('Error loading subjects:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  }, [isTeacher]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  async function handleSelfEnroll(subject: any) {
    setActionSubjectId(subject._id);
    try {
      const res = await apiService.selfEnrollSubject(subject._id);
      const enrolledSubject = res.subject || subject;
      setAvailableSubjects((current) =>
        current.filter((availableSubject) => availableSubject._id !== subject._id)
      );
      setSubjects((current) => {
        if (current.some((currentSubject) => currentSubject._id === subject._id)) {
          return current;
        }
        return [...current, enrolledSubject].sort((a, b) =>
          String(a.name).localeCompare(String(b.name))
        );
      });
      await Promise.all([loadSubjects(), refreshUser()]);
      Alert.alert('Success', `Enrolled in ${subject.name}`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to enroll in subject');
    } finally {
      setActionSubjectId(null);
    }
  }

  async function handleSelfUnenroll(subject: any) {
    Alert.alert(
      'Leave Subject',
      `Remove ${subject.name} from your enrolled subjects?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            setActionSubjectId(subject._id);
            try {
              await apiService.selfUnenrollSubject(subject._id);
              setSubjects((current) =>
                current.filter((enrolledSubject) => enrolledSubject._id !== subject._id)
              );
              setAvailableSubjects((current) => {
                if (current.some((availableSubject) => availableSubject._id === subject._id)) {
                  return current;
                }
                return [...current, subject].sort((a, b) =>
                  String(a.name).localeCompare(String(b.name))
                );
              });
              await Promise.all([loadSubjects(), refreshUser()]);
              Alert.alert('Success', 'Subject removed');
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to remove subject');
            } finally {
              setActionSubjectId(null);
            }
          },
        },
      ]
    );
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadSubjects();
    setRefreshing(false);
  }

  function openCreateModal() {
    setEditingSubject(null);
    setFormData({ name: '', code: '', branch: '', semester: '' });
    setShowModal(true);
  }

  function openEditModal(subject: any) {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      branch: subject.branch || '',
      semester: subject.semester?.toString() || '',
    });
    setShowModal(true);
  }

  async function handleSubmit() {
    if (
      !formData.name.trim() ||
      !formData.code.trim() ||
      !formData.branch.trim() ||
      !formData.semester.trim()
    ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const semesterValue = parseInt(formData.semester, 10);
    if (!Number.isInteger(semesterValue) || semesterValue < 1 || semesterValue > 8) {
      Alert.alert('Error', 'Semester must be a number between 1 and 8');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        branch: formData.branch.trim().toUpperCase(),
        semester: semesterValue,
      };

      if (editingSubject) {
        await apiService.updateSubject(editingSubject._id, data);
        Alert.alert('Success', 'Subject updated successfully');
      } else {
        await apiService.createSubject(data);
        Alert.alert('Success', 'Subject created successfully');
      }

      setShowModal(false);
      await loadSubjects();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save subject');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(subject: any) {
    Alert.alert(
      'Delete Subject',
      `Are you sure you want to delete "${subject.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteSubject(subject._id);
              Alert.alert('Success', 'Subject deleted successfully');
              loadSubjects();
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete subject');
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading subjects...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{isTeacher ? 'My Subjects' : 'Enrolled Subjects'}</Text>
          <Text style={styles.subtitle}>
            {isTeacher ? 'Manage your teaching subjects' : 'Subjects you are enrolled in'}
          </Text>
        </View>
        {isTeacher && (
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            onPress={openCreateModal}
          >
            <LinearGradient
              colors={[theme.primary, '#2D7DD2']}
              style={styles.addButtonGradient}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </LinearGradient>
          </Pressable>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isTeacher ? theme.primary : theme.success}
          />
        }
      >
        {!isTeacher && (
          <View style={styles.studentSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{subjects.length}</Text>
              <Text style={styles.summaryLabel}>Enrolled</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: theme.success }]}>
                {availableSubjects.length}
              </Text>
              <Text style={styles.summaryLabel}>Available</Text>
            </View>
          </View>
        )}

        {subjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyCard}>
              <View style={[styles.emptyIconBg, { backgroundColor: (isTeacher ? theme.primary : theme.success) + '20' }]}>
                <MaterialIcons name="menu-book" size={30} color={isTeacher ? theme.primary : theme.success} />
              </View>
              <Text style={styles.emptyTitle}>
                {isTeacher ? 'No Subjects Yet' : 'No Enrolled Subjects'}
              </Text>
              <Text style={styles.emptyText}>
                {isTeacher
                  ? 'Create your first subject to start taking attendance'
                  : 'Browse compatible subjects below and enroll yourself'}
              </Text>
              {isTeacher && (
                <Pressable
                  style={({ pressed }) => [
                    styles.createFirstButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={openCreateModal}
                >
                  <Text style={styles.createFirstButtonText}>Create Subject</Text>
                </Pressable>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.subjectList}>
            {subjects.map((subject) => (
              <Pressable
                key={subject._id}
                style={({ pressed }) => [
                  styles.subjectCard,
                  pressed && styles.subjectCardPressed,
                ]}
                onPress={isTeacher ? () => openEditModal(subject) : undefined}
              >
                <View style={styles.subjectCardInner}>
                  <View style={styles.subjectHeader}>
                    <View style={[styles.subjectIconBg, { backgroundColor: (isTeacher ? theme.primary : theme.success) + '20' }]}>
                      <MaterialIcons name="menu-book" size={20} color={isTeacher ? theme.primary : theme.success} />
                    </View>
                    <View style={styles.subjectInfo}>
                      <Text style={styles.subjectName}>{subject.name}</Text>
                      <Text style={[styles.subjectCode, { color: isTeacher ? theme.primary : theme.success }]}>
                        {subject.code}
                      </Text>
                    </View>
                    {isTeacher && (
                      <Pressable
                        style={styles.deleteButton}
                        onPress={() => handleDelete(subject)}
                      >
                        <MaterialIcons name="delete-outline" size={20} color={theme.danger} />
                      </Pressable>
                    )}
                    {!isTeacher && (
                      <Pressable
                        style={styles.leaveButton}
                        onPress={() => handleSelfUnenroll(subject)}
                        disabled={actionSubjectId === subject._id}
                      >
                        <MaterialIcons name="logout" size={18} color={theme.danger} />
                      </Pressable>
                    )}
                  </View>
                  <View style={styles.subjectMeta}>
                    <Badge
                      text={`Semester ${subject.semester}`}
                      variant={isTeacher ? 'primary' : 'success'}
                      size="sm"
                    />
                    {subject.branch && (
                      <Badge
                        text={subject.branch}
                        variant="default"
                        size="sm"
                      />
                    )}
                    {isTeacher && subject.teacherId && (
                      <Badge
                        text={(subject.teacherId as any)?.name || 'You'}
                        variant="default"
                        size="sm"
                      />
                    )}
                    {!isTeacher && subject.teacherId && (
                      <Badge
                        text={(subject.teacherId as any)?.name || 'Teacher'}
                        variant="default"
                        size="sm"
                      />
                    )}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {!isTeacher && (
          <View style={styles.availableSection}>
            <Text style={styles.sectionTitle}>Available Subjects</Text>
            {availableSubjects.length === 0 ? (
              <View style={styles.availableEmpty}>
                <Text style={styles.availableEmptyText}>
                  No compatible subjects are available right now
                </Text>
              </View>
            ) : (
              <View style={styles.subjectList}>
                {availableSubjects.map((subject) => (
                  <View key={subject._id} style={styles.subjectCard}>
                    <View style={styles.subjectCardInner}>
                      <View style={styles.subjectHeader}>
                        <View style={[styles.subjectIconBg, { backgroundColor: theme.success + '20' }]}>
                          <MaterialIcons name="library-add" size={20} color={theme.success} />
                        </View>
                        <View style={styles.subjectInfo}>
                          <Text style={styles.subjectName}>{subject.name}</Text>
                          <Text style={[styles.subjectCode, { color: theme.success }]}>
                            {subject.code}
                          </Text>
                        </View>
                        <Pressable
                          style={[
                            styles.enrollButton,
                            actionSubjectId === subject._id && styles.disabledButton,
                          ]}
                          onPress={() => handleSelfEnroll(subject)}
                          disabled={actionSubjectId === subject._id}
                        >
                          <Text style={styles.enrollButtonText}>
                            {actionSubjectId === subject._id ? 'Joining...' : 'Enroll'}
                          </Text>
                        </Pressable>
                      </View>
                      <View style={styles.subjectMeta}>
                        <Badge text={`Semester ${subject.semester}`} variant="success" size="sm" />
                        {subject.branch && <Badge text={subject.branch} variant="default" size="sm" />}
                        {subject.teacherId && (
                          <Badge
                            text={(subject.teacherId as any)?.name || 'Teacher'}
                            variant="default"
                            size="sm"
                          />
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Create/Edit Modal - Teacher only */}
      {isTeacher && (
        <Modal
          visible={showModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={() => setShowModal(false)}
            />
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingSubject ? 'Edit Subject' : 'Create Subject'}
                </Text>
                <Pressable onPress={() => setShowModal(false)}>
                  <MaterialIcons name="close" size={22} color={theme.textSecondary} />
                </Pressable>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Subject Name *</Text>
                  <Input
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    placeholder="e.g., Data Structures"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Subject Code *</Text>
                  <Input
                    value={formData.code}
                    onChangeText={(text) => setFormData({ ...formData, code: text })}
                    placeholder="e.g., CS201"
                    placeholderTextColor={theme.textSecondary}
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Branch *</Text>
                  <Input
                    value={formData.branch}
                    onChangeText={(text) => setFormData({ ...formData, branch: text })}
                    placeholder="e.g., Computer Science"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Semester *</Text>
                  <Input
                    value={formData.semester}
                    onChangeText={(text) => setFormData({ ...formData, semester: text })}
                    placeholder="e.g., 3"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                  />
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.submitButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  <LinearGradient
                    colors={isSubmitting ? [theme.border, theme.borderLight] : [theme.primary, '#2D7DD2']}
                    style={styles.submitButtonGradient}
                  >
                    <Text style={styles.submitButtonText}>
                      {isSubmitting ? 'Saving...' : (editingSubject ? 'Update Subject' : 'Create Subject')}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  loadingText: {
    color: theme.textSecondary,
    fontSize: fontSize.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: theme.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: theme.textSecondary,
    marginTop: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingTop: 0,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: theme.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyIcon: {},
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  createFirstButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 14,
  },
  createFirstButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  addButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  addButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  addButtonGradient: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  subjectList: {
    gap: spacing.sm,
  },
  studentSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: theme.textPrimary,
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    color: theme.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: theme.borderLight,
  },
  availableSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: spacing.md,
  },
  availableEmpty: {
    backgroundColor: theme.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: spacing.lg,
  },
  availableEmptyText: {
    color: theme.textSecondary,
    textAlign: 'center',
    fontSize: fontSize.sm,
  },
  subjectCard: {
    marginBottom: spacing.sm,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  subjectCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  },
  subjectCardInner: {
    padding: spacing.md,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectIconBg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  subjectIcon: {},
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  subjectCode: {
    fontSize: fontSize.sm,
    marginTop: 2,
    fontWeight: '600',
  },
  deleteButton: {
    padding: spacing.sm,
  },
  leaveButton: {
    padding: spacing.sm,
  },
  deleteButtonText: {},
  enrollButton: {
    backgroundColor: theme.success + '20',
    borderWidth: 1,
    borderColor: theme.success + '40',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
  },
  enrollButtonText: {
    color: theme.success,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  subjectMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: theme.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: theme.textPrimary,
  },
  modalClose: {},
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  submitButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
});
