import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuthStore } from '../../stores/authStore';
import { profileSchema, passwordSchema } from '../../schemas';
import type { ProfileInput, PasswordInput } from '../../schemas';
import FormField from '../../components/FormField';
import { inputClass } from '../../components/FormField/inputClass';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';

type Mode = 'view' | 'edit' | 'password';

const extractError = (err: any, fallback: string): string => {
  const errors = err.response?.data?.errors;
  if (errors) return Object.values(errors).flat().join(', ');
  return err.response?.data?.message || fallback;
};

const formatBirthday = (birthday: string | null | undefined) => {
  if (!birthday) return '—';
  const [year, month, day] = birthday.slice(0, 10).split('-');
  return `${parseInt(month)}/${parseInt(day)}/${year}`;
};

const ProfilePage = () => {
  const { user, updateProfile, updatePassword } = useAuthStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('view');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0] ?? null;
  setAvatarFile(file);
  if (file) setAvatarPreview(URL.createObjectURL(file));
};

  const {
    register: registerProfile,
    handleSubmit: handleProfileFormSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      birthday: user?.birthday?.slice(0, 10) || '',
      gender: (user?.gender as ProfileInput['gender']) || undefined,
      email: user?.email || '',
    },
  });

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

  const onProfileSubmit = async (data: ProfileInput) => {
    setProfileError('');
    try {
      await updateProfile({
        first_name: data.firstName,
        last_name: data.lastName,
        birthday: data.birthday,
        gender: data.gender,
        email: data.email,
        avatar: avatarFile,
      });
      setAvatarFile(null);
      setMode('view');
    } catch (err: any) {
      setProfileError(extractError(err, 'Profile update failed'));
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

  const initials =
    `${user?.first_name?.[0] ?? ''}${user?.last_name?.[0] ?? ''}`.toUpperCase() ||
    user?.name?.[0]?.toUpperCase() ||
    '?';

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-4">
        <button
          onClick={() => (mode === 'view' ? navigate('/') : setMode('view'))}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <span aria-hidden="true">←</span> Back
        </button>

        <Card>
          {mode === 'view' && (
            <div className="text-center">
              {user?.avatar_url ? (
                <div className="mb-4 flex justify-center">
                  <Avatar image={user.avatar_url} alt={user.name} />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-violet-500/20 border border-violet-500/30
                                flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-violet-300">{initials}</span>
                </div>
              )}
              <h1 className="text-2xl font-bold text-white mb-6">{user?.name}</h1>

              <div className="text-left space-y-2 mb-6">
                <p className="text-gray-400 text-sm">
                  Email: <span className="text-white font-medium">{user?.email}</span>
                </p>
                <p className="text-gray-400 text-sm">
                  Birthday: <span className="text-white font-medium">{formatBirthday(user?.birthday)}</span>
                </p>
                <p className="text-gray-400 text-sm">
                  Gender: <span className="text-white font-medium">{user?.gender}</span>
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setMode('edit')}
                  className="w-full bg-violet-500 hover:bg-violet-400 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setMode('password')}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Change Password
                </button>
              </div>
            </div>
          )}

          {mode === 'edit' && (
            <>
              <h2 className="text-white font-bold text-xl mb-6">Edit Profile</h2>
              <form onSubmit={handleProfileFormSubmit(onProfileSubmit)} className="space-y-4">
                <div className="flex flex-col items-center gap-3 mb-2">
                  {(avatarPreview || user?.avatar_url) ? (
                    <Avatar image={avatarPreview || user?.avatar_url || undefined} alt={user?.name} />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                      <span className="text-2xl font-bold text-violet-300">{initials}</span>
                    </div>
                  )}
                  <label className="cursor-pointer text-violet-400 hover:text-violet-300 text-sm font-medium">
                    Upload Photo
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="First Name" error={profileErrors.firstName}>
                    <input type="text" {...registerProfile('firstName')} className={inputClass(!!profileErrors.firstName)} />
                  </FormField>
                  <FormField label="Last Name" error={profileErrors.lastName}>
                    <input type="text" {...registerProfile('lastName')} className={inputClass(!!profileErrors.lastName)} />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Birthday" error={profileErrors.birthday}>
                    <input type="date" {...registerProfile('birthday')} className={inputClass(!!profileErrors.birthday)} />
                  </FormField>
                  <FormField label="Gender" error={profileErrors.gender}>
                    <select {...registerProfile('gender')} className={inputClass(!!profileErrors.gender)}>
                      <option value="" disabled>Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </FormField>
                </div>
                <FormField label="Email" error={profileErrors.email}>
                  <input type="email" {...registerProfile('email')} className={inputClass(!!profileErrors.email)} />
                </FormField>

                {profileError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                    ⚠️ {profileError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setMode('view')}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={profileSubmitting}
                    className="flex-1 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
                    {profileSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </>
          )}

          {mode === 'password' && (
            <>
              <h2 className="text-white font-bold text-xl mb-6">Change Password</h2>
              <form onSubmit={handlePasswordFormSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField label="Current Password" error={passwordErrors.current_password}>
                  <input type="password" {...registerPassword('current_password')} className={inputClass(!!passwordErrors.current_password)} />
                </FormField>
                <FormField label="New Password" error={passwordErrors.password}
                  hint="8+ characters, with an uppercase letter, a number, and a special character">
                  <input type="password" {...registerPassword('password')} className={inputClass(!!passwordErrors.password)} />
                </FormField>
                <FormField label="Confirm New Password" error={passwordErrors.password_confirmation}>
                  <input type="password" {...registerPassword('password_confirmation')} className={inputClass(!!passwordErrors.password_confirmation)} />
                </FormField>

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

                <div className="flex gap-3">
                  <button type="button" onClick={() => setMode('view')}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={passwordSubmitting}
                    className="flex-1 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
                    {passwordSubmitting ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;