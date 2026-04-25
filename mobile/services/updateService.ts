import * as Updates from 'expo-updates';
import { router } from 'expo-router';

class UpdateService {
  private isChecking = false;
  private updateListener: any = null;

  async initialize() {
    if (__DEV__) {
      console.log('[UpdateService] Dev mode - skipping update check');
      return;
    }

    try {
      // Check for available updates
      const update = await Updates.checkAsync();

      if (update.isAvailable) {
        console.log('[UpdateService] Update available, downloading...');
        await Updates.fetchAsync();
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
      const update = await Updates.checkAsync();

      if (update.isAvailable) {
        console.log(`[UpdateService] Update ${update.version} available`);
        await Updates.fetchAsync();
        return { available: true, version: update.version };
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
      const update = await Updates.checkAsync();

      if (update.isAvailable) {
        await Updates.fetchAsync();
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

    this.updateListener = Updates.addListener((event) => {
      console.log('[UpdateService] Update event:', event.action);

      if (event.action === Updates.UpdateEventAction.UPDATE_AVAILABLE) {
        console.log('[UpdateService] New update ready');
      }

      if (event.action === Updates.UpdateEventAction.ERROR) {
        console.error('[UpdateService] Update error:', event.message);
      }
    });
  }

  cleanup() {
    if (this.updateListener) {
      this.updateListener.remove();
      this.updateListener = null;
    }
  }

  async getUpdateInfo() {
    if (__DEV__) {
      return {
        isDev: true,
        version: '0.0.0',
        channel: 'development',
      };
    }

    const update = await Updates.readableUpdatesInfo();
    const channel = await Updates.getAdditionalUserPropertiesAsync();

    return {
      isDev: false,
      version: update.manifest.version,
      channel: 'production', // or from update.manifest.extra if configured
    };
  }
}

export const updateService = new UpdateService();