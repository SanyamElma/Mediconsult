import { CONCERN_META } from '../../constants/ai';

/**
 * Semicircular gauge for the 0-100 Health Concern Score.
 * Color reflects concern level (low/medium/high).
 */
export default function HealthScoreGauge({ score = 0, concernLevel = 'LOW' }) {
  const meta = CONCERN_META[concernLevel] || CONCERN_META.LOW;
  const radius = 52;
  const circumference = Math.PI * radius; // semicircle
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = circumference * pct;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 140, height: 80 }}>
        <svg width="140" height="80" viewBox="0 0 140 80">
          {/* track */}
          <path d="M 14 76 A 52 52 0 0 1 126 76" fill="none" stroke="currentColor" className="text-slate-200 dark:text-white/10" strokeWidth="11" strokeLinecap="round" />
          {/* value */}
          <path
            d="M 14 76 A 52 52 0 0 1 126 76"
            fill="none"
            stroke={meta.color}
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            style={{ transition: 'stroke-dasharray 0.7s ease' }}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="font-display text-2xl font-extrabold text-slate-800 dark:text-white">{score}</span>
          <span className="text-[10px] font-medium text-slate-400">/ 100</span>
        </div>
      </div>
      <span className="mt-1 text-xs font-semibold" style={{ color: meta.color }}>
        {meta.label}
      </span>
    </div>
  );
}
