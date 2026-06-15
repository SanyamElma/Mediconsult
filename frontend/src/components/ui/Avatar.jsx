import { useState } from 'react';
import { cn, initials } from '../../utils';

export default function Avatar({ src, name = '', size = 44, className, ring }) {
  const [error, setError] = useState(false);
  const showImg = src && !error;
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-500 to-accent-500 font-semibold text-white',
        ring && 'ring-2 ring-white shadow-md dark:ring-slate-800',
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {showImg ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          onError={() => setError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials(name) || '?'}</span>
      )}
    </div>
  );
}
