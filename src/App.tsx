import React, { useState } from 'react';
import { PhotoboxProvider, usePhotobox } from './context/PhotoboxContext';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { FrameSelectionScreen } from './screens/FrameSelectionScreen';
import { CameraScreen } from './screens/CameraScreen';
import { PhotoPreviewScreen } from './screens/PhotoPreviewScreen';
import { PrintingScreen } from './screens/PrintingScreen';
import { SuccessScreen } from './screens/SuccessScreen';
import { AdminPinModal } from './components/AdminPinModal';
import { AdminSettingsScreen } from './screens/AdminSettingsScreen';

const PhotoboxMain: React.FC = () => {
  const { screen, isAdminOpen, closeAdmin } = usePhotobox();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // When isAdminOpen triggers from context
  React.useEffect(() => {
    if (isAdminOpen) {
      if (!isAdminAuthenticated) {
        setIsPinModalOpen(true);
      }
    } else {
      setIsPinModalOpen(false);
    }
  }, [isAdminOpen, isAdminAuthenticated]);

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    setIsAdminAuthenticated(true);
  };

  const handleCloseAdmin = () => {
    setIsAdminAuthenticated(false);
    closeAdmin();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      {/* Mobile container - optimized for Samsung Galaxy A35 portrait */}
      <div className="w-full max-w-[430px] min-h-screen bg-white shadow-xl flex flex-col relative overflow-hidden">
        {screen === 'welcome' && <WelcomeScreen />}
        {screen === 'frame-selection' && <FrameSelectionScreen />}
        {screen === 'camera' && <CameraScreen />}
        {screen === 'preview' && <PhotoPreviewScreen />}
        {(screen === 'printing' || screen === 'print-confirm' || screen === 'print-error') && <PrintingScreen />}
        {screen === 'success' && <SuccessScreen />}

        {/* Admin PIN Gate */}
        <AdminPinModal
          isOpen={isPinModalOpen}
          onClose={() => {
            setIsPinModalOpen(false);
            closeAdmin();
          }}
          onSuccess={handlePinSuccess}
        />

        {/* Protected Admin Settings Dashboard */}
        {isAdminAuthenticated && (
          <AdminSettingsScreen onClose={handleCloseAdmin} />
        )}
      </div>
    </div>
  );
};

export function App() {
  return (
    <PhotoboxProvider>
      <PhotoboxMain />
    </PhotoboxProvider>
  );
}

export default App;
