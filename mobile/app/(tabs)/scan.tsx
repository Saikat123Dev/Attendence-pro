/**
 * Scan Screen - AttendX Dark Pro Theme
 * Teacher: QR Display with glowing border
 * Student: Camera viewfinder with corner brackets
 */
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  Modal,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { Card, Button, Badge } from '@/components/ui';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_AREA_SIZE = SCREEN_WIDTH * 0.7;

export default function ScanScreen() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [qrIntervalId, setQrIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);

  const isTeacher = user?.role === 'TEACHER';
  const accentColor = isTeacher ? theme.primary : theme.success;

  useEffect(() => {
    if (isTeacher) {
      loadActiveSessions();
      loadSubjects();
    }
  }, []);

  useEffect(() => {
    // Clear any existing interval
    if (qrIntervalId) {
      clearInterval(qrIntervalId);
      setQrIntervalId(null);
    }

    if (isTeacher && selectedSession) {
      const interval = setInterval(fetchQRToken, 2000);
      setQrIntervalId(interval);
      return () => {
        clearInterval(interval);
        setQrIntervalId(null);
      };
    }
  }, [selectedSession, isTeacher]);

  async function loadSubjects() {
    try {
      const res = await apiService.getMySubjects();
      setSubjects(res.subjects || []);
    } catch (err: any) {
      console.error('Error loading subjects:', err);
    }
  }

  async function loadActiveSessions() {
    try {
      const res = await apiService.getActiveSessions();
      setActiveSessions(res.sessions || []);
    } catch (err) {
      console.error('Error loading sessions:', err);
    }
  }

  async function startSession(subjectId: string) {
    setIsStarting(true);
    try {
      const res = await apiService.startSession(subjectId);
      setActiveSessions([res.session]);
      setSelectedSession(res.session);
      setQrData(res.initialToken);
      setShowSubjectModal(false);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to start session';
      Alert.alert('Error', errorMsg);
    } finally {
      setIsStarting(false);
    }
  }

  async function fetchQRToken() {
    // Don't fetch if no session or session is being stopped
    if (!selectedSession || !selectedSession._id) return;
    try {
      const res = await apiService.getSessionQR(selectedSession._id);
      setQrData(res.qrData);
    } catch (err: any) {
      // Silently handle errors when session is stopped/deactivated
      const status = err.response?.status;
      const errorMsg = err.response?.data?.error || err.response?.data?.message;

      // Handle SESSION_INACTIVE, 400, 404 - session was stopped
      if (status === 400 || status === 404 || errorMsg === 'SESSION_INACTIVE') {
        setSelectedSession(null);
        setQrData(null);
        return;
      }
      console.error('Error fetching QR:', err);
    }
  }

  async function handleBarCodeScanned(result: BarcodeScanningResult) {
    if (scanned || isMarking) return;
    setScanned(true);

    const { data } = result;

    try {
      const qrData = JSON.parse(data);

      if (!qrData.sessionId || !qrData.signature) {
        Alert.alert('Invalid QR', 'This QR code is not a valid attendance QR.');
        setScanned(false);
        return;
      }

      setIsMarking(true);

      await apiService.markAttendance(qrData.sessionId, data);

      Alert.alert(
        'Success!',
        'Your attendance has been marked successfully.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to mark attendance';
      Alert.alert('Error', message, [{ text: 'OK', onPress: () => setScanned(false) }]);
    } finally {
      setIsMarking(false);
    }
  }

  function selectSession(session: any) {
    setSelectedSession(session);
    fetchQRToken();
  }

  // Permission denied
  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.permissionCard}>
          <View style={[styles.permissionIconBg, { backgroundColor: theme.primary + '20' }]}>
            <Text style={styles.permissionIcon}>📷</Text>
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan QR codes for attendance
          </Text>
          <Pressable style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ============ TEACHER VIEW ============
  if (isTeacher) {
    // QR Display for active session
    if (selectedSession) {
      return (
        <View style={styles.container}>
          <View style={styles.qrHeader}>
            <Pressable onPress={() => setSelectedSession(null)} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>
            <Text style={styles.qrTitle}>Session QR Code</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.qrContainer}>
            <View style={styles.qrCard}>
              <View style={styles.qrCardHeader}>
                <Badge text="LIVE" variant="success" size="md" />
                <View style={styles.liveIndicator} />
              </View>
              <Text style={styles.qrSubjectName}>
                {(selectedSession.subjectId as any)?.name}
              </Text>
              <Text style={[styles.qrSubjectCode, { color: theme.primary }]}>
                {(selectedSession.subjectId as any)?.code}
              </Text>
              <Text style={styles.qrInstructions}>
                Students can scan this QR code to mark their attendance
              </Text>

              <View style={styles.qrDisplayWrapper}>
                <View style={[styles.qrGlowBorder, { shadowColor: theme.primary }]}>
                  <View style={styles.qrDisplay}>
                    {qrData ? (
                      <QRCode
                        value={qrData}
                        size={SCAN_AREA_SIZE * 0.6}
                        backgroundColor="white"
                        color="#000000"
                      />
                    ) : (
                      <View style={styles.qrLoading}>
                        <ActivityIndicator size="large" color={theme.primary} />
                        <Text style={styles.qrLoadingText}>Generating QR...</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={[styles.qrCorner, styles.qrCornerTopLeft]} />
                <View style={[styles.qrCorner, styles.qrCornerTopRight]} />
                <View style={[styles.qrCorner, styles.qrCornerBottomLeft]} />
                <View style={[styles.qrCorner, styles.qrCornerBottomRight]} />
              </View>

              <View style={styles.qrRefreshContainer}>
                <Text style={styles.qrRefresh}>🔄 Auto-refreshes every 2 seconds</Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.stopButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={async () => {
                const sessionId = selectedSession._id;
                setSelectedSession(null); // Immediately clear to stop interval
                try {
                  await apiService.stopSession(sessionId);
                  loadActiveSessions();
                } catch (err) {
                  Alert.alert('Error', 'Failed to stop session');
                }
              }}
            >
              <Text style={styles.stopButtonText}>Stop Session</Text>
            </Pressable>
          </View>

          {/* Subject Selection Modal */}
          <Modal
            visible={showSubjectModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowSubjectModal(false)}
          >
            <View style={styles.modalOverlay}>
              <Pressable style={styles.modalBackdrop} onPress={() => setShowSubjectModal(false)} />
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Start Session</Text>
                  <Pressable onPress={() => setShowSubjectModal(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </Pressable>
                </View>
                <Text style={styles.modalSubtitle}>Select a subject</Text>

                <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                  {subjects.length === 0 ? (
                    <View style={styles.modalEmpty}>
                      <Text style={styles.modalEmptyText}>
                        No subjects found.{'\n'}Create a subject first.
                      </Text>
                    </View>
                  ) : (
                    subjects.map((subject) => (
                      <Pressable
                        key={subject._id}
                        style={({ pressed }) => [
                          styles.subjectItem,
                          pressed && styles.subjectItemPressed,
                        ]}
                        onPress={() => startSession(subject._id)}
                        disabled={isStarting}
                      >
                        <View style={[styles.subjectIconBg, { backgroundColor: theme.primary + '20' }]}>
                          <Text style={styles.subjectIcon}>📚</Text>
                        </View>
                        <View style={styles.subjectInfo}>
                          <Text style={styles.subjectName}>{subject.name}</Text>
                          <Text style={[styles.subjectCode, { color: theme.primary }]}>
                            {subject.code} • Sem {subject.semester}
                          </Text>
                        </View>
                        {isStarting && <ActivityIndicator size="small" color={theme.primary} />}
                      </Pressable>
                    ))
                  )}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </View>
      );
    }

    // Session Selection Screen
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Session</Text>
          <Text style={styles.subtitle}>Choose an active session to display QR code</Text>
        </View>

        {/* Empty State - Start Session */}
        {activeSessions.length === 0 ? (
          <View style={styles.centerContent}>
            <View style={styles.emptyCard}>
              <View style={[styles.emptyIconBg, { backgroundColor: theme.textSecondary + '20' }]}>
                <Text style={styles.emptyIcon}>📭</Text>
              </View>
              <Text style={styles.emptyTitle}>No Active Sessions</Text>
              <Text style={styles.emptyText}>
                Start a new session to begin taking attendance
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => setShowSubjectModal(true)}
              >
                <Text style={styles.primaryButtonText}>+ Start Session</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          // Active Sessions List
          <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollPadding}>
            <Text style={styles.sectionTitle}>Active Sessions</Text>
            {activeSessions.map((session) => (
              <Pressable
                key={session._id}
                style={({ pressed }) => [
                  styles.sessionCard,
                  pressed && styles.sessionCardPressed,
                ]}
                onPress={() => selectSession(session)}
              >
                <View style={styles.sessionInfo}>
                  <View style={styles.sessionInfoMain}>
                    <Text style={styles.sessionSubject}>
                      {(session.subjectId as any)?.name}
                    </Text>
                    <Text style={[styles.sessionCode, { color: theme.primary }]}>
                      {(session.subjectId as any)?.code}
                    </Text>
                  </View>
                  <Badge text="LIVE" variant="success" size="sm" />
                </View>
                <View style={styles.sessionMeta}>
                  <Text style={styles.sessionTime}>
                    Started {new Date(session.startedAt).toLocaleTimeString()}
                  </Text>
                  <Text style={[styles.tapHint, { color: theme.primary }]}>Tap to show QR →</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Floating Start Button when sessions exist */}
        {activeSessions.length > 0 && (
          <Pressable
            style={({ pressed }) => [
              styles.floatingButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setShowSubjectModal(true)}
          >
            <Text style={styles.floatingButtonText}>+ Start New Session</Text>
          </Pressable>
        )}

        {/* Subject Selection Modal */}
        <Modal
          visible={showSubjectModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSubjectModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={() => setShowSubjectModal(false)} />
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Start Session</Text>
                <Pressable onPress={() => setShowSubjectModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </Pressable>
              </View>
              <Text style={styles.modalSubtitle}>Select a subject</Text>

              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                {subjects.length === 0 ? (
                  <View style={styles.modalEmpty}>
                    <Text style={styles.modalEmptyText}>
                      No subjects found.{'\n'}Create a subject first.
                    </Text>
                  </View>
                ) : (
                  subjects.map((subject) => (
                    <Pressable
                      key={subject._id}
                      style={({ pressed }) => [
                        styles.subjectItem,
                        pressed && styles.subjectItemPressed,
                      ]}
                      onPress={() => startSession(subject._id)}
                      disabled={isStarting}
                    >
                      <View style={[styles.subjectIconBg, { backgroundColor: theme.primary + '20' }]}>
                        <Text style={styles.subjectIcon}>📚</Text>
                      </View>
                      <View style={styles.subjectInfo}>
                        <Text style={styles.subjectName}>{subject.name}</Text>
                        <Text style={[styles.subjectCode, { color: theme.primary }]}>
                          {subject.code} • Sem {subject.semester}
                        </Text>
                      </View>
                      {isStarting && <ActivityIndicator size="small" color={theme.primary} />}
                    </Pressable>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // ============ STUDENT VIEW ============
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanHeader}>
            <Text style={styles.scanTitle}>Scan QR Code</Text>
            <Text style={styles.scanSubtitle}>Point camera at the attendance QR code</Text>
          </View>

          <View style={styles.scanFrameContainer}>
            <View style={styles.scanFrame}>
              <View style={styles.viewfinder}>
                <View style={[styles.viewfinderCorner, styles.viewfinderTopLeft]} />
                <View style={[styles.viewfinderCorner, styles.viewfinderTopRight]} />
                <View style={[styles.viewfinderCorner, styles.viewfinderBottomLeft]} />
                <View style={[styles.viewfinderCorner, styles.viewfinderBottomRight]} />
              </View>
              <View style={styles.scanArea} />
            </View>
            <View style={[styles.scanGlow, { shadowColor: theme.success }]} />
          </View>

          <View style={styles.instructionContainer}>
            {isMarking ? (
              <View style={styles.markingContainer}>
                <ActivityIndicator size="small" color={theme.success} />
                <Text style={styles.instructionText}>Marking attendance...</Text>
              </View>
            ) : (
              <Text style={styles.instructionText}>
                {scanned ? 'Processing...' : 'Align QR code within the frame'}
              </Text>
            )}
          </View>

          {scanned && !isMarking && (
            <Pressable
              style={({ pressed }) => [
                styles.rescanButton,
                pressed && styles.rescanButtonPressed,
              ]}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.rescanButtonText}>Tap to Scan Again</Text>
            </Pressable>
          )}
        </View>
      </CameraView>
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
    padding: spacing.md,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
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
  scrollContent: {
    flex: 1,
  },
  scrollPadding: {
    padding: spacing.md,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: spacing.md,
  },

  // Permission Card
  permissionCard: {
    alignItems: 'center',
    padding: spacing.xl,
    maxWidth: 340,
    borderRadius: 20,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  permissionIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  permissionIcon: { fontSize: 40 },
  permissionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: spacing.sm,
  },
  permissionText: {
    fontSize: fontSize.md,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 14,
  },
  permissionButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.md,
  },

  // Empty State
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: 20,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    width: '100%',
    maxWidth: 340,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyIcon: { fontSize: 40 },
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

  // Buttons
  primaryButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 14,
    minWidth: 180,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: theme.primary,
    paddingVertical: spacing.md,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.md,
  },

  // Session List
  sessionCard: {
    backgroundColor: theme.card,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: theme.border,
  },
  sessionCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionInfoMain: { flex: 1 },
  sessionSubject: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  sessionCode: {
    fontSize: fontSize.sm,
    marginTop: 2,
    fontWeight: '600',
  },
  sessionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  sessionTime: {
    fontSize: fontSize.xs,
    color: theme.textSecondary,
  },
  tapHint: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },

  // QR Display
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  backButton: { padding: spacing.sm },
  backButtonPressed: { opacity: 0.7 },
  backButtonText: {
    fontSize: fontSize.md,
    color: theme.primary,
    fontWeight: '600',
  },
  qrTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  qrContainer: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  qrCard: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: 20,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
  },
  qrCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.success,
  },
  qrSubjectName: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: theme.textPrimary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  qrSubjectCode: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  qrInstructions: {
    fontSize: fontSize.md,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  qrDisplayWrapper: {
    position: 'relative',
    marginTop: spacing.xl,
  },
  qrGlowBorder: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  qrDisplay: {
    width: SCAN_AREA_SIZE * 0.75,
    height: SCAN_AREA_SIZE * 0.75,
    backgroundColor: colors.white,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  qrCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
  },
  qrCornerTopLeft: {
    top: -4,
    left: -4,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopColor: theme.primary,
    borderLeftColor: theme.primary,
    borderTopLeftRadius: 8,
  },
  qrCornerTopRight: {
    top: -4,
    right: -4,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopColor: theme.primary,
    borderRightColor: theme.primary,
    borderTopRightRadius: 8,
  },
  qrCornerBottomLeft: {
    bottom: -4,
    left: -4,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomColor: theme.primary,
    borderLeftColor: theme.primary,
    borderBottomLeftRadius: 8,
  },
  qrCornerBottomRight: {
    bottom: -4,
    right: -4,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomColor: theme.primary,
    borderRightColor: theme.primary,
    borderBottomRightRadius: 8,
  },
  qrPlaceholder: { alignItems: 'center' },
  qrPlaceholderIcon: { fontSize: 48, marginBottom: spacing.sm },
  qrPlaceholderText: {
    fontSize: fontSize.sm,
    color: '#666',
    fontWeight: '600',
  },
  qrTokenText: {
    fontSize: fontSize.xs,
    color: '#666',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  qrLoading: { alignItems: 'center' },
  qrLoadingText: {
    fontSize: fontSize.sm,
    color: theme.textSecondary,
    marginTop: spacing.md,
  },
  qrRefreshContainer: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: theme.primary + '15',
    borderRadius: 20,
  },
  qrRefresh: {
    fontSize: fontSize.sm,
    color: theme.primary,
    fontWeight: '500',
  },
  stopButton: {
    backgroundColor: theme.danger,
    paddingVertical: spacing.md,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  stopButtonGradient: { paddingVertical: spacing.md, alignItems: 'center' },
  stopButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.md,
  },

  // Camera
  camera: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanHeader: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  scanTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.white,
  },
  scanSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: spacing.xs,
  },
  scanFrameContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  scanFrame: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinder: {
    width: SCAN_AREA_SIZE - 60,
    height: SCAN_AREA_SIZE - 60,
    position: 'relative',
  },
  viewfinderCorner: {
    position: 'absolute',
    width: 50,
    height: 50,
  },
  viewfinderTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: theme.success,
    borderTopLeftRadius: 14,
  },
  viewfinderTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: theme.success,
    borderTopRightRadius: 14,
  },
  viewfinderBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: theme.success,
    borderBottomLeftRadius: 14,
  },
  viewfinderBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: theme.success,
    borderBottomRightRadius: 14,
  },
  scanArea: {
    width: SCAN_AREA_SIZE - 100,
    height: SCAN_AREA_SIZE - 100,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
  },
  scanGlow: {
    position: 'absolute',
    width: SCAN_AREA_SIZE - 40,
    height: SCAN_AREA_SIZE - 40,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  markingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  instructionText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  rescanButton: {
    position: 'absolute',
    bottom: 60,
    backgroundColor: theme.success + '30',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  rescanButtonPressed: { opacity: 0.8 },
  rescanButtonText: {
    color: theme.success,
    fontSize: fontSize.md,
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '70%',
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
    fontSize: fontSize.md,
    color: theme.textSecondary,
    marginBottom: spacing.md,
  },
  modalScrollView: {
    maxHeight: 300,
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
  subjectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: theme.border,
  },
  subjectItemPressed: { opacity: 0.7 },
  subjectIconBg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  subjectIcon: { fontSize: 18 },
  subjectInfo: { flex: 1 },
  subjectName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  subjectCode: {
    fontSize: fontSize.sm,
    marginTop: 2,
    fontWeight: '600',
  },

  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
});
