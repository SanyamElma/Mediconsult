import { useQuery } from '@tanstack/react-query';
import { FiCalendar, FiSun, FiDollarSign, FiUsers } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/cards/StatCard';
import Avatar from '../../components/ui/Avatar';
import { StatusBadge, ApprovalBadge } from '../../components/ui/StatusBadge';
import { StatSkeleton, TableSkeleton } from '../../components/ui/Skeleton';
import { AreaTrend } from '../../components/charts/Charts';
import EmptyState from '../../components/ui/EmptyState';
import { doctorService, appointmentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, todayISO } from '../../utils';
import { APPOINTMENT_STATUS } from '../../constants';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery({ queryKey: ['doctor-stats', user?.id], queryFn: () => doctorService.stats(user.id) });
  const { data: earnings } = useQuery({ queryKey: ['doctor-earnings', user?.id], queryFn: () => doctorService.earnings(user.id) });
  const { data: appts = [], isLoading: apptLoading } = useQuery({
    queryKey: ['doctor-appointments', user?.id],
    queryFn: () => appointmentService.forDoctor(user.id),
  });

  const todays = appts.filter((a) => a.date === todayISO());
  const pending = appts.filter((a) => a.status === APPOINTMENT_STATUS.PENDING).slice(0, 5);

  const cards = [
    { label: 'Total Appointments', value: stats?.totalAppointments ?? '—', icon: FiCalendar, tone: 'brand' },
    { label: "Today's Appointments", value: stats?.todayAppointments ?? '—', icon: FiSun, tone: 'amber' },
    { label: 'Monthly Earnings', value: formatCurrency(stats?.monthlyEarnings || 0), icon: FiDollarSign, tone: 'emerald' },
    { label: 'Upcoming Patients', value: stats?.upcomingPatients ?? '—', icon: FiUsers, tone: 'violet' },
  ];

  return (
    <div>
      <PageHeader
        title="Doctor Dashboard"
        subtitle="Your practice at a glance."
        actions={user?.approvalStatus && <ApprovalBadge status={user.approvalStatus} />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />) : cards.map((c, i) => <StatCard key={c.label} {...c} delay={i * 0.05} />)}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-bold text-slate-800 dark:text-white">Earnings — last 7 days</h2>
          {earnings ? <AreaTrend data={earnings.daily} color="#06c8ad" formatter={formatCurrency} /> : <TableSkeleton rows={3} />}
        </div>

        <div className="card">
          <h2 className="mb-4 font-display text-lg font-bold text-slate-800 dark:text-white">Today&apos;s Schedule</h2>
          {apptLoading ? (
            <TableSkeleton rows={3} />
          ) : todays.length === 0 ? (
            <EmptyState icon={FiCalendar} title="No appointments today" />
          ) : (
            <div className="space-y-3">
              {todays.map((a) => (
                <div key={a.id} className="flex items-center gap-3">
                  <Avatar src={a.userAvatar} name={a.userName} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">{a.userName}</p>
                    <p className="text-xs text-slate-400">{a.slot} · {a.reason}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="mb-4 font-display text-lg font-bold text-slate-800 dark:text-white">Pending Requests</h2>
        {pending.length === 0 ? (
          <EmptyState title="No pending requests" message="New appointment requests will show up here." />
        ) : (
          <div className="space-y-3">
            {pending.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <Avatar src={a.userAvatar} name={a.userName} size={36} />
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{a.userName}</p>
                    <p className="text-xs text-slate-400">{formatDate(a.date)} · {a.slot}</p>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
