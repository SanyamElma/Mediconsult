import { FiStar } from 'react-icons/fi';
import { cn, ratingStars } from '../../utils';

export default function StarRating({ rating = 0, count, size = 14, className }) {
  const stars = ratingStars(rating);
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {stars.map((type, i) => (
          <span key={i} className="relative" style={{ width: size, height: size }}>
            <FiStar size={size} className="absolute text-amber-400" />
            {type !== 'empty' && (
              <span
                className="absolute overflow-hidden"
                style={{ width: type === 'half' ? size / 2 : size, height: size }}
              >
                <FiStar size={size} className="fill-amber-400 text-amber-400" />
              </span>
            )}
          </span>
        ))}
      </div>
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{Number(rating).toFixed(1)}</span>
      {count != null && <span className="text-xs text-slate-400">({count})</span>}
    </div>
  );
}
