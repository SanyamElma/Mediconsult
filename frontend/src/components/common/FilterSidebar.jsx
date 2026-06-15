import { FiX } from 'react-icons/fi';
import {
  SPECIALIZATIONS,
  EXPERIENCE_BUCKETS,
  CHARGE_BUCKETS,
  AVAILABILITY_FILTERS,
  RATING_FILTERS,
} from '../../constants';
import { cn } from '../../utils';

function Section({ title, children }) {
  return (
    <div className="border-b border-slate-200/70 py-4 last:border-0 dark:border-white/10">
      <h4 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-200">{title}</h4>
      {children}
    </div>
  );
}

function Radio({ checked, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition',
        checked ? 'bg-brand-500/10 font-semibold text-brand-700 dark:text-brand-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5',
      )}
    >
      <span className={cn('flex h-4 w-4 items-center justify-center rounded-full border', checked ? 'border-brand-500' : 'border-slate-300 dark:border-white/20')}>
        {checked && <span className="h-2 w-2 rounded-full bg-brand-500" />}
      </span>
      {children}
    </button>
  );
}

/** Controlled filter panel. `filters` shape mirrors what doctorService.list expects. */
export default function FilterSidebar({ filters, setFilters, onClose, className }) {
  const toggleSpec = (s) => {
    const cur = filters.specializations || [];
    setFilters({ ...filters, specializations: cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s], page: 1 });
  };

  const setBucket = (key, bucket) =>
    setFilters({ ...filters, [key]: filters[key]?.label === bucket.label ? undefined : bucket, page: 1 });

  const reset = () =>
    setFilters({ search: filters.search, sort: filters.sort, page: 1, size: filters.size });

  return (
    <div className={cn('card h-fit', className)}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">Filters</h3>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="text-xs font-semibold text-brand-600 hover:underline">Clear all</button>
          {onClose && <button onClick={onClose} className="lg:hidden"><FiX /></button>}
        </div>
      </div>

      <Section title="Specialization">
        <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
          {SPECIALIZATIONS.map((s) => {
            const checked = (filters.specializations || []).includes(s);
            return (
              <label key={s} className={cn('flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm', checked ? 'bg-brand-500/10 font-semibold text-brand-700 dark:text-brand-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5')}>
                <input type="checkbox" checked={checked} onChange={() => toggleSpec(s)} className="accent-brand-500" />
                {s}
              </label>
            );
          })}
        </div>
      </Section>

      <Section title="Experience">
        {EXPERIENCE_BUCKETS.map((b) => (
          <Radio key={b.label} checked={filters.experience?.label === b.label} onClick={() => setBucket('experience', b)}>{b.label}</Radio>
        ))}
      </Section>

      <Section title="Consultation Charges">
        {CHARGE_BUCKETS.map((b) => (
          <Radio key={b.label} checked={filters.charges?.label === b.label} onClick={() => setBucket('charges', b)}>{b.label}</Radio>
        ))}
      </Section>

      <Section title="Availability">
        {AVAILABILITY_FILTERS.map((a) => (
          <Radio key={a.value} checked={filters.availability === a.value} onClick={() => setFilters({ ...filters, availability: filters.availability === a.value ? undefined : a.value, page: 1 })}>{a.label}</Radio>
        ))}
      </Section>

      <Section title="Ratings">
        {RATING_FILTERS.map((r) => (
          <Radio key={r.value} checked={filters.minRating === r.value} onClick={() => setFilters({ ...filters, minRating: filters.minRating === r.value ? undefined : r.value, page: 1 })}>{r.label}</Radio>
        ))}
      </Section>
    </div>
  );
}
