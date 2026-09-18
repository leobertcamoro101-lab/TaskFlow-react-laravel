import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuthStore } from '../../stores/authStore';
import { passwordSchema } from '../../schemas';
import type { PasswordInput } from '../../schemas';
import FormField from '../../components/FormField';
import { inputClass } from '../../components/FormField/inputClass';
import Card from '../../components/Card';

const ChangePasswordPage = () => {
  const { updatePassword } = useAuthStore();
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: '', password: '', password_confirmation: '' },
  });

  const onSubmit = async (data: PasswordInput) => {
    setPasswordSuccess('');
    try {
      await updatePassword(data);
      setPasswordSuccess('Password updated successfully');
      reset();
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        Object.entries(serverErrors).forEach(([field, messages]) => {
          setError(field as keyof PasswordInput, { message: (messages as string[])[0] });
        });
      } else {
        setError('root', { message: err.response?.data?.message || 'Password update failed' });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-4">
        <Link
          to="/profile"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <span aria-hidden="true">←</span> Back
        </Link>

        <Card>
          <h2 className="text-white font-bold text-xl mb-6">Change Password</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Current Password" error={errors.current_password}>
              <input type="password" {...register('current_password')} className={inputClass(!!errors.current_password)} />
            </FormField>
            <FormField label="New Password" error={errors.password}
              hint="8+ characters, with an uppercase letter, a number, and a special character">
              <input type="password" {...register('password')} className={inputClass(!!errors.password)} />
            </FormField>
            <FormField label="Confirm New Password" error={errors.password_confirmation}>
              <input type="password" {...register('password_confirmation')} className={inputClass(!!errors.password_confirmation)} />
            </FormField>

            {errors.root && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                ⚠️ {errors.root.message}
              </div>
            )}
            {passwordSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl px-4 py-3 text-sm">
                ✅ {passwordSuccess}
              </div>
            )}

            <div className="flex gap-3">
              <Link
                to="/profile"
                className="flex-1 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Cancel
              </Link>
              <button type="submit" disabled={isSubmitting}
                className="flex-1 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
