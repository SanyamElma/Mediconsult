import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiClock, FiSave } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import { doctorService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { WEEK_DAYS } from '../../constants';
import { cn } from '../../utils';

const TIMES = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM',
];

export default function DoctorAvailability() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [slots, setSlots] = useState([]);

  const { data } = useQuery({ queryKey: ['doctor', user?.id], queryFn: () => doctorService.getById(user.id) });

  useEffect(() => {
    if (data?.availability) setSlots(data.availability);
  }, [data]);

  const addSlot = (day) =>
    setSlots((s) => [...s, { id: Date.now() + Math.random(), day, startTime: '09:00 AM', endTime: '01:00 PM' }]);

  const updateSlot = (id, field, value) => setSlots((s) => s.map((x) => (x.id === id ? { ...x, [field]: value } : x)));
  const removeSlot = (id) => setSlots((s) => s.filter((x) => x.id !== id));

  const mut = useMutation({
    mutationFn: () => doctorService.setAvailability(user.id, slots),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctor', user.id] });
      toast.success('Availability saved');
    },
  });

  return (
    <div>
      <PageHeader
        title="Manage Availability"
        subtitle="Set your weekly consultation hours."
        actions={<Button loading={mut.isPending} onClick={() => mut.mutate()}><FiSave size={16} /> Save Changes</Button>}
      />

      <div className="space-y-4">
        {WEEK_DAYS.map((day) => {
          const daySlots = slots.filter((s) => s.day === day);
          return (
            <div key={day} className="card">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-slate-800 dark:text-white">
                  <FiClock className="text-brand-500" /> {day}
                </h3>
                <Button variant="outline" size="sm" onClick={() => addSlot(day)}><FiPlus size={14} /> Add slot</Button>
              </div>

              {daySlots.length === 0 ? (
                <p className="mt-3 text-sm text-slate-400">No hours set — patients won&apos;t be able to book on {day}.</p>
              ) : (
                <div className="mt-4 space-y-2">
                  {daySlots.map((s) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <TimeSelect value={s.startTime} onChange={(v) => updateSlot(s.id, 'startTime', v)} />
                      <span className="text-slate-400">to</span>
                      <TimeSelect value={s.endTime} onChange={(v) => updateSlot(s.id, 'endTime', v)} />
                      <button onClick={() => removeSlot(s.id)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimeSelect({ value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={cn('input w-36')}>
      {TIMES.map((t) => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
  );
}
