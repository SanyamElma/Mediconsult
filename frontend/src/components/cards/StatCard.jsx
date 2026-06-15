import { motion } from 'framer-motion';
import { cn } from '../../utils';

const TONES = {
  brand: 'from-brand-500 to-brand-600 text-brand-600',
  accent: 'from-accent-500 to-accent-600 text-accent-600',
  violet: 'from-violet-500 to-purple-600 text-violet-600',
  amber: 'from-amber-500 to-orange-500 text-amber-600',
  rose: 'from-rose-500 to-pink-600 text-rose-600',
  emerald: 'from-emerald-500 to-teal-600 text-emerald-600',
};

export default function StatCard({ label, value, icon: Icon, tone = 'brand', trend, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="card group relative overflow-hidden"
    >
      <div className={cn('absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 blur-2xl', TONES[tone])} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-800 dark:text-white">{value}</p>
          {trend && (
            <p className={cn('mt-1 text-xs font-semibold', trend.up ? 'text-emerald-500' : 'text-rose-500')}>
              {trend.up ? '▲' : '▼'} {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg', TONES[tone])}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
