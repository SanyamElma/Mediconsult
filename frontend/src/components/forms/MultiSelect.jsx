import Select from 'react-select';
import { cn } from '../../utils';

// Tailwind-driven react-select wrapper that adapts to dark/light themes via `unstyled` + classNames.
const classNames = {
  control: ({ isFocused }) =>
    cn(
      'input flex !min-h-[44px] cursor-text flex-wrap gap-1 !py-1',
      isFocused && '!border-brand-500 !ring-2 !ring-brand-500/30',
    ),
  valueContainer: () => 'flex flex-wrap gap-1',
  placeholder: () => 'text-slate-400',
  input: () => 'text-slate-800 dark:text-slate-100',
  multiValue: () => 'flex items-center gap-1 rounded-lg bg-brand-500/15 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:text-brand-300',
  multiValueRemove: () => 'rounded hover:bg-brand-500/30 cursor-pointer',
  indicatorsContainer: () => 'text-slate-400',
  clearIndicator: () => 'p-1 hover:text-rose-500 cursor-pointer',
  dropdownIndicator: () => 'p-1',
  menu: () => 'mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-800 z-50',
  menuList: () => 'max-h-60 overflow-y-auto py-1',
  option: ({ isFocused, isSelected }) =>
    cn(
      'cursor-pointer px-3 py-2 text-sm',
      isSelected ? 'bg-brand-500 text-white' : isFocused ? 'bg-brand-500/10 text-slate-800 dark:text-slate-100' : 'text-slate-700 dark:text-slate-200',
    ),
  noOptionsMessage: () => 'p-3 text-sm text-slate-400',
};

export default function MultiSelect({ label, error, options, value, onChange, placeholder = 'Select…', isMulti = true }) {
  const toOpt = (v) => ({ value: v, label: v });
  const opts = options.map(toOpt);
  const selected = isMulti ? (value || []).map(toOpt) : value ? toOpt(value) : null;

  return (
    <div>
      {label && <label className="label">{label}</label>}
      <Select
        unstyled
        isMulti={isMulti}
        options={opts}
        value={selected}
        onChange={(sel) => onChange(isMulti ? (sel || []).map((s) => s.value) : sel?.value || '')}
        placeholder={placeholder}
        classNames={classNames}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
      />
      {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}
