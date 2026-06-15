import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FiMail, FiUser, FiActivity, FiShield } from 'react-icons/fi';
import AuthLayout from '../../components/layouts/AuthLayout';
import { Input, PasswordInput } from '../../components/forms/FormField';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { loginSchema } from '../../validations/authSchemas';
import { ROLES, ROLE_HOME } from '../../constants';
import { cn } from '../../utils';

const ROLE_TABS = [
  { role: ROLES.USER, label: 'Patient', icon: FiUser, demo: { email: 'patient@demo.com', password: 'password' } },
  { role: ROLES.DOCTOR, label: 'Doctor', icon: FiActivity, demo: { email: 'doctor@demo.com', password: 'password' } },
  { role: ROLES.ADMIN, label: 'Admin', icon: FiShield, demo: { email: 'admin@demo.com', password: 'admin123' } },
];

export default function Login() {
  const [role, setRole] = useState(ROLES.USER);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const activeTab = ROLE_TABS.find((t) => t.role === role);

  const onSubmit = async (values) => {
    try {
      const user = await login({ ...values, role });
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const from = location.state?.from?.pathname;
      navigate(from || ROLE_HOME[user.role], { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed. Check your credentials.');
    }
  };

  const fillDemo = () => {
    setValue('email', activeTab.demo.email);
    setValue('password', activeTab.demo.password);
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to your dashboard.">
      {/* Role selector */}
      <div className="mb-6 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-white/5">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab.role}
            onClick={() => setRole(tab.role)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl py-2.5 text-sm font-semibold transition',
              role === tab.role ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
            )}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" icon={FiMail} placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <PasswordInput label="Password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />

        <div className="flex items-center justify-between text-sm">
          <button type="button" onClick={fillDemo} className="font-medium text-brand-600 hover:underline">
            Use demo {activeTab.label} account
          </button>
          <a className="text-slate-400 hover:text-slate-600" href="#">Forgot password?</a>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Sign in as {activeTab.label}
        </Button>
      </form>

      {role !== ROLES.ADMIN && (
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Link to={role === ROLES.DOCTOR ? '/register/doctor' : '/register'} className="font-semibold text-brand-600 hover:underline">
            Register as {activeTab.label}
          </Link>
        </p>
      )}
    </AuthLayout>
  );
}
