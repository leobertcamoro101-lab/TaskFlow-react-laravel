import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
// import { useLoading } from '../../hooks/useLoading';   // + add this loading in every action no bridge
import { loginSchema } from '../../schemas';
import type { LoginInput } from '../../schemas';

import Card from '../../components/Card';
import FormField from '../../components/FormField';
import { inputClass } from '../../components/FormField/inputClass';

const LoginPage = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  // const { startLoading, stopLoading } = useLoading();   // + add this loading in every action no bridge

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginInput) => {
    // startLoading();                                      // + add this loading in every action no bridge
    try {
      await login(data);
      navigate('/');
    } catch (err: any) {
      setError('root', { message: err.response?.data?.message || 'Login failed. Check your credentials.' });
    } 
    // finally {
    //   stopLoading();                                     // + add this loading in every action no bridge
    // }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#FAF6EF]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2B2418] mb-2">TaskFlow</h1>
          <p className="text-[#857A64]">Sign in to manage your tasks</p>
        </div>

        <Card>
          <h2 className="text-[#2B2418] font-bold text-xl mb-6">Sign In</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Email" error={errors.email}>
              <input
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                {...register("email")}
                className={inputClass(!!errors.email)}
              />
            </FormField>
            <FormField label="Password" error={errors.password}>
              <input
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
                className={inputClass(!!errors.password)}
              />
            </FormField>
            {errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                ⚠️ {errors.root.message}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#B8862E] hover:bg-[#9C7226] disabled:opacity-50
                         text-white font-bold py-3 rounded-xl transition-colors"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
            <div className="text-center my-4">
              <Link
                to="/forgot-password"
                className="text-[#B8862E] text-sm hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          <p className="text-center text-[#857A64] text-sm mt-6">
            No account?{" "}
            <Link
              to="/register"
              className="text-[#B8862E] hover:text-[#9C7226] font-medium"
            >
              Register
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
