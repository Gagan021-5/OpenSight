import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react'; // Or use simple emoji if no icon lib

const SafetyModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already agreed
    const hasAgreed = localStorage.getItem('safety_agreement');
    if (!hasAgreed) {
      setIsOpen(true);
    }
  }, []);

  const handleAgree = () => {
    localStorage.setItem('safety_agreement', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-red-500 animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-red-50 dark:bg-red-900/20 p-6 border-b border-red-100 dark:border-red-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full text-red-600">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
              Medical Safety Warning
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-slate-600 dark:text-slate-300">
          <p className="font-medium">
            Before using OpenSight, please confirm you do NOT have:
          </p>
          <ul className="space-y-2 list-disc pl-5 text-sm">
            <li>Sudden flashes of light or floaters.</li>
            <li>New onset double vision (Diplopia).</li>
            <li>Eye pain or severe redness.</li>
            <li>History of seizures (Photosensitivity).</li>
          </ul>
          <p className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <strong>Disclaimer:</strong> This is a therapy tool, NOT a diagnostic device. 
            If you experience discomfort, stop immediately and consult an eye doctor.
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={handleAgree}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-red-500/30"
          >
            ✅ I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafetyModal;