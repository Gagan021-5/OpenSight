import React, { createContext, useContext, useState } from 'react';

// Create Context
const CalibrationContext = createContext();

export const useCalibration = () => {
  const context = useContext(CalibrationContext);
  if (!context) {
    throw new Error('useCalibration must be used within a CalibrationProvider');
  }
  return context;
};

export const CalibrationProvider = ({ children }) => {
  const [redTint, setRedTint] = useState(255);
  const [blueTint, setBlueTint] = useState(255);

  const updateCalibration = (red, blue) => {
    setRedTint(red);
    setBlueTint(blue);
  };

  return (
    <CalibrationContext.Provider value={{ redTint, blueTint, updateCalibration }}>
      {children}
    </CalibrationContext.Provider>
  );
};

// Calibration Panel Component
const CalibrationPanel = ({ isOpen, onClose }) => {
  const { redTint, blueTint, updateCalibration } = useCalibration();
  const [localRed, setLocalRed] = useState(redTint);
  const [localBlue, setLocalBlue] = useState(blueTint);

  const handleApply = () => {
    updateCalibration(localRed, localBlue);
    onClose();
  };

  const handleReset = () => {
    setLocalRed(255);
    setLocalBlue(255);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Color Calibration</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Red Tint Slider */}
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Red Tint</span>
              <span className="text-xs text-gray-500 bg-red-100 px-2 py-1 rounded">{localRed}</span>
            </label>
            <input
              type="range"
              min="0"
              max="255"
              value={localRed}
              onChange={(e) => setLocalRed(Number(e.target.value))}
              className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #000000 0%, #ff0000 ${(localRed / 255) * 100}%, #fee2e2 ${(localRed / 255) * 100}%, #fee2e2 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 (No Red)</span>
              <span>255 (Full Red)</span>
            </div>
          </div>
          
          {/* Blue Tint Slider */}
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
              <span>Blue Tint</span>
              <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">{localBlue}</span>
            </label>
            <input
              type="range"
              min="0"
              max="255"
              value={localBlue}
              onChange={(e) => setLocalBlue(Number(e.target.value))}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #000000 0%, #0000ff ${(localBlue / 255) * 100}%, #dbeafe ${(localBlue / 255) * 100}%, #dbeafe 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 (No Blue)</span>
              <span>255 (Full Blue)</span>
            </div>
          </div>
          
          {/* Color Preview */}
          <div className="flex items-center justify-center gap-4 py-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-lg border-2 border-gray-300 mb-2"
                style={{ backgroundColor: `rgb(${localRed}, 0, 0)` }}
              />
              <p className="text-xs text-gray-600">Red Filter</p>
            </div>
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-lg border-2 border-gray-300 mb-2"
                style={{ backgroundColor: `rgb(0, 0, ${localBlue})` }}
              />
              <p className="text-xs text-gray-600">Blue Filter</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-300"
            >
              Reset to Default
            </button>
            <button
              onClick={handleApply}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Apply Changes
            </button>
          </div>
          
          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
            💡 Adjust these sliders to match your Red/Blue glasses intensity for optimal therapy效果. The changes will apply to all game elements.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalibrationPanel;
