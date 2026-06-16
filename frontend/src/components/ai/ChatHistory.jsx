import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiTrash2, FiClock, FiChevronRight } from 'react-icons/fi';
import { aiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { TableSkeleton } from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import { RISK_META } from '../../constants/ai';
import { formatDateTime, cn } from '../../utils';

/** Lists the user's past AI conversations; allows viewing one or clearing all. */
export default function ChatHistory({ onSelect }) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ['ai-history', user?.id],
    queryFn: () => aiService.history(user.id),
  });

  const clearMut = useMutation({
    mutationFn: () => aiService.clearHistory(user.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ai-history'] });
      toast.success('History cleared');
    },
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Conversation History</p>
        {data.length > 0 && (
          <button
            onClick={() => clearMut.mutate()}
            className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:underline"
          >
            <FiTrash2 size={13} /> Clear all
          </button>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : data.length === 0 ? (
          <EmptyState icon={FiClock} title="No history yet" message="Your past symptom checks will appear here." />
        ) : (
          data.map((entry) => {
            const risk = RISK_META[entry.response?.riskLevel] || RISK_META.LOW;
            return (
              <button
                key={entry.id}
                onClick={() => onSelect?.(entry)}
                className="flex w-full items-center gap-2 rounded-xl border border-slate-200 p-3 text-left transition hover:border-brand-300 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{entry.message}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={cn('badge !px-1.5 !py-0 text-[10px]', risk.class)}>{risk.label}</span>
                    <span className="text-[11px] text-slate-400">{formatDateTime(entry.createdAt)}</span>
                  </div>
                </div>
                <FiChevronRight className="shrink-0 text-slate-400" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
