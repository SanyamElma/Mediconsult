import { forwardRef } from 'react';
import { cn } from '../../utils';
import Spinner from './Spinner';

const VARIANTS = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
  subtle: 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base rounded-2xl',
  icon: 'p-2.5 rounded-xl',
};

const Button = forwardRef(function Button(
  { children, variant = 'primary', size = 'md', className, loading, disabled, icon: Icon, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn('btn', VARIANTS[variant], SIZES[size], className)}
      {...props}
    >
      {loading ? <Spinner size={16} /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
});

export default Button;
