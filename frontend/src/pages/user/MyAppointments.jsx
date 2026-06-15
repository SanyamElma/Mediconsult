import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiCalendar, FiClock, FiRefreshCw, FiX } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Modal from '../../components/modals/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { appointmentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { APPOINTMENT_STATUS, TIME_SLOTS } from '../../constants';
import { cn, formatCurrency, formatDate, addDaysISO } from '../../utils';

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const UPCOMING = [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.ACCEPTED];
const CANCELLED = [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.REJECTED];

export default function MyAppointments() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState('upcoming');
  const [reschedule, setReschedule] = useState(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['user-appointments', user?.id],
    queryFn: () => appointmentService.forUser(user.id),
  });

  const filtered = useMemo(() => {
    if (tab === 'upcoming') return data.filter((a) => UPCOMING.includes(a.status));
    if (tab === 'completed') return data.filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED);
    return data.filter((a) => CANCELLED.includes(a.status));
  }, [data, tab]);

  const cancelMut = useMutation({
    mutationFn: (id) => appointmentService.updateStatus(id, APPOINTMENT_STATUS.CANCELLED, user?.email),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-appointments'] });
      toast.success('Appointment cancelled');
    },
  });

  const counts = {
    upcoming: data.filter((a) => UPCOMING.includes(a.status)).length,
    completed: data.filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED).length,
    cancelled: data.filter((a) => CANCELLED.includes(a.status)).length,
  };

  return (
    <div>
      <PageHeader title="My Appointments" subtitle="Manage your upcoming and past consultations." />

      <div className="mb-6 inline-flex rounded-2xl bg-slate-100 p-1.5 dark:bg-white/5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-semibold transition',
              tab === t.key ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
            )}
          >
            {t.label} <span className="ml-1 text-xs opacity-70">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={FiCalendar} title="No appointments here" message="When you book a consultation it will appear in this list." />
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <div key={a.id} className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar src={a.doctorAvatar} name={a.doctorName} size={56} ring />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">{a.doctorName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{a.specialization}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><FiCalendar size={13} /> {formatDate(a.date, { weekday: 'short' })}</span>
                    <span className="flex items-center gap-1"><FiClock size={13} /> {a.slot}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(a.charges)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={a.status} />
                {UPCOMING.includes(a.status) && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setReschedule(a)}><FiRefreshCw size={14} /> Reschedule</Button>
                    <Button variant="danger" size="sm" loading={cancelMut.isPending} onClick={() => cancelMut.mutate(a.id)}><FiX size={14} /> Cancel</Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <RescheduleModal appointment={reschedule} onClose={() => setReschedule(null)} />
    </div>
  );
}

function RescheduleModal({ appointment, onClose }) {
  const qc = useQueryClient();
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');

  const mut = useMutation({
    mutationFn: () => appointmentService.reschedule(appointment.id, { date, slot }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-appointments'] });
      toast.success('Appointment rescheduled');
      onClose();
      setDate('');
      setSlot('');
    },
  });

  const dates = Array.from({ length: 10 }).map((_, i) => {
    const iso = addDaysISO(i + 1);
    return { iso, label: new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) };
  });

  return (
    <Modal
      open={!!appointment}
      onClose={onClose}
      title="Reschedule Appointment"
      footer={<Button className="w-full" disabled={!date || !slot} loading={mut.isPending} onClick={() => mut.mutate()}>Confirm new time</Button>}
    >
      <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Pick a new date</p>
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {dates.map((d) => (
          <button key={d.iso} onClick={() => setDate(d.iso)} className={cn('min-w-[88px] shrink-0 rounded-xl border px-3 py-2.5 text-sm', date === d.iso ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-200 dark:border-white/10')}>
            {d.label}
          </button>
        ))}
      </div>
      {date && (
        <>
          <p className="mb-2 mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Pick a slot</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {TIME_SLOTS.map((t) => (
              <button key={t} onClick={() => setSlot(t)} className={cn('rounded-xl border px-2 py-2 text-sm', slot === t ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-200 dark:border-white/10')}>{t}</button>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}
