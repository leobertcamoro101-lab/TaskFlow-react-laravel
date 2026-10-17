import {
  createBrowserRouter,
  // Navigate,
} from "react-router-dom";
import ProtectedRoute from "../navigation/ProtectedRoute";
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  ProfilePage,
  EditProfilePage,
  ChangePasswordPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from "./routes-config";
import RootLayout from "../navigation/RootLayout";
import RouteError from "./RouteError";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError/>,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
      // { path: "*", element: <Navigate to="/" replace /> }, // commented to take effect RouteError
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile/edit",
        element: (
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile/password",
        element: (
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        ),
      },
      
    ],
  },
]);

export default router;
