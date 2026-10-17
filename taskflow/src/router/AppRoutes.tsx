import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../navigation/ProtectedRoute';
import Navbar from '../navigation/Navbar';
import RootLayout from '../navigation/RootLayout';
import RouteError from './RouteError';
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
    errorElement: <RouteError />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        path: '/',
        element: (
          <ProtectedRoute>
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
    ],
  },
]);

export default router;
