import { FiClipboard } from 'react-icons/fi';

/** Renders the "Symptom Summary" block (what the user reported). */
export default function SymptomSummary({ summary }) {
  if (!summary) return null;
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <FiClipboard size={13} /> Symptom Summary
      </p>
      <p className="mt-1.5 text-sm text-slate-700 dark:text-slate-200">{summary.narrative}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {summary.reportedSymptoms?.map((s) => (
          <span key={s} className="rounded-md bg-brand-500/10 px-2 py-0.5 text-xs font-medium capitalize text-brand-700 dark:text-brand-300">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
