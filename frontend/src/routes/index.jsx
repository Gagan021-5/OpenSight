import { Routes, Route, Navigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import LandingPage from '../pages/LandingPage.jsx';
import SignInPage from '../pages/SignInPage.jsx';
import SignUpPage from '../pages/SignUpPage.jsx';
import SetupPage from '../pages/SetupPage.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import ProfilePage from '../pages/ProfilePage.jsx';
import GameWrapper from '../components/GameWrapper.jsx';
import DichopticSnake from '../components/DichopticSnake.jsx';
import DichopticRacing from '../components/DichopticRacing.jsx';
import DichopticSea from '../components/DichopticSea.jsx';
import ZoomingTarget from '../components/ZoomingTarget.jsx';
import TherapyTetris from '../components/TherapyTetris.jsx';
import WhackATarget from '../components/WhackATarget.jsx';
import Lighthouse from '../components/Lighthouse.jsx';

export default function AppRoutes() {
  const { isSignedIn, loading } = useGlobal();

  if (loading) return null;

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/sign-in" element={isSignedIn ? <Navigate to="/dashboard" replace /> : <SignInPage />} />
        <Route path="/sign-up" element={isSignedIn ? <Navigate to="/dashboard" replace /> : <SignUpPage />} />
      </Route>

      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SetupPage />} />
      </Route>

      <Route
        path="/game/snake"
        element={<ProtectedRoute><GameWrapper gameId="snake"><DichopticSnake /></GameWrapper></ProtectedRoute>}
      />
      <Route
        path="/game/racing"
        element={<ProtectedRoute><GameWrapper gameId="racing"><DichopticRacing /></GameWrapper></ProtectedRoute>}
      />
      <Route
        path="/game/sea"
        element={<ProtectedRoute><GameWrapper gameId="sea"><DichopticSea /></GameWrapper></ProtectedRoute>}
      />
      <Route
        path="/game/convergence"
        element={<ProtectedRoute><GameWrapper gameId="convergence"><ZoomingTarget /></GameWrapper></ProtectedRoute>}
      />
      <Route
        path="/game/tetris"
        element={<ProtectedRoute><GameWrapper gameId="tetris"><TherapyTetris /></GameWrapper></ProtectedRoute>}
      />
      <Route
        path="/game/whack"
        element={<ProtectedRoute><GameWrapper gameId="tracking"><WhackATarget /></GameWrapper></ProtectedRoute>}
      />
      <Route
        path="/game/lighthouse"
        element={<ProtectedRoute><GameWrapper gameId="neglect"><Lighthouse /></GameWrapper></ProtectedRoute>}
      />

      <Route path="/" element={isSignedIn ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
