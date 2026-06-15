import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import { MultiLine, BarSeries, DonutChart, AreaTrend } from '../../components/charts/Charts';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { adminService } from '../../services/api';
import { formatCurrency } from '../../utils';

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-analytics'], queryFn: adminService.analytics });

  if (isLoading || !data) {
    return (
      <div>
        <PageHeader title="Analytics" subtitle="Platform growth and revenue insights." />
        <TableSkeleton rows={8} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Platform growth and revenue insights." />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 font-display text-lg font-bold text-slate-800 dark:text-white">Daily / Monthly Registrations</h2>
          <MultiLine
            data={data.months}
            lines={[
              { key: 'users', name: 'User Registrations', color: '#1b83f5' },
              { key: 'doctors', name: 'Doctor Registrations', color: '#06c8ad' },
            ]}
          />
        </div>

        <div className="card">
          <h2 className="mb-4 font-display text-lg font-bold text-slate-800 dark:text-white">Revenue Trend</h2>
          <AreaTrend data={data.months.map((m) => ({ label: m.label, value: m.revenue }))} color="#8b5cf6" formatter={formatCurrency} />
        </div>

        <div className="card">
          <h2 className="mb-4 font-display text-lg font-bold text-slate-800 dark:text-white">Doctors by Speciality</h2>
          <BarSeries data={data.topSpecializations} color="#1b83f5" />
        </div>

        <div className="card">
          <h2 className="mb-4 font-display text-lg font-bold text-slate-800 dark:text-white">Appointments by Status</h2>
          <DonutChart data={data.byStatus} />
        </div>
      </div>
    </div>
  );
}
