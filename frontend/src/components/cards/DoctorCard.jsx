import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBriefcase, FiMapPin, FiCheckCircle } from 'react-icons/fi';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import StarRating from '../ui/StarRating';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils';

export default function DoctorCard({ doctor, delay = 0, compact }) {
  const available = doctor.availability?.length > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="card group flex flex-col hover:shadow-lg hover:shadow-brand-500/5"
    >
      <div className="flex gap-3.5">
        <Avatar src={doctor.profilePicture} name={doctor.name} size={56} ring />
        <div className="min-w-0 flex-1">
          <Link to={`/user/doctors/${doctor.id}`} className="line-clamp-2 font-display text-base font-bold leading-tight text-slate-800 hover:text-brand-600 dark:text-white">
            {doctor.name}
          </Link>
          <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{doctor.qualification}</p>
          <div className="mt-1.5">
            <StarRating rating={doctor.rating} count={doctor.reviewCount} />
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {doctor.specializations.slice(0, 2).map((s) => (
          <Badge key={s} className="bg-brand-500/10 text-brand-700 dark:text-brand-300">{s}</Badge>
        ))}
        {doctor.specializations.length > 2 && <Badge>+{doctor.specializations.length - 2}</Badge>}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5"><FiBriefcase size={14} /> {doctor.experience} yrs exp</span>
        <span className="flex items-center gap-1.5"><FiMapPin size={14} /> {doctor.city}</span>
      </div>

      {!compact && doctor.about && (
        <p className="mt-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{doctor.about}</p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/5">
        <div>
          <p className="text-xs text-slate-400">Consultation</p>
          <p className="font-display text-lg font-bold text-slate-800 dark:text-white">{formatCurrency(doctor.consultationCharges)}</p>
        </div>
        {available && (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
            <FiCheckCircle size={13} /> Available
          </span>
        )}
      </div>

      <Link to={`/user/doctors/${doctor.id}`} className="mt-3">
        <Button className="w-full whitespace-nowrap">Book Appointment</Button>
      </Link>
    </motion.div>
  );
}
