import {
  FiAlertTriangle, FiActivity, FiHeart, FiCheckSquare, FiUserCheck, FiInfo,
} from 'react-icons/fi';
import SymptomSummary from './SymptomSummary';
import HealthScoreGauge from './HealthScoreGauge';
import DoctorRecommendationCard from './DoctorRecommendationCard';
import { RISK_META } from '../../constants/ai';
import { cn } from '../../utils';

function Section({ icon: Icon, title, children }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <Icon size={13} /> {title}
      </p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-1">
      {items?.map((it, i) => (
        <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-200">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
          {it}
        </li>
      ))}
    </ul>
  );
}

/** Renders the full structured AI response (summary, causes, self-care, risk, specialists, doctors, disclaimer). */
export default function SymptomAnalysisResult({ analysis, onNavigate }) {
  if (!analysis) return null;
  const risk = RISK_META[analysis.riskLevel] || RISK_META.LOW;

  return (
    <div className="space-y-4">
      {/* Emergency banner */}
      {analysis.emergency && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          <FiAlertTriangle className="mt-0.5 shrink-0" />
          <p className="text-sm font-semibold">{analysis.emergencyMessage}</p>
        </div>
      )}

      <SymptomSummary summary={analysis.symptomSummary} />

      {/* Risk + Health score */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-white/10">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Risk Assessment</p>
          <span className={cn('badge mt-1.5', risk.class)}>{risk.label}</span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {analysis.categories?.map((c) => (
              <span key={c} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
                {c}
              </span>
            ))}
          </div>
        </div>
        <HealthScoreGauge score={analysis.healthScore} concernLevel={analysis.concernLevel} />
      </div>

      <Section icon={FiActivity} title="Possible Causes">
        <BulletList items={analysis.possibleCauses} />
        <p className="mt-1.5 text-[11px] italic text-slate-400">These are possible causes only — not a diagnosis.</p>
      </Section>

      <Section icon={FiHeart} title="Self-Care Suggestions">
        <BulletList items={analysis.selfCare} />
      </Section>

      <Section icon={FiUserCheck} title="Recommended Specialists">
        <div className="flex flex-wrap gap-1.5">
          {analysis.recommendedSpecialists?.map((s) => (
            <span key={s} className="rounded-lg bg-accent-500/15 px-2.5 py-1 text-xs font-semibold text-accent-700 dark:text-accent-300">
              {s}
            </span>
          ))}
        </div>
      </Section>

      {analysis.recommendedDoctors?.length > 0 && (
        <Section icon={FiCheckSquare} title={`Recommended Doctors (${analysis.recommendedDoctors.length})`}>
          <div className="space-y-2">
            {analysis.recommendedDoctors.map((d) => (
              <DoctorRecommendationCard key={d.id} doctor={d} onNavigate={onNavigate} />
            ))}
          </div>
        </Section>
      )}

      {/* Mandatory disclaimer */}
      <div className="flex items-start gap-2 rounded-xl bg-slate-100 p-2.5 text-[11px] leading-snug text-slate-500 dark:bg-white/5 dark:text-slate-400">
        <FiInfo className="mt-0.5 shrink-0" size={13} />
        <span>{analysis.disclaimer}</span>
      </div>
    </div>
  );
}
