import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
// import { useLoading } from '../../hooks/useLoading';   // + add this loading in every action no bridge 
import { registerSchema } from '../../schemas';
import type { RegisterInput } from '../../schemas';

import Card from '../../components/Card';
import FormField from '../../components/FormField';
import { inputClass } from '../../components/FormField/inputClass';

const fieldMap: Record<string, string> = {
  first_name: 'firstName',
  last_name: 'lastName',
  birthday: 'birthday',
  gender: 'gender',
  email: 'email',
  password: 'password',
};

const RegisterPage = () => {
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();
  // const { startLoading, stopLoading } = useLoading();   // + add this loading in every action no bridge 

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: { firstName: '', lastName: '', birthday: '', gender: undefined, email: '', password: '' },
  });

  const onSubmit = async (data: RegisterInput) => {
    // startLoading();                                     // + add this loading in every action no bridge
    try {
      await registerUser({
        first_name: data.firstName,
        last_name: data.lastName,
        birthday: data.birthday,
        gender: data.gender,
        email: data.email,
        password: data.password,
      });
      navigate('/');
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        Object.entries(serverErrors).forEach(([field, messages]) => {
          const key = (fieldMap[field] || field) as keyof RegisterInput;
          setError(key, { message: (messages as string[])[0] });
        });
      } else {
        setError('root', { message: err.response?.data?.message || 'Registration failed' });
      }
    } 
    // finally {
    //   stopLoading();                                     // + add this loading in every action no bridge
    // }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#FAF6EF]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2B2418] mb-2">TaskFlow</h1>
          <p className="text-[#857A64]">Create your account</p>
        </div>

        <Card>
          <h2 className="text-[#2B2418] font-bold text-xl mb-6">Create Account</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="First Name" error={errors.firstName}>
                <input type="text" placeholder="John" autoComplete="given-name" {...register('firstName')} className={inputClass(!!errors.firstName)} />
              </FormField>
              <FormField label="Last Name" error={errors.lastName}>
                <input type="text" placeholder="Doe" autoComplete="family-name" {...register('lastName')} className={inputClass(!!errors.lastName)} />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Birthday" error={errors.birthday}>
                {/* Chrome's autofill validator rejects autocomplete="bday" paired
                    with type="date" (flagged as a "non-standard autocomplete
                    attribute value" DevTools issue) — there's no browser autofill
                    behavior gained from it on a native date picker anyway, so it's
                    left off rather than swapped for another mismatched token. */}
                <input type="date" {...register('birthday')} className={inputClass(!!errors.birthday)} />
              </FormField>
              <FormField label="Gender" error={errors.gender}>
                <select {...register('gender')} defaultValue="" className={inputClass(!!errors.gender)}>
                  <option value="" disabled>Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </FormField>
            </div>

            <FormField label="Email" error={errors.email}>
              <input type="email" placeholder="john@example.com" autoComplete="email" {...register('email')} className={inputClass(!!errors.email)} />
            </FormField>

            <FormField
              label="Password"
              error={errors.password}
              hint="8+ characters, with an uppercase letter, a number, and a special character"
            >
              <input type="password" placeholder="••••••••" autoComplete="new-password" {...register('password')} className={inputClass(!!errors.password)} />
            </FormField>
            {errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                ⚠️ {errors.root.message}
              </div>
            )}
            <button type="submit" disabled={isSubmitting}
              className="w-full bg-[#B8862E] hover:bg-[#9C7226] disabled:opacity-50
                         text-white font-bold py-3 rounded-xl transition-colors">
              {isSubmitting ? 'Creating account...' : 'Submit'}
            </button>
          </form>

          <p className="text-center text-[#857A64] text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#B8862E] hover:text-[#9C7226] font-medium">
              Login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
