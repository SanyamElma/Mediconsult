import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiUser, FiPhone, FiImage, FiMail } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import { Input } from '../../components/forms/FormField';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { userService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { profileSchema } from '../../validations/authSchemas';

export default function UserProfile() {
  const { user, updateCurrentUser } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name, phone: user?.phone, profilePicture: user?.profilePicture },
  });

  const preview = watch('profilePicture');

  const mut = useMutation({
    mutationFn: (values) => userService.updateProfile(user.id, values),
    onSuccess: (updated) => {
      updateCurrentUser(updated);
      toast.success('Profile updated successfully');
    },
    onError: () => toast.error('Could not update profile'),
  });

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Update your personal information." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card flex flex-col items-center text-center">
          <Avatar src={preview || user?.profilePicture} name={user?.name} size={120} ring />
          <h3 className="mt-4 font-display text-lg font-bold text-slate-800 dark:text-white">{user?.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          <span className="badge mt-3 bg-brand-500/10 text-brand-700 dark:text-brand-300">Patient</span>
        </div>

        <form onSubmit={handleSubmit((v) => mut.mutate(v))} className="card space-y-4 lg:col-span-2">
          <Input label="Full Name" icon={FiUser} error={errors.name?.message} {...register('name')} />
          <Input label="Email" icon={FiMail} value={user?.email} disabled className="opacity-70" />
          <Input label="Phone Number" icon={FiPhone} error={errors.phone?.message} {...register('phone')} />
          <Input label="Profile Picture URL" icon={FiImage} placeholder="https://…" error={errors.profilePicture?.message} {...register('profilePicture')} />
          <div className="flex justify-end">
            <Button type="submit" loading={mut.isPending} disabled={!isDirty}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
