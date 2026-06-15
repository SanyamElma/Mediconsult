import { z } from 'zod';

const email = z.string().min(1, 'Email is required').email('Enter a valid email');
const password = z.string().min(6, 'Password must be at least 6 characters');
const phone = z
  .string()
  .min(8, 'Enter a valid phone number')
  .regex(/^[+\d][\d\s-]{7,15}$/, 'Enter a valid phone number');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const userRegisterSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required'),
    email,
    phone,
    password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const doctorRegisterSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required'),
    email,
    phone,
    password,
    confirmPassword: z.string(),
    profilePicture: z.string().url('Enter a valid image URL').optional().or(z.literal('')),
    qualification: z.string().min(2, 'Qualification is required'),
    experience: z.coerce.number({ invalid_type_error: 'Experience is required' }).min(0).max(60),
    specializations: z.array(z.string()).min(1, 'Select at least one specialization'),
    about: z.string().min(10, 'Tell patients a bit more (min 10 characters)'),
    consultationCharges: z.coerce.number({ invalid_type_error: 'Charges are required' }).min(50, 'Minimum ₹50'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone,
  profilePicture: z.string().url('Enter a valid image URL').optional().or(z.literal('')),
});
