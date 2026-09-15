import { useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../stores/authStore';
import { passwordSchema } from '../../schemas';
import type { PasswordInput } from '../../schemas';

const inputClass = 'w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 outline-none focus:border-violet-400 transition-colors text-sm placeholder-gray-500';
const errorClass = 'text-red-400 text-xs mt-1';

const extractError = (err: any, fallback: string): string => {
  const errors = err.response?.data?.errors;
  if (errors) return Object.values(errors).flat().join(', ');
  return err.response?.data?.message || fallback;
};

interface ProfileFormState {
  name: string;
  email: string;
}

const ProfilePage = () => {
  const { user, updateProfile, updatePassword } = useAuthStore();

  const [profileForm, setProfileForm] = useState<ProfileFormState>({ name: user?.name || '', email: user?.email || '' });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordSuccess, setPasswordSuccess] = useState('');

  const {
    register: registerPassword,
    handleSubmit: handlePasswordFormSubmit,
    reset: resetPasswordForm,
    setError: setPasswordFieldError,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
  } = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: '', password: '', password_confirmation: '' },
  });

  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);
    try {
      await updateProfile(profileForm);
      setProfileSuccess('Profile updated successfully');
    } catch (err: any) {
      setProfileError(extractError(err, 'Profile update failed'));
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordInput) => {
    setPasswordSuccess('');
    try {
      await updatePassword(data);
      setPasswordSuccess('Password updated successfully');
      resetPasswordForm();
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        Object.entries(serverErrors).forEach(([field, messages]) => {
          setPasswordFieldError(field as keyof PasswordInput, { message: (messages as string[])[0] });
        });
      } else {
        setPasswordFieldError('root', { message: err.response?.data?.message || 'Password update failed' });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold text-white mb-2">👤 Profile</h1>
          <p className="text-gray-400">Manage your account details</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 sm:p-8">
          <h2 className="text-white font-bold text-xl mb-6">Account Info</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Name</label>
              <input type="text" placeholder="Your name" value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className={inputClass} required />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              <input type="email" placeholder="your@email.com" value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className={inputClass} required />
            </div>
            {profileError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                ⚠️ {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl px-4 py-3 text-sm">
                ✅ {profileSuccess}
              </div>
            )}
            <button type="submit" disabled={profileLoading}
              className="w-full bg-violet-500 hover:bg-violet-400 disabled:opacity-50
                         text-white font-bold py-3 rounded-xl transition-colors">
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 sm:p-8">
          <h2 className="text-white font-bold text-xl mb-6">Change Password</h2>
          <form onSubmit={handlePasswordFormSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Current Password</label>
              <input type="password" placeholder="Current password" {...registerPassword('current_password')}
                className={inputClass} />
              {passwordErrors.current_password && <p className={errorClass}>{passwordErrors.current_password.message}</p>}
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">New Password</label>
              <input type="password" placeholder="Min 8 characters" {...registerPassword('password')}
                className={inputClass} />
              <p className="text-gray-500 text-xs mt-1">
                8+ characters, with an uppercase letter, a number, and a special character
              </p>
              {passwordErrors.password && <p className={errorClass}>{passwordErrors.password.message}</p>}
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Confirm New Password</label>
              <input type="password" placeholder="Repeat new password" {...registerPassword('password_confirmation')}
                className={inputClass} />
              {passwordErrors.password_confirmation && <p className={errorClass}>{passwordErrors.password_confirmation.message}</p>}
            </div>
            {passwordErrors.root && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                ⚠️ {passwordErrors.root.message}
              </div>
            )}
            {passwordSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl px-4 py-3 text-sm">
                ✅ {passwordSuccess}
              </div>
            )}
            <button type="submit" disabled={passwordSubmitting}
              className="w-full bg-violet-500 hover:bg-violet-400 disabled:opacity-50
                         text-white font-bold py-3 rounded-xl transition-colors">
              {passwordSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
