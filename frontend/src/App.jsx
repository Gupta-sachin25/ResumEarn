import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UploadResume from './pages/UploadResume';
import Profile from './pages/Profile';
import SubmitJob from './pages/SubmitJob';
import Applications from './pages/Applications';
import Admin from './pages/Admin';
import HirerPortal from './pages/HirerPortal';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children, requiredRoles }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Login />} />

      {/* Protected application routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <Applications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload-resume"
        element={
          <ProtectedRoute>
            <UploadResume />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/submit-job"
        element={
          <ProtectedRoute>
            <SubmitJob />
          </ProtectedRoute>
        }
      />

      {/* Hirer Portal */}
      <Route
        path="/hirer"
        element={
          <ProtectedRoute requiredRoles={['HIRER', 'ADMIN']}>
            <HirerPortal />
          </ProtectedRoute>
        }
      />

      {/* Admin Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRoles={['ADMIN']}>
            <Admin />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
