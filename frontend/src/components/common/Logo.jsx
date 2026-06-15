import { Link } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import { config } from '../../config';
import { cn } from '../../utils';

export default function Logo({ to = '/', className, compact }) {
  return (
    <Link to={to} className={cn('flex items-center gap-2.5', className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow">
        <FiPlus size={20} strokeWidth={3} />
      </span>
      {!compact && (
        <span className="font-display text-lg font-extrabold tracking-tight">
          <span className="text-slate-800 dark:text-white">Medi</span>
          <span className="gradient-text">Consult</span>
        </span>
      )}
    </Link>
  );
}

export { config };
