// AI Health Assistant constants (guardrails + display metadata).

export const AI_DISCLAIMER =
  'AI recommendations are informational only and do not replace professional medical advice. Please consult a qualified healthcare professional.';

export const AI_EMERGENCY_MESSAGE = 'Please seek immediate medical attention.';

export const RISK_META = {
  LOW: { label: 'Low Risk', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300', bar: 'from-emerald-400 to-emerald-500' },
  MODERATE: { label: 'Moderate Risk', class: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300', bar: 'from-amber-400 to-orange-500' },
  HIGH: { label: 'High Risk', class: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300', bar: 'from-orange-500 to-rose-500' },
  EMERGENCY: { label: 'Emergency', class: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300', bar: 'from-rose-500 to-red-600' },
};

export const CONCERN_META = {
  LOW: { label: 'Low Concern', color: '#10b981' },
  MEDIUM: { label: 'Medium Concern', color: '#f59e0b' },
  HIGH: { label: 'High Concern', color: '#f43f5e' },
};

export const SYMPTOM_EXAMPLES = [
  'Knee pain', 'Hair fall', 'Skin problems', 'Fever', 'Headache',
  'Back pain', 'Anxiety', 'Weight gain', 'Digestive issues',
];

export const AI_GREETING =
  "Hi! I'm your AI Health Assistant. Describe your symptoms and I'll suggest possible causes, self-care tips and the right specialists on MediConsult. For example: \"My knee has been hurting for 15 days. I am 30 years old.\"";
