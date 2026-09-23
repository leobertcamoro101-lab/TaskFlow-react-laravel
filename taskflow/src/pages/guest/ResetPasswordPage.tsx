import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../api/client';
import { resetPasswordSchema } from '../../schemas';
import type { ResetPasswordInput } from '../../schemas';

import Card from '../../components/Card';
import FormField from '../../components/FormField';
import { inputClass } from '../../components/FormField/inputClass';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', password_confirmation: '' },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      await resetPassword({ ...data, token, email });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError('root', { message: err.response?.data?.message || 'Reset link is invalid or expired.' });
    }
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card>
            <p className="text-red-400 text-sm text-center">
              ⚠️ Invalid or missing reset link.{' '}
              <Link to="/forgot-password" className="text-violet-400 hover:text-violet-300 font-medium">
                Request a new one
              </Link>
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">TaskFlow</h1>
          <p className="text-gray-400">Choose a new password</p>
        </div>

        <Card>
          {success ? (
            <p className="text-center text-emerald-400 text-sm">
              ✅ Password reset! Redirecting to sign in...
            </p>
          ) : (
            <>
              <h2 className="text-white font-bold text-xl mb-6">Reset Password</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormField label="New Password" error={errors.password}
                  hint="8+ characters, with an uppercase letter, a number, and a special character">
                  <input type="password" autoComplete="new-password" {...register('password')} className={inputClass(!!errors.password)} />
                </FormField>
                <FormField label="Confirm New Password" error={errors.password_confirmation}>
                  <input type="password" autoComplete="new-password" {...register('password_confirmation')} className={inputClass(!!errors.password_confirmation)} />
                </FormField>
                {errors.root && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                    ⚠️ {errors.root.message}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-violet-500 hover:bg-violet-400 disabled:opacity-50
                             text-white font-bold py-3 rounded-xl transition-colors"
                >
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;