import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiUsers } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/modals/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { appointmentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils';

export default function DoctorPatients() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['doctor-appointments', user?.id],
    queryFn: () => appointmentService.forDoctor(user.id),
  });

  // Group appointments by patient.
  const patients = useMemo(() => {
    const map = new Map();
    data.forEach((a) => {
      if (!map.has(a.userId)) map.set(a.userId, { id: a.userId, name: a.userName, avatar: a.userAvatar, phone: a.userPhone, visits: [] });
      map.get(a.userId).visits.push(a);
    });
    return Array.from(map.values()).sort((a, b) => b.visits.length - a.visits.length);
  }, [data]);

  return (
    <div>
      <PageHeader title="Patients" subtitle={`${patients.length} patients have consulted you.`} />

      {isLoading ? (
        <TableSkeleton rows={6} />
      ) : patients.length === 0 ? (
        <EmptyState icon={FiUsers} title="No patients yet" message="Patients you consult will appear here." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patients.map((p) => (
            <button key={p.id} onClick={() => setSelected(p)} className="card text-left transition hover:shadow-lg">
              <div className="flex items-center gap-3">
                <Avatar src={p.avatar} name={p.name} size={52} ring />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">{p.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{p.phone}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                <span className="font-bold text-brand-600">{p.visits.length}</span> visit{p.visits.length > 1 ? 's' : ''} · Last {formatDate(p.visits[0].date)}
              </p>
            </button>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Patient History" size="lg">
        {selected && (
          <div>
            <div className="flex items-center gap-4">
              <Avatar src={selected.avatar} name={selected.name} size={64} ring />
              <div>
                <p className="font-display text-lg font-bold text-slate-800 dark:text-white">{selected.name}</p>
                <p className="text-sm text-slate-500">{selected.phone}</p>
              </div>
            </div>
            <h4 className="mb-2 mt-5 text-sm font-bold text-slate-700 dark:text-slate-200">Consultation History</h4>
            <div className="space-y-2">
              {selected.visits.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 dark:border-white/5">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{v.reason}</p>
                    <p className="text-xs text-slate-400">{formatDate(v.date)} · {v.slot}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{formatCurrency(v.charges)}</span>
                    <StatusBadge status={v.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
