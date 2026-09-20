import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CameraPage from './pages/Camera';
import SearchPage from './pages/Search';
import History from './pages/History';
import Settings from './pages/Settings';
import BottomNav from './components/BottomNav';
import { getUserProfile } from './utils/storage';

function ProtectedRoute({ children }) {
  const profile = getUserProfile();
  return profile ? children : <Navigate to="/" replace />;
}

function AppLayout({ children }) {
  return (
    <div className="w-full mx-auto relative min-h-screen">
      {children}
      <BottomNav />
    </div>
  );
}

export default function App() {
  const profile = getUserProfile();

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing / Onboarding */}
        <Route
          path="/"
          element={
            profile ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <div className="max-w-lg mx-auto">
                <Landing />
              </div>
            )
          }
        />

        {/* Protected app routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/camera"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CameraPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SearchPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <AppLayout>
                <History />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Settings />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
