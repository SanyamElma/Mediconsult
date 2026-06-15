import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiUsers, FiActivity, FiCalendar, FiDollarSign, FiArrowRight, FiClock } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/cards/StatCard';
import { MultiLine, DonutChart } from '../../components/charts/Charts';
import { StatSkeleton, TableSkeleton } from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import { adminService } from '../../services/api';
import { formatCurrency, formatCompact } from '../../utils';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: adminService.stats });
  const { data: analytics } = useQuery({ queryKey: ['admin-analytics'], queryFn: adminService.analytics });

  const cards = [
    { label: 'Total Users', value: formatCompact(stats?.totalUsers || 0), icon: FiUsers, tone: 'brand' },
    { label: 'Total Doctors', value: formatCompact(stats?.totalDoctors || 0), icon: FiActivity, tone: 'accent' },
    { label: 'Appointments', value: formatCompact(stats?.totalAppointments || 0), icon: FiCalendar, tone: 'violet' },
    { label: 'Revenue', value: formatCurrency(stats?.revenue || 0), icon: FiDollarSign, tone: 'emerald' },
  ];

  return (
    <div>
      <PageHeader
        title="Admin Overview"
        subtitle="Platform-wide metrics and activity."
        actions={
          stats?.pendingDoctors > 0 && (
            <Link to="/admin/doctors">
              <Button variant="outline"><FiClock size={16} /> {stats.pendingDoctors} pending approvals</Button>
            </Link>
          )
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />) : cards.map((c, i) => <StatCard key={c.label} {...c} delay={i * 0.05} />)}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-800 dark:text-white">Registrations & Revenue</h2>
            <Link to="/admin/analytics" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline">Details <FiArrowRight size={14} /></Link>
          </div>
          {analytics ? (
            <MultiLine
              data={analytics.months}
              lines={[
                { key: 'users', name: 'Users', color: '#1b83f5' },
                { key: 'doctors', name: 'Doctors', color: '#06c8ad' },
              ]}
            />
          ) : (
            <TableSkeleton rows={4} />
          )}
        </div>

        <div className="card">
          <h2 className="mb-4 font-display text-lg font-bold text-slate-800 dark:text-white">Appointments by Status</h2>
          {analytics ? <DonutChart data={analytics.byStatus} /> : <TableSkeleton rows={4} />}
        </div>
      </div>
    </div>
  );
}
