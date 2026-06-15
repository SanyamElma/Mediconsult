import { useQuery } from '@tanstack/react-query';
import { FiDollarSign, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/cards/StatCard';
import { AreaTrend, BarSeries } from '../../components/charts/Charts';
import { StatSkeleton } from '../../components/ui/Skeleton';
import { doctorService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils';

export default function DoctorEarnings() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery({ queryKey: ['doctor-stats', user?.id], queryFn: () => doctorService.stats(user.id) });
  const { data: earnings } = useQuery({ queryKey: ['doctor-earnings', user?.id], queryFn: () => doctorService.earnings(user.id) });

  const weekly = earnings?.daily?.reduce((s, d) => s + d.value, 0) || 0;

  const cards = [
    { label: 'Total Earnings', value: formatCurrency(stats?.totalEarnings || 0), icon: FiDollarSign, tone: 'emerald' },
    { label: 'This Week', value: formatCurrency(weekly), icon: FiCalendar, tone: 'brand' },
    { label: 'This Month', value: formatCurrency(stats?.monthlyEarnings || 0), icon: FiTrendingUp, tone: 'violet' },
  ];

  return (
    <div>
      <PageHeader title="Earnings" subtitle="Track your consultation revenue over time." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <StatSkeleton key={i} />) : cards.map((c, i) => <StatCard key={c.label} {...c} delay={i * 0.05} />)}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 font-display text-lg font-bold text-slate-800 dark:text-white">Daily Earnings (7 days)</h2>
          {earnings && <AreaTrend data={earnings.daily} color="#1b83f5" formatter={formatCurrency} />}
        </div>
        <div className="card">
          <h2 className="mb-4 font-display text-lg font-bold text-slate-800 dark:text-white">Monthly Earnings (6 months)</h2>
          {earnings && <BarSeries data={earnings.monthly} color="#06c8ad" formatter={formatCurrency} />}
        </div>
      </div>
    </div>
  );
}
