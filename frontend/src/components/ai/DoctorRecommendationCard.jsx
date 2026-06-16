import { Link } from 'react-router-dom';
import { FiBriefcase, FiStar, FiCheckCircle } from 'react-icons/fi';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { formatCurrency } from '../../utils';

/**
 * Compact doctor card used inside the AI recommendations list.
 * The "Book" CTA deep-links straight into the existing booking flow.
 */
export default function DoctorRecommendationCard({ doctor, onNavigate }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900/40">
      <div className="flex gap-3">
        <Avatar src={doctor.profilePicture} name={doctor.name} size={44} ring />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-bold text-slate-800 dark:text-white">{doctor.name}</p>
            <span className="shrink-0 rounded-md bg-brand-500/10 px-1.5 py-0.5 text-[10px] font-bold text-brand-600 dark:text-brand-300">
              {doctor.matchScore}% match
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap gap-1">
            {doctor.specializations?.slice(0, 2).map((s) => (
              <Badge key={s} className="bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">{s}</Badge>
            ))}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><FiStar className="text-amber-400" size={12} /> {doctor.rating?.toFixed(1)}</span>
            <span className="flex items-center gap-1"><FiBriefcase size={12} /> {doctor.experience} yrs</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(doctor.consultationCharges)}</span>
            {doctor.available && <span className="flex items-center gap-1 text-emerald-500"><FiCheckCircle size={12} /> Available</span>}
          </div>
        </div>
      </div>
      <Link
        to={`/user/doctors/${doctor.id}`}
        onClick={onNavigate}
        className="btn btn-primary mt-2.5 w-full !py-2 text-xs"
      >
        Book Appointment
      </Link>
    </div>
  );
}
