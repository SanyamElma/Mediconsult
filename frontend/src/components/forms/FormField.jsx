import { forwardRef, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { cn } from '../../utils';

export const Input = forwardRef(function Input({ label, error, icon: Icon, className, ...props }, ref) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />}
        <input ref={ref} className={cn('input', Icon && 'pl-10', error && 'border-rose-400 focus:ring-rose-400/30', className)} {...props} />
      </div>
      {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
});

export const PasswordInput = forwardRef(function PasswordInput({ label, error, ...props }, ref) {
  const [show, setShow] = useState(false);
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <input ref={ref} type={show ? 'text' : 'password'} className={cn('input pr-10', error && 'border-rose-400 focus:ring-rose-400/30')} {...props} />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          {show ? <FiEyeOff size={17} /> : <FiEye size={17} />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ label, error, className, ...props }, ref) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <textarea ref={ref} className={cn('input min-h-[96px] resize-y', error && 'border-rose-400', className)} {...props} />
      {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
});
