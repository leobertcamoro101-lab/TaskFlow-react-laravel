import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/navigation/Navbar';
import ProtectedRoute from './components/navigation/ProtectedRoute';
import LoginPage from './pages/guest/LoginPage';
import RegisterPage from './pages/guest/RegisterPage';
import DashboardPage from './pages/authenticated/DashboardPage';
import ProfilePage from './pages/authenticated/ProfilePage';
import EditProfilePage from './pages/authenticated/EditProfilePage';
import ChangePasswordPage from './pages/authenticated/ChangePasswordPage';
import ForgotPasswordPage from './pages/guest/ForgotPasswordPage';
import ResetPasswordPage from './pages/guest/ResetPasswordPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-950">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Navbar/>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/profile/edit" element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/profile/password" element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            } />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
