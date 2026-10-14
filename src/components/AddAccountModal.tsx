import React, { useState, useRef } from 'react';
import jsQR from 'jsqr';
import {
  X,
  QrCode,
  Key,
  Link,
  Upload,
  Camera,
  Check,
  AlertCircle,
  Folder as FolderIcon,
  Plus,
  Shield,
} from 'lucide-react';
import { AccountOtp, Folder, OtpAlgorithm, OtpType } from '../types/auth';
import { parseOtpAuthUri } from '../utils/totp';

interface AddAccountModalProps {
  folders: Folder[];
  currentFolderId: string;
  onClose: () => void;
  onSave: (account: Omit<AccountOtp, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => void;
  onCreateFolderClick: () => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  folders,
  currentFolderId,
  onClose,
  onSave,
  onCreateFolderClick,
}) => {
  const [tab, setTab] = useState<'scan' | 'manual' | 'uri'>('scan');

  // Form state
  const [issuer, setIssuer] = useState('');
  const [accountName, setAccountName] = useState('');
  const [secret, setSecret] = useState('');
  const [folderId, setFolderId] = useState(
    currentFolderId !== 'all' && currentFolderId !== 'pinned' && currentFolderId !== 'uncategorized'
      ? currentFolderId
      : folders[0]?.id || 'none'
  );
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState<OtpType>('totp');
  const [algorithm, setAlgorithm] = useState<OtpAlgorithm>('SHA1');
  const [digits, setDigits] = useState<number>(6);
  const [period, setPeriod] = useState<number>(30);
  const [isPinned, setIsPinned] = useState(false);

  // Scanner state
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Stop camera on unmount or tab switch
  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsScanningCamera(false);
  };

  const handleStartCamera = async () => {
    setScanError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanningCamera(true);
        requestAnimationFrame(tickCamera);
      }
    } catch (err: any) {
      setScanError(
        'Unable to access camera. Please make sure camera permissions are allowed, or upload a QR screenshot below.'
      );
    }
  };

  const tickCamera = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(tickCamera);
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code && code.data) {
      stopCamera();
      handleScannedData(code.data);
      return;
    }

    animFrameRef.current = requestAnimationFrame(tickCamera);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          handleScannedData(code.data);
        } else {
          setScanError('No 2FA QR code detected in the selected image. Please check the image and try again.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleScannedData = (data: string) => {
    const parsed = parseOtpAuthUri(data);
    if (parsed) {
      if (parsed.issuer) setIssuer(parsed.issuer);
      if (parsed.accountName) setAccountName(parsed.accountName);
      if (parsed.secret) setSecret(parsed.secret);
      if (parsed.algorithm) setAlgorithm(parsed.algorithm);
      if (parsed.digits) setDigits(parsed.digits);
      if (parsed.period) setPeriod(parsed.period);
      if (parsed.type) setType(parsed.type);
      setScanSuccess(`Detected 2FA QR code for ${parsed.issuer || 'Account'} (${parsed.accountName || ''})`);
      setTab('manual');
    } else {
      setScanError(`QR code did not contain a valid otpauth:// URI: ${data.slice(0, 50)}...`);
    }
  };

  const handlePasteUri = (rawUri: string) => {
    const parsed = parseOtpAuthUri(rawUri);
    if (parsed) {
      if (parsed.issuer) setIssuer(parsed.issuer);
      if (parsed.accountName) setAccountName(parsed.accountName);
      if (parsed.secret) setSecret(parsed.secret);
      if (parsed.algorithm) setAlgorithm(parsed.algorithm);
      if (parsed.digits) setDigits(parsed.digits);
      if (parsed.period) setPeriod(parsed.period);
      if (parsed.type) setType(parsed.type);
      setTab('manual');
      setScanSuccess('OTP Auth URI parsed successfully!');
    } else {
      setScanError('Invalid otpauth:// URI format. Example: otpauth://totp/GitHub:alex?secret=JBSWY3DPEHPK3PXP');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSecret = secret.toUpperCase().replace(/\s+/g, '');
    if (!cleanSecret) {
      setScanError('Secret key is required.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
      .filter(Boolean);

    onSave({
      issuer: issuer.trim() || 'Custom Service',
      accountName: accountName.trim() || 'user',
      secret: cleanSecret,
      algorithm,
      digits,
      period,
      type,
      folderId: folderId || 'none',
      tags,
      notes: notes.trim() || undefined,
      isPinned,
    });
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-6 text-slate-900 dark:text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-base">Add Two-Factor Code</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg my-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setTab('scan');
            }}
            className={`py-1.5 flex items-center justify-center gap-1.5 rounded-md transition-colors ${
              tab === 'scan'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR</span>
          </button>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setTab('uri');
            }}
            className={`py-1.5 flex items-center justify-center gap-1.5 rounded-md transition-colors ${
              tab === 'uri'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>Paste URI</span>
          </button>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              setTab('manual');
            }}
            className={`py-1.5 flex items-center justify-center gap-1.5 rounded-md transition-colors ${
              tab === 'manual'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Manual Entry</span>
          </button>
        </div>

        {scanError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{scanError}</span>
          </div>
        )}

        {scanSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{scanSuccess}</span>
          </div>
        )}

        {/* Tab 1: Scan QR */}
        {tab === 'scan' && (
          <div className="space-y-4 py-2">
            {isScanningCamera ? (
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-dashed border-blue-500/80 m-8 rounded-lg pointer-events-none" />
                <button
                  type="button"
                  onClick={stopCamera}
                  className="absolute bottom-3 px-3 py-1.5 bg-slate-900/80 text-white text-xs rounded-md backdrop-blur-xs"
                >
                  Cancel Camera
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleStartCamera}
                  className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all text-center group cursor-pointer"
                >
                  <Camera className="w-8 h-8 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2 transition-colors" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Scan with Webcam</span>
                  <span className="text-[11px] text-slate-500 mt-1">Point camera at QR code</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all text-center group cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2 transition-colors" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Upload Screenshot</span>
                  <span className="text-[11px] text-slate-500 mt-1">PNG, JPG, or WebP image</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setTab('manual')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Or enter 16-character secret key manually
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Paste URI */}
        {tab === 'uri' && (
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Paste otpauth:// URI
              </label>
              <textarea
                rows={3}
                placeholder="otpauth://totp/Example:alice@google.com?secret=JBSWY3DPEHPK3PXP&issuer=Example"
                onChange={(e) => handlePasteUri(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Pasting a valid URI will automatically extract service name, account, secret, and parameters.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Manual Entry / Detailed Form */}
        {tab === 'manual' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Service / Issuer *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GitHub, AWS, Stripe"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Account / Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. alex@company.com"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Secret Key (Base32) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. JBSWY3DPEHPK3PXP"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-500">
                Spaces and dashes are automatically removed.
              </span>
            </div>

            {/* Folder Selection - Key differentiator! */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FolderIcon className="w-3.5 h-3.5 text-blue-500" />
                  <span>Assign to Folder / Category</span>
                </label>
                <button
                  type="button"
                  onClick={onCreateFolderClick}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Create New Folder</span>
                </button>
              </div>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="none">Uncategorized (No Folder)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tags / Labels (comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. work, production, backup-saved"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Recovery / Backup Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Recovery / Backup Notes (optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Recovery keys: 4920-1123-9981 or Admin approval contact"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Advanced OTP settings accordion / grid */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <label className="text-[11px] text-slate-500 block mb-0.5">Algorithm</label>
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value as OtpAlgorithm)}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                >
                  <option value="SHA1">SHA-1 (Standard)</option>
                  <option value="SHA256">SHA-256</option>
                  <option value="SHA512">SHA-512</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-0.5">Digits</label>
                <select
                  value={digits}
                  onChange={(e) => setDigits(parseInt(e.target.value, 10))}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                >
                  <option value={6}>6 Digits</option>
                  <option value={8}>8 Digits</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-0.5">Interval</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(parseInt(e.target.value, 10))}
                  className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md"
                >
                  <option value={30}>30 seconds</option>
                  <option value={60}>60 seconds</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="pin-check"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-xs border-slate-300 dark:border-slate-700"
              />
              <label htmlFor="pin-check" className="text-xs text-slate-700 dark:text-slate-300">
                Pin to top / Mark as favorite
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
              >
                Save Code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
