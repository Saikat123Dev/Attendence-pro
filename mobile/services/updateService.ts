import * as Updates from 'expo-updates';
import { router } from 'expo-router';

class UpdateService {
  private isChecking = false;

  async initialize() {
    if (__DEV__) {
      console.log('[UpdateService] Dev mode - skipping update check');
      return;
    }

    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        console.log('[UpdateService] Update available, downloading...');
        await Updates.fetchUpdateAsync();
        console.log('[UpdateService] Update downloaded, will apply on next launch');
      }
    } catch (error) {
      console.error('[UpdateService] Update check failed:', error);
    }
  }

  async checkAndDownload(): Promise<{ available: boolean; version?: string }> {
    if (__DEV__ || this.isChecking) {
      return { available: false };
    }

    this.isChecking = true;

    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        console.log('[UpdateService] Update available');
        await Updates.fetchUpdateAsync();
        return { available: true };
      }
      return { available: false };
    } catch (error) {
      console.error('[UpdateService] Check failed:', error);
      return { available: false };
    } finally {
      this.isChecking = false;
    }
  }

  async downloadAndApply(): Promise<boolean> {
    if (__DEV__) return false;

    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
        return true;
      }
      return false;
    } catch (error) {
      console.error('[UpdateService] Download failed:', error);
      return false;
    }
  }

  setupAutoUpdate() {
    if (__DEV__) return;
    // Auto-update is handled by expo-updates automatically in production
  }

  cleanup() {
    // No listener to clean up with new API
  }

  async getUpdateInfo() {
    if (__DEV__) {
      return {
        isDev: true,
        version: '0.0.0',
        channel: 'development',
      };
    }

    try {
      const update = await Updates.checkForUpdateAsync();
      return {
        isDev: false,
        version: 'latest',
        channel: 'production',
      };
    } catch {
      return {
        isDev: false,
        version: 'unknown',
        channel: 'production',
      };
    }
  }
}

export const updateService = new UpdateService();
