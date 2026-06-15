import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiUsers, FiGrid, FiTrendingUp, FiStar, FiArrowRight } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/cards/StatCard';
import DoctorCard from '../../components/cards/DoctorCard';
import { StatSkeleton, CardSkeleton } from '../../components/ui/Skeleton';
import { doctorService } from '../../services/api';

function DoctorRow({ title, doctors, loading }) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-slate-800 dark:text-white">{title}</h2>
        <Link to="/user/doctors" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">
          View all <FiArrowRight size={14} />
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          : doctors?.slice(0, 3).map((d, i) => <DoctorCard key={d.id} doctor={d} delay={i * 0.05} compact />)}
      </div>
    </section>
  );
}

export default function UserDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['patient-dashboard'], queryFn: doctorService.patientDashboard });

  const stats = [
    { label: 'Doctors Available', value: data?.totalDoctors ?? '—', icon: FiUsers, tone: 'brand' },
    { label: 'Specialities', value: data?.totalCategories ?? '—', icon: FiGrid, tone: 'accent' },
    { label: 'Most Booked', value: data?.mostBooked?.[0]?.bookings ?? '—', icon: FiTrendingUp, tone: 'violet' },
    { label: 'Top Rated', value: data?.featured?.[0]?.rating ?? '—', icon: FiStar, tone: 'amber' },
  ];

  return (
    <div>
      <PageHeader title="Find your doctor" subtitle="Browse trusted specialists and book your consultation." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.05} />)}
      </div>

      <DoctorRow title="✨ Featured Doctors" doctors={data?.featured} loading={isLoading} />
      <DoctorRow title="🔥 Most Booked" doctors={data?.mostBooked} loading={isLoading} />
      <DoctorRow title="🩺 Recently Joined" doctors={data?.recentDoctors} loading={isLoading} />
    </div>
  );
}
