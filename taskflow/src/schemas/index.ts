import { z } from 'zod';

const calculateAge = (birthday: string): number => {
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
};

const ageSchema = z.number().int().min(13).max(120);

const strongPassword = z
  .string()
  .min(8, 'Must be at least 8 characters')
  .regex(/[A-Z]/, 'Must include an uppercase letter')
  .regex(/[0-9]/, 'Must include a number')
  .regex(/[^A-Za-z0-9]/, 'Must include a special character');

export const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(255).transform((v) => v.trim()),
    lastName: z.string().min(1, 'Last name is required').max(255).transform((v) => v.trim()),
    birthday: z.string().min(1, 'Birthday is required'),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
      errorMap: () => ({ message: 'Please select a gender' }),
    }),
    email: z.string().min(1, 'Email is required').email('Invalid email address').transform((v) => v.toLowerCase()),
    password: strongPassword,
  })
  .superRefine((data, ctx) => {
    if (!ageSchema.safeParse(calculateAge(data.birthday)).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'You must be at least 13 years old',
        path: ['birthday'],
      });
    }
  });

export const profileSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(255).transform((v) => v.trim()),
    lastName: z.string().min(1, 'Last name is required').max(255).transform((v) => v.trim()),
    birthday: z.string().min(1, 'Birthday is required'),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
      errorMap: () => ({ message: 'Please select a gender' }),
    }),
    email: z.string().min(1, 'Email is required').email('Invalid email address').transform((v) => v.toLowerCase()),
  })
  .superRefine((data, ctx) => {
    if (!ageSchema.safeParse(calculateAge(data.birthday)).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'You must be at least 13 years old',
        path: ['birthday'],
      });
    }
  });

export type ProfileInput = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    password: strongPassword,
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: strongPassword,
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255).transform((v) => v.trim()),
  description: z.string().max(5000).optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in-progress', 'done']),
  due_date: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type PasswordInput = z.infer<typeof passwordSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TaskFormValues = z.infer<typeof taskSchema>;