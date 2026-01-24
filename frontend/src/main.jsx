import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import { GlobalProvider } from './context/GlobalContext';
import { DevModeProvider } from './context/DevModeContext';
import App from './App';
import DevRoutes from './routes/DevRoutes';
import './index.css';

// 🔧 DEVELOPMENT MODE - Set to false to enable Clerk auth
const DEV_MODE = true;

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!DEV_MODE && !PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

// Development Mode (No Auth Required)
if (DEV_MODE) {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <BrowserRouter>
        <DevModeProvider>
          <DevRoutes />
        </DevModeProvider>
      </BrowserRouter>
    </StrictMode>
  );
} else {
  // Production Mode (Clerk Auth Required)
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <BrowserRouter>
          <GlobalProvider>
            <App />
          </GlobalProvider>
        </BrowserRouter>
      </ClerkProvider>
    </StrictMode>
  );
}
