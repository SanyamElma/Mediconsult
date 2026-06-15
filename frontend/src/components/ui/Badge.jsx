import { cn } from '../../utils';

export default function Badge({ children, className, dot }) {
  return (
    <span className={cn('badge', className || 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300')}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
