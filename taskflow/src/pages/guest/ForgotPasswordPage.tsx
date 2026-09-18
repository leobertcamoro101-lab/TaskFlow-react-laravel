import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/client';
import { forgotPasswordSchema } from '../../schemas';
import type { ForgotPasswordInput } from '../../schemas';

import Card from '../../components/Card';
import FormField from '../../components/FormField';
import { inputClass } from '../../components/FormField/inputClass';

const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await forgotPassword(data);
      setSent(true);
    } catch (err: any) {
      setError('root', { message: err.response?.data?.message || 'Something went wrong. Try again.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">TaskFlow</h1>
          <p className="text-gray-400">Reset your password</p>
        </div>

        <Card>
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-white font-bold text-lg">Check your email 📬</p>
              <p className="text-gray-400 text-sm">
                If an account exists for that email, we've sent a link to reset your password.
              </p>
              <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium text-sm">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-white font-bold text-xl mb-2">Forgot Password</h2>
              <p className="text-gray-400 text-sm mb-6">
                Enter your email and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormField label="Email" error={errors.email}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    {...register('email')}
                    className={inputClass(!!errors.email)}
                  />
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
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <p className="text-center text-gray-500 text-sm mt-6">
                <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">
                  Back to Sign In
                </Link>
              </p>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;