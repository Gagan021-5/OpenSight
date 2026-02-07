import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const SafetyModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen the safety modal
    const hasSeenSafetyModal = localStorage.getItem('opensight_safety_modal_seen');
    if (!hasSeenSafetyModal) {
      setIsOpen(true);
    }
  }, []);

  const handleUnderstand = () => {
    localStorage.setItem('opensight_safety_modal_seen', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-amber-100 p-2">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Important Safety Information</h2>
        </div>
        
        <div className="mb-6 space-y-3 text-gray-700">
          <p className="leading-relaxed">
            Before starting your vision therapy session, please read the following important safety information:
          </p>
          
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p className="font-semibold text-amber-800 mb-2">⚠️ Do Not Use If You Experience:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-amber-700">
              <li>Sudden flashes of light</li>
              <li>Eye pain or discomfort</li>
              <li>Double vision</li>
              <li>Sudden vision changes</li>
              <li>Severe headaches during use</li>
            </ul>
          </div>
          
          <p className="text-sm leading-relaxed">
            If you experience any of these symptoms, stop using the application immediately and consult with your eye care professional.
          </p>
          
          <p className="text-sm leading-relaxed">
            This therapy is designed to be used with proper Red/Blue glasses as prescribed by your vision therapist.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleUnderstand}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafetyModal;
