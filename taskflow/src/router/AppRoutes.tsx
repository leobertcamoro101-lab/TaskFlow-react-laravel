import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '../navigation/ProtectedRoute';
import Navbar from '../navigation/Navbar';
import RootLayout from '../navigation/RootLayout';
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  ProfilePage,
  EditProfilePage,
  ChangePasswordPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from './routes-config';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <Navbar />
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/profile/edit',
        element: (
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/profile/password',
        element: (
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        ),
      },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export default router;
