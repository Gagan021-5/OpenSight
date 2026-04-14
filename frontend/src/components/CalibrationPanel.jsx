import React, { createContext, useState, useContext } from 'react';

// 1. Create the Context
const CalibrationContext = createContext();

// 2. The Provider Component (Wraps the whole App)
export const CalibrationProvider = ({ children }) => {
  // Default to pure Red (255,0,0) and Blue (0,0,255)
  const [redColor, setRedColor] = useState('rgb(255, 0, 0)');
  const [blueColor, setBlueColor] = useState('rgb(0, 0, 255)');

  // Helper to update from sliders (0-255)
  const updateRed = (val) => setRedColor(`rgb(${val}, 0, 0)`);
  const updateBlue = (val) => setBlueColor(`rgb(0, 0, ${val})`);

  return (
    <CalibrationContext.Provider value={{ redColor, blueColor, updateRed, updateBlue }}>
      {children}
    </CalibrationContext.Provider>
  );
};

// 3. Custom Hook to use the colors in your Game Canvas
export const useCalibration = () => useContext(CalibrationContext);

// 4. The UI Component ( The Sliders )
const CalibrationPanel = () => {
  const { updateRed, updateBlue } = useCalibration();

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 w-full max-w-sm mx-auto mt-4">
      <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
        🛠️ Glasses Calibration
      </h3>
      
      <div className="space-y-4">
        {/* Red Slider */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-red-500 font-bold">Left Eye (Red)</span>
            <span className="text-slate-500">Adjust to hide ghosting</span>
          </div>
          <input
            type="range"
            min="0"
            max="255"
            defaultValue="255"
            onChange={(e) => updateRed(e.target.value)}
            className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
        </div>

        {/* Blue Slider */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-blue-500 font-bold">Right Eye (Blue)</span>
            <span className="text-slate-500">Adjust to hide ghosting</span>
          </div>
          <input
            type="range"
            min="0"
            max="255"
            defaultValue="255"
            onChange={(e) => updateBlue(e.target.value)}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>
    </div>
  );
};

export default CalibrationPanel;