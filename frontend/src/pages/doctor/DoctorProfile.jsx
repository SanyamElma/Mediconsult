import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { FiImage, FiAward, FiBriefcase, FiDollarSign } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import { Input, Textarea } from '../../components/forms/FormField';
import MultiSelect from '../../components/forms/MultiSelect';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import StarRating from '../../components/ui/StarRating';
import { doctorService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { SPECIALIZATIONS } from '../../constants';

export default function DoctorProfile() {
  const { user, updateCurrentUser } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['doctor', user?.id], queryFn: () => doctorService.getById(user.id) });

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      profilePicture: user?.profilePicture,
      qualification: '',
      experience: 0,
      specializations: [],
      consultationCharges: 0,
      about: '',
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        profilePicture: data.profilePicture,
        qualification: data.qualification,
        experience: data.experience,
        specializations: data.specializations,
        consultationCharges: data.consultationCharges,
        about: data.about,
      });
    }
  }, [data, reset]);

  const preview = watch('profilePicture');

  const mut = useMutation({
    mutationFn: (values) => doctorService.updateProfile(user.id, { ...values, experience: Number(values.experience), consultationCharges: Number(values.consultationCharges) }),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['doctor', user.id] });
      updateCurrentUser({ profilePicture: updated.profilePicture });
      toast.success('Profile updated successfully');
    },
  });

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Keep your professional details up to date." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card flex h-fit flex-col items-center text-center">
          <Avatar src={preview} name={user?.name} size={120} ring />
          <h3 className="mt-4 font-display text-lg font-bold text-slate-800 dark:text-white">{user?.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{data?.qualification}</p>
          {data && <StarRating rating={data.rating} count={data.reviewCount} className="mt-2" />}
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {data?.specializations?.map((s) => (
              <span key={s} className="badge bg-brand-500/10 text-brand-700 dark:text-brand-300">{s}</span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit((v) => mut.mutate(v))} className="card space-y-4 lg:col-span-2">
          <Input label="Profile Picture URL" icon={FiImage} {...register('profilePicture')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Qualification" icon={FiAward} {...register('qualification')} />
            <Input label="Experience (years)" icon={FiBriefcase} type="number" {...register('experience')} />
          </div>
          <Controller
            control={control}
            name="specializations"
            render={({ field }) => (
              <MultiSelect label="Specializations (multi-select)" options={SPECIALIZATIONS} value={field.value} onChange={field.onChange} />
            )}
          />
          <Input label="Consultation Charges (₹)" icon={FiDollarSign} type="number" {...register('consultationCharges')} />
          <Textarea label="Bio / About" {...register('about')} />
          <div className="flex justify-end">
            <Button type="submit" loading={mut.isPending}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
