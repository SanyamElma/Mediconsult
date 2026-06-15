import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FiMail, FiUser, FiPhone } from 'react-icons/fi';
import AuthLayout from '../../components/layouts/AuthLayout';
import { Input, PasswordInput } from '../../components/forms/FormField';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { userRegisterSchema } from '../../validations/authSchemas';
import { ROLE_HOME } from '../../constants';

export default function UserRegister() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(userRegisterSchema) });

  const onSubmit = async (values) => {
    try {
      const user = await registerUser(values);
      toast.success('Account created! Welcome to MediConsult.');
      navigate(ROLE_HOME[user.role], { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join thousands of patients consulting top doctors online.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full Name" icon={FiUser} placeholder="John Doe" error={errors.fullName?.message} {...register('fullName')} />
        <Input label="Email" icon={FiMail} placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input label="Phone Number" icon={FiPhone} placeholder="+91 98765 43210" error={errors.phone?.message} {...register('phone')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PasswordInput label="Password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
          <PasswordInput label="Confirm Password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        </div>
        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Create Account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link>
      </p>
      <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
        Are you a doctor?{' '}
        <Link to="/register/doctor" className="font-semibold text-brand-600 hover:underline">Register here</Link>
      </p>
    </AuthLayout>
  );
}
