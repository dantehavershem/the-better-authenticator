import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, AlertCircle, X, ShieldAlert } from 'lucide-react';
import { hashPin } from '../utils/storage';

interface PinLockModalProps {
  mode: 'unlock' | 'setup' | 'disable';
  currentPinHash?: string;
  onSuccess: (newHash?: string) => void;
  onClose?: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  mode,
  currentPinHash,
  onSuccess,
  onClose,
}) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    if (mode === 'unlock') {
      const inputHash = await hashPin(pin);
      if (inputHash === currentPinHash) {
        onSuccess();
      } else {
        setError('Incorrect PIN. Please try again.');
        setPin('');
      }
    } else if (mode === 'setup') {
      if (pin !== confirmPin) {
        setError('PIN numbers do not match');
        return;
      }
      const newHash = await hashPin(pin);
      onSuccess(newHash);
    } else if (mode === 'disable') {
      const inputHash = await hashPin(pin);
      if (inputHash === currentPinHash) {
        onSuccess(undefined);
      } else {
        setError('Incorrect current PIN');
      }
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (mode === 'setup' && pin.length >= 4 && confirmPin.length < 6) {
      setConfirmPin((prev) => prev + digit);
    } else if (pin.length < 6) {
      setPin((prev) => prev + digit);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-900 dark:text-slate-100 text-center">
        {onClose && mode !== 'unlock' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
          {mode === 'unlock' ? <Lock className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
        </div>

        <h3 className="font-bold text-lg mb-1">
          {mode === 'unlock'
            ? 'Vault Locked'
            : mode === 'setup'
            ? 'Set Vault Security PIN'
            : 'Disable Security PIN'}
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          {mode === 'unlock'
            ? 'Enter your master PIN to access organized 2FA codes'
            : mode === 'setup'
            ? 'Create a 4-to-6 digit PIN to lock this authenticator vault'
            : 'Enter your current PIN to remove vault protection'}
        </p>

        {error && (
          <div className="mb-4 p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus
              maxLength={8}
              placeholder={mode === 'setup' ? 'Enter new PIN' : 'Enter PIN'}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center tracking-[0.5em] text-2xl font-mono py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {mode === 'setup' && (
            <div>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                placeholder="Confirm new PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[0.5em] text-2xl font-mono py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Quick numpad for touch or mouse */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '⌫'].map((item) => (
              <button
                key={String(item)}
                type="button"
                onClick={() => {
                  if (item === 'C') {
                    setPin('');
                    setConfirmPin('');
                  } else if (item === '⌫') {
                    if (mode === 'setup' && confirmPin.length > 0) {
                      setConfirmPin((prev) => prev.slice(0, -1));
                    } else {
                      setPin((prev) => prev.slice(0, -1));
                    }
                  } else {
                    handleKeypadPress(String(item));
                  }
                }}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-mono text-sm font-semibold rounded-lg transition-colors"
              >
                {item}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            {mode === 'unlock' ? (
              <>
                <Unlock className="w-4 h-4" />
                <span>Unlock Vault</span>
              </>
            ) : (
              <span>Confirm PIN</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
