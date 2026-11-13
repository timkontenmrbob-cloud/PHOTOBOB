class WakeLockService {
  private sentinel: WakeLockSentinel | null = null;
  private isEnabled = true;

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.isEnabled) {
          this.requestLock();
        }
      });
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.releaseLock();
    } else {
      this.requestLock();
    }
  }

  public async requestLock(): Promise<boolean> {
    if (!this.isEnabled) return false;
    if ('wakeLock' in navigator) {
      try {
        if (!this.sentinel) {
          this.sentinel = await navigator.wakeLock.request('screen');
          this.sentinel.addEventListener('release', () => {
            this.sentinel = null;
          });
          return true;
        }
        return true;
      } catch (err) {
        console.warn('Screen WakeLock tidak dapat diaktifkan:', err);
        return false;
      }
    }
    return false;
  }

  public releaseLock(): void {
    if (this.sentinel) {
      this.sentinel.release().catch(() => {});
      this.sentinel = null;
    }
  }

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  }
}

export const wakeLockService = new WakeLockService();
