import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoadingProvider } from './context/LoadingProvider';
import Navbar from './components/navigation/Navbar';
import ProtectedRoute from './components/navigation/ProtectedRoute';
import { LoginPage, RegisterPage, DashboardPage, ProfilePage, EditProfilePage, ChangePasswordPage, ForgotPasswordPage, ResetPasswordPage } from './router/routes-config';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function App() {
  return (
    
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
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
      </LoadingProvider>
    </QueryClientProvider>
    
  );
}

export default App;
