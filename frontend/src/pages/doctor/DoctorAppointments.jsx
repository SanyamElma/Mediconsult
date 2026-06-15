import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiCheckCircle, FiCalendar } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { appointmentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { APPOINTMENT_STATUS } from '../../constants';
import { cn, formatCurrency, formatDate } from '../../utils';

const FILTERS = ['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'];

export default function DoctorAppointments() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState('ALL');

  const { data = [], isLoading } = useQuery({
    queryKey: ['doctor-appointments', user?.id],
    queryFn: () => appointmentService.forDoctor(user.id),
  });

  const mut = useMutation({
    mutationFn: ({ id, status }) => appointmentService.updateStatus(id, status, user?.email),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ['doctor-appointments'] });
      qc.invalidateQueries({ queryKey: ['doctor-stats'] });
      toast.success(`Appointment ${status.toLowerCase()}`);
    },
  });

  const filtered = useMemo(
    () => (filter === 'ALL' ? data : data.filter((a) => a.status === filter || (filter === 'CANCELLED' && a.status === 'REJECTED'))),
    [data, filter],
  );

  return (
    <div>
      <PageHeader title="Appointments" subtitle="Accept, reject or complete patient appointments." />

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-semibold transition',
              filter === f ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300',
            )}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={FiCalendar} title="No appointments" message="There are no appointments in this category." />
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div key={a.id} className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar src={a.userAvatar} name={a.userName} size={52} ring />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">{a.userName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{a.reason}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(a.date, { weekday: 'short' })} · {a.slot} · <span className="font-semibold">{formatCurrency(a.charges)}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={a.status} />
                {a.status === APPOINTMENT_STATUS.PENDING && (
                  <>
                    <Button variant="success" size="sm" loading={mut.isPending} onClick={() => mut.mutate({ id: a.id, status: APPOINTMENT_STATUS.ACCEPTED })}><FiCheck size={14} /> Accept</Button>
                    <Button variant="danger" size="sm" onClick={() => mut.mutate({ id: a.id, status: APPOINTMENT_STATUS.REJECTED })}><FiX size={14} /> Reject</Button>
                  </>
                )}
                {a.status === APPOINTMENT_STATUS.ACCEPTED && (
                  <Button size="sm" onClick={() => mut.mutate({ id: a.id, status: APPOINTMENT_STATUS.COMPLETED })}><FiCheckCircle size={14} /> Complete</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
