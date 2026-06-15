import { Link, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FiMail, FiUser, FiPhone, FiImage, FiAward, FiDollarSign } from 'react-icons/fi';
import AuthLayout from '../../components/layouts/AuthLayout';
import { Input, PasswordInput, Textarea } from '../../components/forms/FormField';
import MultiSelect from '../../components/forms/MultiSelect';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { doctorRegisterSchema } from '../../validations/authSchemas';
import { SPECIALIZATIONS, ROLE_HOME } from '../../constants';

export default function DoctorRegister() {
  const { registerDoctor } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(doctorRegisterSchema),
    defaultValues: { specializations: [] },
  });

  const onSubmit = async (values) => {
    try {
      await registerDoctor(values);
      toast.success('Welcome aboard! Your profile is live — add your availability to start receiving patients.');
      navigate(ROLE_HOME.DOCTOR, { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <AuthLayout title="Join as a Doctor" subtitle="Grow your practice and reach patients across the country.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full Name" icon={FiUser} placeholder="Dr. Jane Smith" error={errors.fullName?.message} {...register('fullName')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Email" icon={FiMail} placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
          <Input label="Phone Number" icon={FiPhone} placeholder="+91 98765 43210" error={errors.phone?.message} {...register('phone')} />
        </div>
        <Input label="Profile Picture URL" icon={FiImage} placeholder="https://…  (optional)" error={errors.profilePicture?.message} {...register('profilePicture')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Qualification" icon={FiAward} placeholder="MBBS, MD" error={errors.qualification?.message} {...register('qualification')} />
          <Input label="Experience (years)" type="number" placeholder="8" error={errors.experience?.message} {...register('experience')} />
        </div>
        <Controller
          control={control}
          name="specializations"
          render={({ field }) => (
            <MultiSelect
              label="Specializations (select one or more)"
              options={SPECIALIZATIONS}
              value={field.value}
              onChange={field.onChange}
              placeholder="e.g. Dermatologist, Hair Specialist"
              error={errors.specializations?.message}
            />
          )}
        />
        <Input label="Consultation Charges (₹)" icon={FiDollarSign} type="number" placeholder="500" error={errors.consultationCharges?.message} {...register('consultationCharges')} />
        <Textarea label="About You" placeholder="Tell patients about your expertise and approach…" error={errors.about?.message} {...register('about')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PasswordInput label="Password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
          <PasswordInput label="Confirm Password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        </div>
        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Submit Application
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
