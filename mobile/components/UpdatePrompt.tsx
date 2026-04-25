import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { updateService } from '@/services/updateService';

interface UpdatePromptProps {
  onUpdateReady?: () => void;
  onDismiss?: () => void;
}

export function UpdatePrompt({ onUpdateReady, onDismiss }: UpdatePromptProps) {
  const [checking, setChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [version, setVersion] = useState('');

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    if (__DEV__) return;

    setChecking(true);
    try {
      const result = await updateService.checkAndDownload();
      if (result.available) {
        setUpdateAvailable(true);
        setVersion(result.version || 'new version');
      }
    } finally {
      setChecking(false);
    }
  };

  const handleDownloadAndApply = async () => {
    setDownloading(true);
    try {
      const applied = await updateService.downloadAndApply();
      if (applied && onUpdateReady) {
        onUpdateReady();
      }
    } finally {
      setDownloading(false);
    }
  };

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.text}>Checking for updates...</Text>
      </View>
    );
  }

  if (!updateAvailable) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Update Available</Text>
        <Text style={styles.text}>Version {version} is ready to install</Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleDownloadAndApply}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Install Now</Text>
            )}
          </TouchableOpacity>

          {onDismiss && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onDismiss}
            >
              <Text style={styles.secondaryButtonText}>Later</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    padding: 16,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
  },
  secondaryButtonText: {
    color: '#333',
  },
});