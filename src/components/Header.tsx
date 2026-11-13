import React, { useRef, useState } from 'react';
import { usePhotobox } from '../context/PhotoboxContext';

interface HeaderProps {
  showTitle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showTitle = true }) => {
  const { settings, openAdmin } = usePhotobox();
  const [pressProgress, setPressProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const startLongPress = () => {
    let current = 0;
    intervalRef.current = window.setInterval(() => {
      current += 100;
      setPressProgress(Math.min(100, (current / 5000) * 100));
    }, 100);

    timerRef.current = window.setTimeout(() => {
      clearTimers();
      openAdmin();
    }, 5000); // 5 seconds long press to enter Admin
  };

  const clearTimers = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    timerRef.current = null;
    intervalRef.current = null;
    setPressProgress(0);
  };

  return (
    <header className="w-full py-4 px-6 flex items-center justify-between relative bg-white border-b border-brand-border">
      {showTitle && (
        <div
          onPointerDown={startLongPress}
          onPointerUp={clearTimers}
          onPointerLeave={clearTimers}
          className="mx-auto cursor-pointer select-none text-center relative py-1 px-4 rounded-lg active:bg-brand-blue-light transition-colors"
          title="Tahan 5 detik untuk Pengaturan Petugas"
        >
          <span className="text-xl font-extrabold tracking-wider text-brand-dark uppercase">
            {settings.appTitle || 'PHOTOBOX'}
          </span>
          {pressProgress > 0 && (
            <div className="absolute -bottom-1 left-0 right-0 h-1 bg-brand-border rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-blue transition-all duration-100 ease-linear"
                style={{ width: `${pressProgress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </header>
  );
};
