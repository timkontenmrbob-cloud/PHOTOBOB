import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  ScreenState,
  FrameItem,
  AdminSettings,
  VisitorSession,
} from '../types';
import { loadSettings, saveSettings } from '../services/storage';
import {
  saveFrameAsset,
  deleteFrameAsset,
  getAllCustomFrames,
} from '../services/db';
import { composePhotoboxLayout } from '../services/compositor';
import { printerService } from '../services/printer';
import { wakeLockService } from '../services/wakelock';

const DEFAULT_FRAMES: FrameItem[] = [
  {
    id: 'frame-1',
    name: 'Bingkai 1',
    styleName: 'Classic',
    defaultUrl: '/frames/frame-1.png',
  },
  {
    id: 'frame-2',
    name: 'Bingkai 2',
    styleName: 'Retro',
    defaultUrl: '/frames/frame-2.png',
  },
  {
    id: 'frame-3',
    name: 'Bingkai 3',
    styleName: 'Fun',
    defaultUrl: '/frames/frame-3.png',
  },
];

function generateSessionId(): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PBX-${dateStr}-${randomSuffix}`;
}

interface PhotoboxContextType {
  screen: ScreenState;
  setScreen: (screen: ScreenState) => void;
  frames: FrameItem[];
  selectedFrame: FrameItem;
  settings: AdminSettings;
  session: VisitorSession;
  isAdminOpen: boolean;
  isComposing: boolean;

  // Visitor Flow actions
  startVisitorSession: () => void;
  selectFrame: (frameId: string) => void;
  proceedToCamera: () => void;
  backToFrameSelection: () => void;
  handlePhotoCaptured: (photoBlob: Blob) => Promise<void>;
  retakePhoto: () => void;
  printPhoto: () => Promise<void>;
  confirmDesktopPrintSuccess: () => void;
  retryDesktopPrint: () => void;
  resetToWelcome: () => void;

  // Admin Actions
  openAdmin: () => void;
  closeAdmin: () => void;
  updateSettings: (newSettings: AdminSettings) => void;
  uploadCustomFrame: (frameId: string, file: File) => Promise<void>;
  resetCustomFrame: (frameId: string) => Promise<void>;
}

const PhotoboxContext = createContext<PhotoboxContextType | null>(null);

export const PhotoboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [screen, setScreen] = useState<ScreenState>('welcome');
  const [settings, setSettingsState] = useState<AdminSettings>(loadSettings);
  const [frames, setFrames] = useState<FrameItem[]>(DEFAULT_FRAMES);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const [session, setSession] = useState<VisitorSession>(() => ({
    sessionId: generateSessionId(),
    selectedFrameId: 'frame-1',
    capturedPhotoBlob: null,
    capturedPhotoUrl: null,
    composedPrintBlob: null,
    composedPrintBase64: null,
    composedPreviewUrl: null,
    hasPrinted: false,
    printStatus: 'idle',
    printErrorMessage: null,
    printErrorFix: null,
    createdAt: Date.now(),
  }));

  const inactivityTimerRef = useRef<number | null>(null);

  // Initialize WakeLock
  useEffect(() => {
    wakeLockService.setEnabled(settings.enableWakeLock);
  }, [settings.enableWakeLock]);

  // Load custom frames from IndexedDB
  const refreshFramesFromDb = useCallback(async () => {
    try {
      const customMap = await getAllCustomFrames();
      setFrames(
        DEFAULT_FRAMES.map((f) => {
          if (customMap[f.id]) {
            return {
              ...f,
              customDataUrl: customMap[f.id],
              isCustom: true,
            };
          }
          return f;
        })
      );
    } catch (e) {
      console.warn('Gagal memuat custom frames dari IndexedDB:', e);
    }
  }, []);

  useEffect(() => {
    refreshFramesFromDb();
  }, [refreshFramesFromDb]);

  // Selected frame item
  const selectedFrame =
    frames.find((f) => f.id === session.selectedFrameId) || frames[0];

  // Reset to Welcome Screen
  const resetToWelcome = useCallback(() => {
    if (session.capturedPhotoUrl) URL.revokeObjectURL(session.capturedPhotoUrl);
    if (session.composedPreviewUrl) URL.revokeObjectURL(session.composedPreviewUrl);

    setSession({
      sessionId: generateSessionId(),
      selectedFrameId: 'frame-1',
      capturedPhotoBlob: null,
      capturedPhotoUrl: null,
      composedPrintBlob: null,
      composedPrintBase64: null,
      composedPreviewUrl: null,
      hasPrinted: false,
      printStatus: 'idle',
      printErrorMessage: null,
      printErrorFix: null,
      createdAt: Date.now(),
    });

    setScreen('welcome');
  }, [session.capturedPhotoUrl, session.composedPreviewUrl]);

  // Inactivity timeout handler
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current !== null) {
      window.clearTimeout(inactivityTimerRef.current);
    }

    // Only apply inactivity timeout when visitor is in middle of session (frame-selection, camera, preview)
    // Never reset during 'printing' or 'welcome' or 'admin'
    if (
      screen !== 'welcome' &&
      screen !== 'printing' &&
      screen !== 'print-confirm' &&
      screen !== 'success' &&
      !isAdminOpen
    ) {
      inactivityTimerRef.current = window.setTimeout(() => {
        console.log('Inactivity timeout reached. Resetting session to welcome screen.');
        resetToWelcome();
      }, (settings.inactivityTimeoutSeconds || 60) * 1000);
    }
  }, [screen, isAdminOpen, settings.inactivityTimeoutSeconds, resetToWelcome]);

  // Listen for user interactions to reset inactivity timer
  useEffect(() => {
    resetInactivityTimer();
    const handleActivity = () => resetInactivityTimer();
    window.addEventListener('pointerdown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    return () => {
      if (inactivityTimerRef.current !== null) {
        window.clearTimeout(inactivityTimerRef.current);
      }
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [resetInactivityTimer]);

  // 1. Start Visitor Session
  const startVisitorSession = useCallback(() => {
    // Revoke previous URLs
    if (session.capturedPhotoUrl) URL.revokeObjectURL(session.capturedPhotoUrl);
    if (session.composedPreviewUrl) URL.revokeObjectURL(session.composedPreviewUrl);

    setSession({
      sessionId: generateSessionId(),
      selectedFrameId: 'frame-1',
      capturedPhotoBlob: null,
      capturedPhotoUrl: null,
      composedPrintBlob: null,
      composedPrintBase64: null,
      composedPreviewUrl: null,
      hasPrinted: false,
      printStatus: 'idle',
      printErrorMessage: null,
      printErrorFix: null,
      createdAt: Date.now(),
    });

    setScreen('frame-selection');
  }, [session.capturedPhotoUrl, session.composedPreviewUrl]);

  // 2. Select Frame
  const selectFrame = useCallback((frameId: string) => {
    setSession((prev) => ({ ...prev, selectedFrameId: frameId }));
  }, []);

  // 3. Proceed to Camera
  const proceedToCamera = useCallback(() => {
    setScreen('camera');
  }, []);

  const backToFrameSelection = useCallback(() => {
    setScreen('frame-selection');
  }, []);

  // 4. Handle Photo Captured
  const handlePhotoCaptured = useCallback(
    async (photoBlob: Blob) => {
      setIsComposing(true);
      const photoUrl = URL.createObjectURL(photoBlob);
      const activeFrame =
        frames.find((f) => f.id === session.selectedFrameId) || frames[0];
      const frameUrl = activeFrame.customDataUrl || activeFrame.defaultUrl;

      setSession((prev) => ({
        ...prev,
        capturedPhotoBlob: photoBlob,
        capturedPhotoUrl: photoUrl,
      }));

      // Navigate to preview
      setScreen('preview');

      try {
        const result = await composePhotoboxLayout({
          photoBlob,
          frameUrl,
          settings,
          sessionRef: session.sessionId,
        });

        setSession((prev) => ({
          ...prev,
          composedPrintBase64: result.cleanterBase64,
          composedPreviewUrl: result.thermalPreviewUrl, // Simulated thermal view for high fidelity
        }));
      } catch (err) {
        console.error('Gagal membuat komposisi foto:', err);
      } finally {
        setIsComposing(false);
      }
    },
    [frames, session.selectedFrameId, session.sessionId, settings]
  );

  // 5. Retake Photo
  const retakePhoto = useCallback(() => {
    if (session.capturedPhotoUrl) URL.revokeObjectURL(session.capturedPhotoUrl);
    setSession((prev) => ({
      ...prev,
      capturedPhotoBlob: null,
      capturedPhotoUrl: null,
      composedPrintBlob: null,
      composedPrintBase64: null,
      composedPreviewUrl: null,
      printStatus: 'idle',
      printErrorMessage: null,
      printErrorFix: null,
    }));
    setScreen('camera');
  }, [session.capturedPhotoUrl]);

  // 6. Print Photo
  const printPhoto = useCallback(async () => {
    // Prevent double submission
    if (session.hasPrinted || session.printStatus === 'printing') {
      console.warn('Pencetakan sudah selesai atau sedang berjalan.');
      return;
    }

    if (!session.composedPrintBase64) {
      console.error('Data gambar cetak belum siap.');
      return;
    }

    setSession((prev) => ({
      ...prev,
      printStatus: 'printing',
      printErrorMessage: null,
      printErrorFix: null,
    }));
    setScreen('printing');

    const result = await printerService.printPhotobox({
      base64Image: session.composedPrintBase64,
      previewUrl: session.composedPreviewUrl || '',
      sessionRef: session.sessionId,
      settings,
    });

    if (result.success) {
      if (result.needsConfirmation) {
        // Desktop Browser Print was opened; wait for user/operator to confirm physical output
        setSession((prev) => ({
          ...prev,
          printStatus: 'confirming',
        }));
        setScreen('print-confirm');
      } else {
        // Direct confirmed print (Android Cleanter)
        setSession((prev) => ({
          ...prev,
          hasPrinted: true,
          printStatus: 'success',
        }));
        setScreen('success');
      }
    } else {
      setSession((prev) => ({
        ...prev,
        printStatus: 'error',
        printErrorMessage:
          result.errorMessage || 'Printer sedang bermasalah. Silakan panggil petugas.',
        printErrorFix: result.errorFix || null,
      }));
      setScreen('print-error');
    }
  }, [
    session.hasPrinted,
    session.printStatus,
    session.composedPrintBase64,
    session.composedPreviewUrl,
    session.sessionId,
    settings,
  ]);

  // Operator confirms desktop print was physically successful
  const confirmDesktopPrintSuccess = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      hasPrinted: true,
      printStatus: 'success',
    }));
    setScreen('success');
  }, []);

  // Operator reports desktop print did not finish properly; return to preview to retry
  const retryDesktopPrint = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      printStatus: 'idle',
      printErrorMessage: null,
      printErrorFix: null,
    }));
    setScreen('preview');
  }, []);


  // Admin Methods
  const openAdmin = useCallback(() => setIsAdminOpen(true), []);
  const closeAdmin = useCallback(() => setIsAdminOpen(false), []);

  const updateSettings = useCallback((newSettings: AdminSettings) => {
    saveSettings(newSettings);
    setSettingsState(newSettings);
  }, []);

  const uploadCustomFrame = useCallback(
    async (frameId: string, file: File) => {
      await saveFrameAsset(frameId, file);
      await refreshFramesFromDb();
    },
    [refreshFramesFromDb]
  );

  const resetCustomFrame = useCallback(
    async (frameId: string) => {
      await deleteFrameAsset(frameId);
      await refreshFramesFromDb();
    },
    [refreshFramesFromDb]
  );

  return (
    <PhotoboxContext.Provider
      value={{
        screen,
        setScreen,
        frames,
        selectedFrame,
        settings,
        session,
        isAdminOpen,
        isComposing,
        startVisitorSession,
        selectFrame,
        proceedToCamera,
        backToFrameSelection,
        handlePhotoCaptured,
        retakePhoto,
        printPhoto,
        confirmDesktopPrintSuccess,
        retryDesktopPrint,
        resetToWelcome,
        openAdmin,
        closeAdmin,
        updateSettings,
        uploadCustomFrame,
        resetCustomFrame,
      }}
    >
      {children}
    </PhotoboxContext.Provider>
  );
};

export const usePhotobox = (): PhotoboxContextType => {
  const context = useContext(PhotoboxContext);
  if (!context) {
    throw new Error('usePhotobox must be used within a PhotoboxProvider');
  }
  return context;
};
