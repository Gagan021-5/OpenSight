import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Pages
import SignInPage from '../pages/SignInPage';
import SignUpPage from '../pages/SignUpPage';
import SetupPage from '../pages/SetupPage';
import Dashboard from '../pages/Dashboard';

// Games
import DichopticSnake from '../components/DichopticSnake';
import DichopticRacing from '../components/DichopticRacing';
import DichopticSea from '../components/DichopticSea';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes - Auth Layout */}
      <Route element={<AuthLayout />}>
        <Route
          path="/sign-in/*"
          element={
            <>
              <SignedOut>
                <SignInPage />
              </SignedOut>
              <SignedIn>
                <Navigate to="/dashboard" replace />
              </SignedIn>
            </>
          }
        />
        <Route
          path="/sign-up/*"
          element={
            <>
              <SignedOut>
                <SignUpPage />
              </SignedOut>
              <SignedIn>
                <Navigate to="/setup" replace />
              </SignedIn>
            </>
          }
        />
      </Route>

      {/* Protected Routes - Dashboard Layout */}
      <Route
        element={
          <SignedIn>
            <DashboardLayout />
          </SignedIn>
        }
      >
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Protected Routes - Game Routes (No Layout) */}
      <Route path="/game/snake" element={<SignedIn><DichopticSnake /></SignedIn>} />
      <Route path="/game/racing" element={<SignedIn><DichopticRacing /></SignedIn>} />
      <Route path="/game/sea" element={<SignedIn><DichopticSea /></SignedIn>} />

      {/* Default Route */}
      <Route
        path="/"
        element={
          <>
            <SignedOut>
              <Navigate to="/sign-in" replace />
            </SignedOut>
            <SignedIn>
              <Navigate to="/dashboard" replace />
            </SignedIn>
          </>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
