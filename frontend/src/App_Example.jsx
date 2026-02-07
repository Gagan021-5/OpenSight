// In your App.jsx, add these imports and wrap with CalibrationProvider

import React from 'react';
import { CalibrationProvider } from './components/CalibrationPanel.jsx';
import SafetyModal from './components/SafetyModal.jsx';
import AppRoutes from './routes';

function App() {
  return (
    <CalibrationProvider>
      <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 min-h-screen">
        <SafetyModal />
        <AppRoutes />
      </div>
    </CalibrationProvider>
  );
}

export default App;
