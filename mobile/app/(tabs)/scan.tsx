/**
 * Beautified Scan Screen - QR Scanner for Students / QR Display for Teachers
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
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { Card, Button, Badge } from '@/components/ui';
import { colors, spacing, fontSize, borderRadius, shadows } from '@/constants/theme';

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

  const isTeacher = user?.role === 'TEACHER';

  useEffect(() => {
    if (isTeacher) {
      loadActiveSessions();
    }
  }, []);

  useEffect(() => {
    if (isTeacher && selectedSession) {
      // Poll for new QR tokens every 2 seconds
      const interval = setInterval(fetchQRToken, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedSession]);

  async function loadActiveSessions() {
    try {
      const res = await apiService.getActiveSessions();
      setActiveSessions(res.sessions);
    } catch (err) {
      console.error('Error loading sessions:', err);
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

      const res = await apiService.markAttendance(qrData.sessionId, data);

      Alert.alert(
        '✅ Success!',
        'Your attendance has been marked successfully.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to mark attendance';
      Alert.alert('❌ Error', message, [{ text: 'OK', onPress: () => setScanned(false) }]);
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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Card style={styles.permissionCard}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan QR codes for attendance
          </Text>
          <Button
            title="Grant Permission"
            onPress={requestPermission}
            style={styles.permissionButton}
          />
        </Card>
      </View>
    );
  }

  // Teacher: Session Selection and QR Display
  if (isTeacher) {
    if (selectedSession) {
      return (
        <View style={styles.container}>
          <View style={styles.qrHeader}>
            <TouchableOpacity onPress={() => setSelectedSession(null)}>
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.qrTitle}>Session QR Code</Text>
          </View>

          <View style={styles.qrContainer}>
            <Card style={styles.qrCard}>
              <Badge text="LIVE" variant="success" />
              <Text style={styles.qrSubjectName}>
                {(selectedSession.subjectId as any)?.name}
              </Text>
              <Text style={styles.qrInstructions}>
                Students can scan this QR code to mark attendance
              </Text>

              {/* QR Code Display Area */}
              <View style={styles.qrDisplay}>
                {qrData ? (
                  <Text style={styles.qrTokenText}>{qrData.slice(0, 50)}...</Text>
                ) : (
                  <ActivityIndicator size="large" color={colors.primary} />
                )}
              </View>

              <Text style={styles.qrRefresh}>
                🔄 Refreshes every 2 seconds
              </Text>
            </Card>

            <Button
              title="Stop Session"
              onPress={async () => {
                try {
                  await apiService.stopSession(selectedSession._id);
                  setSelectedSession(null);
                  loadActiveSessions();
                } catch (err) {
                  Alert.alert('Error', 'Failed to stop session');
                }
              }}
              variant="danger"
              style={styles.stopButton}
            />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Session</Text>
          <Text style={styles.subtitle}>Choose an active session to display QR</Text>
        </View>

        {activeSessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>No Active Sessions</Text>
              <Text style={styles.emptyText}>
                Start a new session from the attendance controls
              </Text>
            </Card>
          </View>
        ) : (
          <View style={styles.sessionList}>
            {activeSessions.map((session) => (
              <TouchableOpacity
                key={session._id}
                onPress={() => selectSession(session)}
              >
                <Card style={styles.sessionCard}>
                  <View style={styles.sessionHeader}>
                    <View>
                      <Text style={styles.sessionSubject}>
                        {(session.subjectId as any)?.name}
                      </Text>
                      <Text style={styles.sessionCode}>
                        {(session.subjectId as any)?.code}
                      </Text>
                    </View>
                    <Badge text="LIVE" variant="success" size="sm" />
                  </View>
                  <Text style={styles.tapHint}>Tap to show QR →</Text>
                </Card>
              </TouchableOpacity>
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
          {/* Scan Frame */}
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          <Text style={styles.instruction}>
            {isMarking ? '⏳ Marking attendance...' : 'Point camera at QR code'}
          </Text>

          {scanned && !isMarking && (
            <Button
              title="Tap to Scan Again"
              onPress={() => setScanned(false)}
              variant="outline"
              style={styles.rescanButton}
            />
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  permissionCard: {
    alignItems: 'center',
    padding: spacing.xl,
    maxWidth: 320,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  permissionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  permissionText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  permissionButton: {
    minWidth: 200,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sessionList: {
    padding: spacing.md,
  },
  sessionCard: {
    marginBottom: spacing.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionSubject: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  sessionCode: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tapHint: {
    fontSize: fontSize.sm,
    color: colors.primary,
    marginTop: spacing.md,
    fontWeight: '500',
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  backButton: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  qrTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  qrContainer: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  qrCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  qrSubjectName: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  qrInstructions: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  qrDisplay: {
    width: SCAN_AREA_SIZE * 0.8,
    height: SCAN_AREA_SIZE * 0.8,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.primary,
  },
  qrTokenText: {
    fontSize: fontSize.xs,
    color: colors.gray600,
    textAlign: 'center',
    padding: spacing.md,
  },
  qrRefresh: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  stopButton: {
    marginTop: spacing.xl,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.white,
    borderTopLeftRadius: borderRadius.md,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.white,
    borderTopRightRadius: borderRadius.md,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.white,
    borderBottomLeftRadius: borderRadius.md,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.white,
    borderBottomRightRadius: borderRadius.md,
  },
  instruction: {
    color: colors.white,
    fontSize: fontSize.lg,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  rescanButton: {
    marginTop: spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: colors.white,
  },
});
