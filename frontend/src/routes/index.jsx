import { Routes, Route, Navigate } from 'react-router-dom';
import { useGlobal } from '../context/GlobalContext';
import ProtectedRoute from '../components/ProtectedRoute';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import LandingPage from '../pages/LandingPage';
import SignInPage from '../pages/SignInPage';
import SignUpPage from '../pages/SignUpPage';
import SetupPage from '../pages/SetupPage';
import Dashboard from '../pages/Dashboard';
import ProfilePage from '../pages/ProfilePage';
import GameWrapper from '../components/GameWrapper';
import DichopticSnake from '../components/DichopticSnake';
import DichopticRacing from '../components/DichopticRacing';
import DichopticSea from '../components/DichopticSea';
import ZoomingTarget from '../components/ZoomingTarget';
import TherapyTetris from '../components/TherapyTetris';
import WhackATarget from '../components/WhackATarget';
import Lighthouse from '../components/Lighthouse';

export default function AppRoutes() {
  const { isSignedIn, loading } = useGlobal();

  if (loading) return null;

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/sign-in" element={isSignedIn ? <Navigate to="/dashboard" replace /> : <SignInPage />} />
        <Route path="/sign-up" element={isSignedIn ? <Navigate to="/setup" replace /> : <SignUpPage />} />
      </Route>

      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
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
        element={<ProtectedRoute><GameWrapper gameId="strabismus"><TherapyTetris /></GameWrapper></ProtectedRoute>}
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
