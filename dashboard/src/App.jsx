import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import LiveMonitoring from './pages/LiveMonitoring';
import Sensors from './pages/Sensors';
import Predictions from './pages/Predictions';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Weather from './pages/Weather';
import Devices from './pages/Devices';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import Help from './pages/Help';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"   element={<Dashboard />} />
        <Route path="monitoring"  element={<LiveMonitoring />} />
        <Route path="sensors"     element={<Sensors />} />
        <Route path="predictions" element={<Predictions />} />
        <Route path="analytics"   element={<Analytics />} />
        <Route path="history"     element={<History />} />
        <Route path="weather"     element={<Weather />} />
        <Route path="devices"     element={<Devices />} />
        <Route path="alerts"      element={<Alerts />} />
        <Route path="settings"    element={<Settings />} />
        <Route path="help"        element={<Help />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '10px', fontSize: '13px', border: '1px solid #e5e7eb' },
            success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
