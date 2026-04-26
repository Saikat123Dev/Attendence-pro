/**
 * Students Screen - AttendX Dark Pro Theme
 * Teacher: View and manage enrolled students
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
import { router } from 'expo-router';
import { apiService } from '@/services/api';
import { Badge } from '@/components/ui';
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

export default function StudentsScreen() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentListVersion, setStudentListVersion] = useState(0);

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    try {
      const res = await apiService.getMySubjects();
      setSubjects(res.subjects || []);
    } catch (err) {
      console.error('Error loading subjects:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailableStudents(subjectId: string) {
    try {
      const res = await apiService.getAvailableStudents(subjectId);
      setAvailableStudents(res.students || []);
    } catch (err) {
      console.error('Error loading available students:', err);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadSubjects();
    setRefreshing(false);
  }

  function openEnrollModal(subject: any) {
    setSelectedSubject(subject);
    setSelectedStudentIds([]);
    loadAvailableStudents(subject._id);
    setShowEnrollModal(true);
  }

  function toggleStudentSelection(studentId: string) {
    setSelectedStudentIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId]
    );
  }

  async function enrollStudents(studentIds: string[]) {
    if (studentIds.length === 0) return;
    setEnrolling(true);
    try {
      await apiService.enrollStudents(selectedSubject._id, studentIds);
      Alert.alert('Success', `${studentIds.length} student(s) enrolled successfully`);
      await loadSubjects();
      setStudentListVersion((version) => version + 1);
      setSelectedStudentIds([]);
      setAvailableStudents((current) =>
        current.filter((student) => !studentIds.includes(student._id))
      );
      setShowEnrollModal(false);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to enroll students');
    } finally {
      setEnrolling(false);
    }
  }

  async function unenrollStudent(subject: any, studentId: string, studentName: string) {
    Alert.alert(
      'Unenroll Student',
      `Remove ${studentName} from ${subject.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unenroll',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.unenrollStudents(subject._id, [studentId]);
              Alert.alert('Success', 'Student unenrolled');
              await loadSubjects();
              setStudentListVersion((version) => version + 1);
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to unenroll');
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading students...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Students</Text>
          <Text style={styles.subtitle}>Manage enrolled students</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {subjects.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="groups-2" size={44} color={theme.primary} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No Subjects Yet</Text>
            <Text style={styles.emptyText}>
              Create subjects first to enroll students
            </Text>
            <Pressable
              style={styles.primaryButton}
              onPress={() => router.push('/(tabs)/subjects')}
            >
              <Text style={styles.primaryButtonText}>Go to Subjects</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.subjectsList}>
            {subjects.map((subject) => (
              <View key={subject._id} style={styles.subjectCard}>
                <View style={styles.subjectHeader}>
                  <View style={[styles.subjectIconBg, { backgroundColor: theme.primary + '20' }]}>
                    <MaterialIcons name="menu-book" size={20} color={theme.primary} />
                  </View>
                  <View style={styles.subjectInfo}>
                    <Text style={styles.subjectName}>{subject.name}</Text>
                    <Text style={[styles.subjectCode, { color: theme.primary }]}>
                      {subject.code} • Sem {subject.semester}
                    </Text>
                  </View>
                  <Pressable
                    style={styles.enrollButton}
                    onPress={() => openEnrollModal(subject)}
                  >
                    <Text style={styles.enrollButtonText}>+ Enroll</Text>
                  </Pressable>
                </View>

                <StudentList
                  subjectId={subject._id}
                  refreshKey={studentListVersion}
                  onUnenroll={(studentId: string, studentName: string) =>
                    unenrollStudent(subject, studentId, studentName)
                  }
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Enroll Students Modal */}
      <Modal
        visible={showEnrollModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEnrollModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowEnrollModal(false)} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enroll Students</Text>
              <Pressable onPress={() => setShowEnrollModal(false)}>
                <MaterialIcons name="close" size={22} color={theme.textSecondary} />
              </Pressable>
            </View>
            <Text style={styles.modalSubtitle}>
              {selectedSubject?.name} ({selectedSubject?.code})
            </Text>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {availableStudents.length === 0 ? (
                <View style={styles.modalEmpty}>
                  <Text style={styles.modalEmptyText}>
                    No students available to enroll.{'\n'}All students may already be enrolled.
                  </Text>
                </View>
              ) : (
                <View style={styles.studentList}>
                  {availableStudents.map((student) => (
                    <Pressable
                      key={student._id}
                      style={[
                        styles.studentItem,
                        selectedStudentIds.includes(student._id) && styles.studentItemSelected,
                      ]}
                      onPress={() => toggleStudentSelection(student._id)}
                      disabled={enrolling}
                    >
                      <View style={styles.studentAvatar}>
                        <Text style={styles.studentAvatarText}>
                          {student.name?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                      </View>
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{student.name}</Text>
                        <Text style={styles.studentMeta}>
                          {student.rollNumber || student.registrationNumber || 'No ID'} • {student.branch} Sem {student.semester}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.selectIcon,
                          selectedStudentIds.includes(student._id) && styles.selectIconActive,
                        ]}
                      >
                        {selectedStudentIds.includes(student._id) && (
                          <MaterialIcons name="check" size={16} color={colors.white} />
                        )}
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </ScrollView>

            {availableStudents.length > 0 && (
              <View style={styles.modalFooter}>
                <Pressable
                  style={[
                    styles.enrollSelectedButton,
                    (selectedStudentIds.length === 0 || enrolling) && styles.enrollSelectedButtonDisabled,
                  ]}
                  onPress={() => enrollStudents(selectedStudentIds)}
                  disabled={selectedStudentIds.length === 0 || enrolling}
                >
                  <MaterialIcons name="person-add-alt-1" size={18} color={colors.white} />
                  <Text style={styles.enrollSelectedButtonText}>
                    {enrolling ? 'Enrolling...' : `Enroll ${selectedStudentIds.length} Selected`}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StudentList({ subjectId, refreshKey, onUnenroll }: any) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getSubject(subjectId);
      const allStudents = (res.enrolledStudents || []).map((student: any) => ({
        ...student,
        status: 'ENROLLED',
      }));
      setStudents(allStudents);
    } catch (err) {
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents, refreshKey]);

  return (
    <View style={styles.studentListContainer}>
      <Pressable style={styles.expandButton} onPress={() => setExpanded(!expanded)}>
        <Text style={styles.expandButtonText}>
          {expanded ? '▼ Hide Students' : '▶ View Enrolled Students'}
        </Text>
        <Badge text={`${students.length}`} variant="default" size="sm" />
      </Pressable>

      {expanded && (
        <View style={styles.enrolledList}>
          {loading ? (
            <Text style={styles.loadingSmall}>Loading...</Text>
          ) : students.length === 0 ? (
            <Text style={styles.noStudents}>No students enrolled yet</Text>
          ) : (
            students.map((student) => (
              <View key={student._id} style={styles.enrolledStudent}>
                <View style={styles.studentAvatar}>
                  <Text style={styles.studentAvatarText}>
                    {student.name?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                </View>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentMeta}>
                    {student.rollNumber || student.registrationNumber || 'No ID'}
                  </Text>
                </View>
                <Badge
                  text="Enrolled"
                  variant="default"
                  size="sm"
                />
                <Pressable
                  style={styles.unenrollBtn}
                  onPress={() => onUnenroll(student._id, student.name)}
                >
                  <MaterialIcons name="person-remove-alt-1" size={18} color={theme.danger} />
                </Pressable>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  centerContainer: {
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
  scrollView: { flex: 1 },
  scrollContent: {
    padding: spacing.md,
    paddingTop: 0,
    paddingBottom: 100,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: theme.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
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
  primaryButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 14,
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  subjectsList: { gap: spacing.md },
  subjectCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.border,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  subjectIcon: {},
  subjectInfo: { flex: 1 },
  subjectName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  subjectCode: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginTop: 2,
  },
  enrollButton: {
    backgroundColor: theme.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 10,
  },
  enrollButtonText: {
    color: theme.primary,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  studentListContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  expandButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
  },
  expandButtonText: {
    color: theme.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  enrolledList: {
    marginTop: spacing.sm,
  },
  loadingSmall: {
    color: theme.textSecondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    padding: spacing.md,
  },
  noStudents: {
    color: theme.textSecondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    padding: spacing.md,
  },
  enrolledStudent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: theme.background,
    borderRadius: 10,
    marginBottom: spacing.xs,
  },
  studentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  studentAvatarText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
  studentInfo: { flex: 1 },
  studentName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  studentMeta: {
    fontSize: fontSize.xs,
    color: theme.textSecondary,
  },
  unenrollBtn: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  unenrollText: {
    color: theme.danger,
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    backgroundColor: theme.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: theme.textPrimary,
  },
  modalClose: {
    fontSize: 20,
    color: theme.textSecondary,
    padding: spacing.sm,
  },
  modalSubtitle: {
    fontSize: fontSize.sm,
    color: theme.textSecondary,
    marginBottom: spacing.md,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalEmpty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  modalEmptyText: {
    fontSize: fontSize.md,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  studentList: {
    gap: spacing.xs,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: theme.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  studentItemSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.primary + '12',
  },
  selectIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectIconActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  addIconText: {
    color: colors.white,
  },
  modalFooter: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    marginTop: spacing.md,
  },
  enrollSelectedButton: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  enrollSelectedButtonDisabled: {
    opacity: 0.5,
  },
  enrollSelectedButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
});
