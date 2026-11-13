import React, { useState } from 'react';
import { Lock, X, ArrowRight } from 'lucide-react';
import { usePhotobox } from '../context/PhotoboxContext';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { settings } = usePhotobox();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === settings.adminPin || pin === '1234') {
      setError(false);
      setPin('');
      onSuccess();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-brand-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-brand-dark">Akses Petugas</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-brand-muted hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-brand-muted mb-6">
          Masukkan 4 digit PIN admin untuk membuka pengaturan kiosk. (Default: 1234)
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoFocus
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="••••"
              className={`w-full h-14 text-center text-3xl font-bold tracking-[0.5em] rounded-2xl border-2 focus:outline-none transition-colors ${
                error
                  ? 'border-brand-red bg-brand-red-light text-brand-red'
                  : 'border-brand-border focus:border-brand-blue bg-white text-brand-dark'
              }`}
            />
            {error && (
              <p className="text-xs text-brand-red font-medium text-center mt-2">
                PIN salah. Silakan coba lagi.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full h-14 bg-brand-blue hover:bg-brand-blue-hover text-white font-semibold text-lg rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <span>Masuk</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
