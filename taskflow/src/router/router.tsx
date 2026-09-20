import { createBrowserRouter, Navigate, RouteObject } from "react-router-dom";
import ProtectedRoute  from "../components/navigation/ProtectedRoute";
import Navbar  from "../components/navigation/Navbar";
import { LoginPage, RegisterPage, DashboardPage, ProfilePage, EditProfilePage, ChangePasswordPage, ForgotPasswordPage, ResetPasswordPage } from "./routes-config";

const routes: RouteObject[] = [

    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <Navbar />
                <DashboardPage />
            </ProtectedRoute>
        ),
    },
    { path: "/profile", element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
    { path: "/profile/edit", element: <ProtectedRoute><EditProfilePage /></ProtectedRoute> },
    { path: "/profile/password", element: <ProtectedRoute><ChangePasswordPage /></ProtectedRoute> },
    { path: "/forgot-password", element: <ForgotPasswordPage /> },
    { path: "/reset-password", element: <ResetPasswordPage /> },
    { path: "*", element: <Navigate to="/" replace /> },
];

const router = createBrowserRouter(routes)

export default router