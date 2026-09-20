import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuthStore } from '../../stores/authStore';
import { profileSchema } from '../../schemas';
import type { ProfileInput } from '../../schemas';
import FormField from '../../components/FormField';
import { inputClass } from '../../components/FormField/inputClass';
import Card from '../../components/Card';
import Avatar from '../../components/Avatar';
import LoadingSpinner from '../../components/LoadingSpinner';  // + add

const extractError = (err: any, fallback: string): string => {
  const errors = err.response?.data?.errors;
  if (errors) return Object.values(errors).flat().join(', ');
  return err.response?.data?.message || fallback;
};

const EditProfilePage = () => {
  const { user, updateProfile } = useAuthStore();
  const navigate = useNavigate();
  const [profileError, setProfileError] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAvatarFile(file);
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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

  const onSubmit = async (data: ProfileInput) => {
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
      navigate('/profile');
    } catch (err: any) {
      setProfileError(extractError(err, 'Profile update failed'));
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
        {!user && (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        )}
        {user && (
           <Card>
          {isSubmitting && <LoadingSpinner asOverlay />}
          <h2 className="text-white font-bold text-xl mb-6">Edit Profile</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col items-center gap-3 mb-2">
              <Avatar image={avatarPreview || user?.avatar_url} name={user?.name} alt={user?.name} />
              <label className="cursor-pointer text-violet-400 hover:text-violet-300 text-sm font-medium">
                Upload Photo
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="First Name" error={errors.firstName}>
                <input type="text" {...register('firstName')} className={inputClass(!!errors.firstName)} />
              </FormField>
              <FormField label="Last Name" error={errors.lastName}>
                <input type="text" {...register('lastName')} className={inputClass(!!errors.lastName)} />
              </FormField>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Birthday" error={errors.birthday}>
                <input type="date" {...register('birthday')} className={inputClass(!!errors.birthday)} />
              </FormField>
              <FormField label="Gender" error={errors.gender}>
                <select {...register('gender')} className={inputClass(!!errors.gender)}>
                  <option value="" disabled>Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </FormField>
            </div>
            <FormField label="Email" error={errors.email}>
              <input type="email" {...register('email')} className={inputClass(!!errors.email)} />
            </FormField>

            {profileError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                ⚠️ {profileError}
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Card>
        )}
      </div>
    </div>
  );
};

export default EditProfilePage;
