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
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { Card, Button, Badge } from '@/components/ui';
import { colors, spacing, fontSize, borderRadius, shadows } from '@/constants/theme';

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

  const isTeacher = user?.role === 'TEACHER';
  const accentColor = isTeacher ? theme.primary : theme.success;

  useEffect(() => {
    if (isTeacher) {
      loadActiveSessions();
      loadSubjects();
    }
  }, []);

  useEffect(() => {
    if (isTeacher && selectedSession) {
      const interval = setInterval(fetchQRToken, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedSession]);

  async function loadSubjects() {
    try {
      const res = await apiService.getMySubjects();
      setSubjects(res.subjects || []);
    } catch (err: any) {
      console.error('Error loading subjects:', err);
      console.error('Subjects error response:', err.response?.data);
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
      console.log('Starting session for subject:', subjectId);
      const res = await apiService.startSession(subjectId);
      console.log('Session started successfully:', res);
      setActiveSessions([res.session]);
      setSelectedSession(res.session);
      setQrData(res.initialToken);
      setShowSubjectModal(false);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to start session';
      console.error('Start session error:', errorMsg);
      console.error('Full error:', err);
      Alert.alert('Error', errorMsg);
    } finally {
      setIsStarting(false);
    }
  }

  async function fetchQRToken() {
    if (!selectedSession) return;
    try {
      const res = await apiService.getSessionQR(selectedSession._id);
      setQrData(res.qrData);
    } catch (err) {
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
        <LinearGradient
          colors={[theme.card, theme.elevated]}
          style={styles.permissionCard}
        >
          <View style={[styles.permissionIconBg, { backgroundColor: theme.primary + '20' }]}>
            <Text style={styles.permissionIcon}>📷</Text>
          </View>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan QR codes for attendance
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.permissionButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={requestPermission}
          >
            <LinearGradient
              colors={[theme.primary, '#2D7DD2']}
              style={styles.permissionButtonGradient}
            >
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </LinearGradient>
          </Pressable>
        </LinearGradient>
      </View>
    );
  }

  // Teacher: Session Selection and QR Display
  if (isTeacher) {
    if (selectedSession) {
      return (
        <View style={styles.container}>
          <View style={styles.qrHeader}>
            <Pressable
              onPress={() => setSelectedSession(null)}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>
            <Text style={styles.qrTitle}>Session QR Code</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.qrContainer}>
            <LinearGradient
              colors={[theme.card, theme.elevated]}
              style={styles.qrCard}
            >
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

              {/* QR Code Display Area with Glowing Border */}
              <View style={styles.qrDisplayWrapper}>
                <View style={[styles.qrGlowBorder, { shadowColor: theme.primary }]}>
                  <View style={styles.qrDisplay}>
                    {qrData ? (
                      <>
                        <View style={styles.qrPlaceholder}>
                          <Text style={styles.qrPlaceholderIcon}>⏱</Text>
                          <Text style={styles.qrPlaceholderText}>QR Token Active</Text>
                        </View>
                        <Text style={styles.qrTokenText} numberOfLines={2}>
                          {qrData}
                        </Text>
                      </>
                    ) : (
                      <View style={styles.qrLoading}>
                        <ActivityIndicator size="large" color={theme.primary} />
                        <Text style={styles.qrLoadingText}>Generating QR...</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Animated Corners */}
                <View style={[styles.qrCorner, styles.qrCornerTopLeft]} />
                <View style={[styles.qrCorner, styles.qrCornerTopRight]} />
                <View style={[styles.qrCorner, styles.qrCornerBottomLeft]} />
                <View style={[styles.qrCorner, styles.qrCornerBottomRight]} />
              </View>

              <View style={styles.qrRefreshContainer}>
                <Text style={styles.qrRefresh}>🔄 Auto-refreshes every 2 seconds</Text>
              </View>
            </LinearGradient>

            <Pressable
              style={({ pressed }) => [
                styles.stopButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={async () => {
                try {
                  await apiService.stopSession(selectedSession._id);
                  setSelectedSession(null);
                  loadActiveSessions();
                } catch (err) {
                  Alert.alert('Error', 'Failed to stop session');
                }
              }}
            >
              <LinearGradient
                colors={[theme.danger, '#D93A33']}
                style={styles.stopButtonGradient}
              >
                <Text style={styles.stopButtonText}>Stop Session</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Session</Text>
          <Text style={styles.subtitle}>Choose an active session to display QR code</Text>
        </View>

        {activeSessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={[theme.card, theme.elevated]}
              style={styles.emptyCard}
            >
              <View style={[styles.emptyIconBg, { backgroundColor: theme.textSecondary + '20' }]}>
                <Text style={styles.emptyIcon}>📭</Text>
              </View>
              <Text style={styles.emptyTitle}>No Active Sessions</Text>
              <Text style={styles.emptyText}>
                Start a new session from the attendance controls
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.startSessionButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => setShowSubjectModal(true)}
              >
                <LinearGradient
                  colors={[theme.primary, '#2D7DD2']}
                  style={styles.startSessionButtonGradient}
                >
                  <Text style={styles.startSessionButtonText}>Start Session</Text>
                </LinearGradient>
              </Pressable>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.sessionList}>
            <Text style={styles.sessionListTitle}>Active Sessions</Text>
            {activeSessions.map((session) => (
              <Pressable
                key={session._id}
                onPress={() => selectSession(session)}
                style={({ pressed }) => [
                  styles.sessionCard,
                  pressed && styles.sessionCardPressed,
                ]}
              >
                <LinearGradient
                  colors={[theme.card, theme.elevated]}
                  style={styles.sessionCardGradient}
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
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    );
  }

  // Student: QR Scanner
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.scanHeader}>
            <Text style={styles.scanTitle}>Scan QR Code</Text>
            <Text style={styles.scanSubtitle}>Point camera at the attendance QR code</Text>
          </View>

          {/* Scan Frame with Animated Corners */}
          <View style={styles.scanFrameContainer}>
            <View style={styles.scanFrame}>
              {/* Viewfinder with corners */}
              <View style={styles.viewfinder}>
                <View style={[styles.viewfinderCorner, styles.viewfinderTopLeft]} />
                <View style={[styles.viewfinderCorner, styles.viewfinderTopRight]} />
                <View style={[styles.viewfinderCorner, styles.viewfinderBottomLeft]} />
                <View style={[styles.viewfinderCorner, styles.viewfinderBottomRight]} />
              </View>

              {/* Center scanning area */}
              <View style={styles.scanArea} />
            </View>

            {/* Glow effect around frame */}
            <View style={[styles.scanGlow, { shadowColor: theme.success }]} />
          </View>

          {/* Instructions */}
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

          {/* Rescan Button */}
          {scanned && !isMarking && (
            <Pressable
              style={({ pressed }) => [
                styles.rescanButton,
                pressed && styles.rescanButtonPressed,
              ]}
              onPress={() => setScanned(false)}
            >
              <LinearGradient
                colors={[theme.success + '30', theme.success + '15']}
                style={styles.rescanButtonGradient}
              >
                <Text style={styles.rescanButtonText}>Tap to Scan Again</Text>
              </LinearGradient>
            </Pressable>
          )}
        </View>
      </CameraView>

      {/* Subject Selection Modal */}
      {showSubjectModal && (
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowSubjectModal(false)}
          />
          <LinearGradient
            colors={[theme.card, theme.elevated]}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Start Session</Text>
              <Pressable onPress={() => setShowSubjectModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>
            <Text style={styles.modalSubtitle}>Select a subject</Text>

            {subjects.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Text style={styles.modalEmptyText}>No subjects found. Create a subject first.</Text>
              </View>
            ) : (
              <View style={styles.subjectList}>
                {subjects.map((subject) => (
                  <Pressable
                    key={subject._id}
                    style={({ pressed }) => [
                      styles.subjectItem,
                      pressed && styles.subjectItemPressed,
                    ]}
                    onPress={() => startSession(subject._id)}
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
                    {isStarting && (
                      <ActivityIndicator size="small" color={theme.primary} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </LinearGradient>
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
  permissionCard: {
    alignItems: 'center',
    padding: spacing.xl,
    maxWidth: 340,
    borderRadius: 20,
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
  permissionIcon: {
    fontSize: 40,
  },
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
    borderRadius: 14,
    overflow: 'hidden',
  },
  permissionButtonGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minWidth: 180,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
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
  emptyIcon: {
    fontSize: 40,
  },
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
  startSessionButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  startSessionButtonGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  startSessionButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  sessionList: {
    padding: spacing.md,
  },
  sessionListTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: spacing.md,
  },
  sessionCard: {
    marginBottom: spacing.sm,
    borderRadius: 14,
    overflow: 'hidden',
  },
  sessionCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  },
  sessionCardGradient: {
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionInfoMain: {
    flex: 1,
  },
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
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingTop: spacing.lg,
    backgroundColor: theme.background,
  },
  backButton: {
    padding: spacing.sm,
    borderRadius: 10,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
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
    lineHeight: 22,
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
  qrPlaceholder: {
    alignItems: 'center',
  },
  qrPlaceholderIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
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
  qrLoading: {
    alignItems: 'center',
  },
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
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: spacing.xl,
  },
  stopButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  stopButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  camera: {
    flex: 1,
  },
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
    letterSpacing: -0.3,
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
    textAlign: 'center',
  },
  rescanButton: {
    position: 'absolute',
    bottom: 60,
    borderRadius: 25,
    overflow: 'hidden',
  },
  rescanButtonPressed: {
    opacity: 0.8,
  },
  rescanButtonGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  rescanButtonText: {
    color: theme.success,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: '70%',
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
    fontSize: fontSize.md,
    color: theme.textSecondary,
    marginBottom: spacing.lg,
  },
  modalEmpty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  modalEmptyText: {
    fontSize: fontSize.md,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  subjectList: {
    gap: spacing.sm,
  },
  subjectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.border,
  },
  subjectItemPressed: {
    opacity: 0.7,
  },
  subjectIconBg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  subjectIcon: {
    fontSize: 18,
  },
  subjectInfo: {
    flex: 1,
  },
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
});
