import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FiCalendar, FiClock, FiCheck } from 'react-icons/fi';
import Modal from './Modal';
import Button from '../ui/Button';
import { Textarea } from '../forms/FormField';
import { appointmentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { WEEK_DAYS, TIME_SLOTS } from '../../constants';
import { cn, formatCurrency, addDaysISO } from '../../utils';

// Build the next 14 selectable dates, marking which days the doctor is available.
function buildDates(availability) {
  const availDays = new Set((availability || []).map((a) => a.day));
  return Array.from({ length: 14 }).map((_, i) => {
    const iso = addDaysISO(i);
    const d = new Date(iso);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    return {
      iso,
      label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      available: availDays.has(dayName),
    };
  });
}

export default function BookingModal({ open, onClose, doctor }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const dates = useMemo(() => buildDates(doctor?.availability), [doctor]);

  const reset = () => {
    setDate('');
    setSlot('');
    setReason('');
    setConfirmed(false);
  };

  const mutation = useMutation({
    mutationFn: () =>
      appointmentService.book({ userId: user.id, doctorId: doctor.id, date, slot, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-appointments'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
      setConfirmed(true);
      toast.success('Appointment booked successfully!');
    },
    onError: () => toast.error('Could not book appointment. Please try again.'),
  });

  const close = () => {
    onClose();
    setTimeout(reset, 250);
  };

  if (!doctor) return null;

  return (
    <Modal
      open={open}
      onClose={close}
      title={confirmed ? 'Booking Confirmed' : `Book with ${doctor.name}`}
      size="lg"
      footer={
        !confirmed && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Total payable</p>
              <p className="font-display text-lg font-bold text-slate-800 dark:text-white">{formatCurrency(doctor.consultationCharges)}</p>
            </div>
            <Button disabled={!date || !slot} loading={mutation.isPending} onClick={() => mutation.mutate()}>
              Confirm Appointment
            </Button>
          </div>
        )
      }
    >
      {confirmed ? (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 dark:bg-emerald-500/15">
            <FiCheck size={32} />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold text-slate-800 dark:text-white">You&apos;re all set!</h3>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Appointment with {doctor.name} on{' '}
            <span className="font-semibold">{new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span> at{' '}
            <span className="font-semibold">{slot}</span>.
          </p>
          <p className="mt-1 text-sm text-amber-600">Pending doctor confirmation.</p>
          <Button className="mt-6" onClick={close}>Done</Button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Step 1: Date */}
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"><FiCalendar /> Select a date</p>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {dates.map((d) => (
                <button
                  key={d.iso}
                  disabled={!d.available}
                  onClick={() => setDate(d.iso)}
                  className={cn(
                    'min-w-[88px] shrink-0 rounded-xl border px-3 py-2.5 text-center text-sm transition',
                    date === d.iso
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : d.available
                        ? 'border-slate-200 hover:border-brand-400 dark:border-white/10'
                        : 'cursor-not-allowed border-slate-100 text-slate-300 dark:border-white/5 dark:text-slate-600',
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Slot */}
          {date && (
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"><FiClock /> Select a time slot</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSlot(t)}
                    className={cn(
                      'rounded-xl border px-2 py-2 text-sm transition',
                      slot === t ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-200 hover:border-brand-400 dark:border-white/10',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Reason */}
          {slot && (
            <Textarea
              label="Reason for visit (optional)"
              placeholder="Briefly describe your symptoms or concern…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          )}
        </div>
      )}
    </Modal>
  );
}
