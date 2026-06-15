import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiBriefcase, FiMapPin, FiGlobe, FiAward, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import StarRating from '../../components/ui/StarRating';
import Button from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import BookingModal from '../../components/modals/BookingModal';
import { doctorService } from '../../services/api';
import { formatCurrency, formatDate, initials } from '../../utils';
import { WEEK_DAYS } from '../../constants';

export default function DoctorDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(false);
  const { data: doctor, isLoading } = useQuery({ queryKey: ['doctor', id], queryFn: () => doctorService.getById(id) });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }
  if (!doctor) return null;

  return (
    <div>
      <Link to="/user/doctors" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-600">
        <FiArrowLeft /> Back to doctors
      </Link>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-brand-500/15 to-accent-500/15" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end">
          <Avatar src={doctor.profilePicture} name={doctor.name} size={120} ring className="mt-6" />
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white sm:text-3xl">{doctor.name}</h1>
            <p className="text-slate-500 dark:text-slate-400">{doctor.qualification}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <StarRating rating={doctor.rating} count={doctor.reviewCount} size={16} />
              <span className="flex items-center gap-1 text-sm text-slate-500"><FiBriefcase size={14} /> {doctor.experience} yrs</span>
              <span className="flex items-center gap-1 text-sm text-slate-500"><FiMapPin size={14} /> {doctor.city}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {doctor.specializations.map((s) => (
                <Badge key={s} className="bg-brand-500/10 text-brand-700 dark:text-brand-300">{s}</Badge>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Consultation fee</p>
            <p className="font-display text-2xl font-bold gradient-text">{formatCurrency(doctor.consultationCharges)}</p>
            <Button className="mt-3" onClick={() => setBooking(true)}>Book Appointment</Button>
          </div>
        </div>
      </motion.div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* About */}
          <div className="card">
            <h2 className="font-display text-lg font-bold text-slate-800 dark:text-white">About</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{doctor.about}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Info icon={FiAward} label="Qualification" value={doctor.qualification} />
              <Info icon={FiBriefcase} label="Experience" value={`${doctor.experience} years`} />
              <Info icon={FiGlobe} label="Languages" value={doctor.languages?.join(', ')} />
              <Info icon={FiMapPin} label="Location" value={doctor.city} />
            </div>
          </div>

          {/* Reviews */}
          <div className="card">
            <h2 className="font-display text-lg font-bold text-slate-800 dark:text-white">
              Patient Reviews <span className="text-sm font-normal text-slate-400">({doctor.reviews?.length || 0})</span>
            </h2>
            <div className="mt-4 space-y-4">
              {doctor.reviews?.length ? (
                doctor.reviews.map((r) => (
                  <div key={r.id} className="flex gap-3 border-b border-slate-100 pb-4 last:border-0 dark:border-white/5">
                    <Avatar src={r.userAvatar} name={r.userName} size={40} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{r.userName}</p>
                        <span className="text-xs text-slate-400">{formatDate(r.date)}</span>
                      </div>
                      <StarRating rating={r.rating} size={12} className="mt-0.5" />
                      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{r.comment}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No reviews yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Availability calendar */}
        <div className="card h-fit">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-800 dark:text-white">
            <FiCalendar /> Availability
          </h2>
          <div className="mt-3 space-y-2">
            {WEEK_DAYS.map((day) => {
              const slots = doctor.availability?.filter((a) => a.day === day) || [];
              const isAvail = slots.length > 0;
              return (
                <div key={day} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm dark:border-white/5">
                  <span className="font-medium text-slate-600 dark:text-slate-300">{day}</span>
                  {isAvail ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
                      <FiCheckCircle size={12} /> {slots.map((s) => `${s.startTime}–${s.endTime}`).join(', ')}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Unavailable</span>
                  )}
                </div>
              );
            })}
          </div>
          <Button className="mt-4 w-full" onClick={() => setBooking(true)}>Book Appointment</Button>
        </div>
      </div>

      <BookingModal open={booking} onClose={() => setBooking(false)} doctor={doctor} />
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-white/5">
      <Icon className="text-brand-500" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
}
