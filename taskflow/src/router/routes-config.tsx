import { lazy } from "react";

export const LoginPage = lazy(()=> import('../pages/guest/LoginPage'));
export const RegisterPage = lazy(()=> import('../pages/guest/RegisterPage'));
export const DashboardPage = lazy(()=> import('../pages/authenticated/DashboardPage'));
export const ProfilePage = lazy(()=> import('../pages/authenticated/ProfilePage'));
export const EditProfilePage = lazy(()=> import('../pages/authenticated/EditProfilePage'));
export const ChangePasswordPage = lazy(()=> import('../pages/authenticated/ChangePasswordPage'));
export const ForgotPasswordPage = lazy(()=> import('../pages/guest/ForgotPasswordPage'));
export const ResetPasswordPage = lazy(()=> import('../pages/guest/ResetPasswordPage'));
