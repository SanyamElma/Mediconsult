// Browser-side mirror of the backend SymptomTriageEngine + DoctorRanker.
// Used only in mock mode (VITE_USE_MOCK=true). The live app uses the Spring Boot /api/ai endpoints.
// Informational only — never diagnostic.

import { AI_DISCLAIMER, AI_EMERGENCY_MESSAGE } from '../constants/ai';

const CATEGORIES = [
  {
    name: 'Orthopedic',
    specialists: ['Orthopedic', 'Physiotherapist'],
    keywords: ['knee', 'joint', 'bone', 'back pain', 'backache', 'shoulder', 'fracture', 'sprain', 'arthritis', 'muscle pain', 'neck pain', 'hip', 'ankle', 'wrist', 'posture', 'ligament', 'knee pain'],
    causes: ['Muscle strain', 'Joint inflammation', 'Calcium or Vitamin D deficiency', 'Sports or overuse injury', 'Posture-related stress', 'Age-related wear'],
    selfCare: ['Rest the affected area', 'Apply a cold/warm compress', 'Gentle stretching', 'Avoid excessive strain', 'Maintain good posture'],
    followUps: ['How long has it been hurting?', 'Did you have a recent injury or fall?', 'Do you play sports or do heavy lifting?', 'Rate the pain from 1 to 10.'],
  },
  {
    name: 'Dermatology',
    specialists: ['Dermatologist', 'Skin Specialist'],
    keywords: ['skin', 'rash', 'acne', 'pimple', 'itch', 'itchy', 'allergy', 'eczema', 'psoriasis', 'mole', 'redness', 'irritation', 'skin problem', 'hives'],
    causes: ['Allergic reaction', 'Skin irritation or contact dermatitis', 'Bacterial or fungal involvement', 'Dryness or eczema', 'Hormonal changes'],
    selfCare: ['Keep the area clean and dry', 'Avoid scratching', 'Use a gentle, fragrance-free moisturizer', 'Stay hydrated', 'Avoid known irritants/allergens'],
    followUps: ['How long have you had this?', 'Is it spreading or itchy?', 'Any new product, food or medication recently?', 'Any swelling or fever with it?'],
  },
  {
    name: 'Hair Care',
    specialists: ['Hair Specialist', 'Dermatologist'],
    keywords: ['hair fall', 'hairfall', 'hair loss', 'dandruff', 'baldness', 'bald', 'scalp', 'thinning hair'],
    causes: ['Nutritional deficiency (iron, biotin)', 'Stress', 'Hormonal imbalance', 'Scalp condition (dandruff/seborrhea)', 'Genetic pattern hair loss'],
    selfCare: ['Eat a protein and iron rich diet', 'Avoid harsh chemical treatments', 'Manage stress and sleep well', 'Use a mild shampoo', 'Avoid excessive heat styling'],
    followUps: ['How long has the hair fall been happening?', 'Any dandruff or scalp itching?', 'Any recent stress, illness or diet change?', 'Is it patchy or all over?'],
  },
  {
    name: 'Cardiology',
    specialists: ['Cardiologist'],
    keywords: ['chest pain', 'heart', 'palpitation', 'palpitations', 'hypertension', 'blood pressure', 'cholesterol', 'chest tightness'],
    causes: ['Stress or anxiety', 'Acid reflux', 'Blood pressure variation', 'Muscular chest strain', 'Cardiac-related causes (needs evaluation)'],
    selfCare: ['Avoid exertion until evaluated', 'Reduce salt and caffeine', 'Track your blood pressure', 'Practice calm breathing', 'Do not ignore worsening symptoms'],
    followUps: ['Is the chest pain sudden or severe?', 'Any breathlessness or sweating?', 'Does it spread to the arm, jaw or back?', 'Any history of heart issues?'],
  },
  {
    name: 'Neurology',
    specialists: ['Neurologist'],
    keywords: ['headache', 'migraine', 'dizziness', 'dizzy', 'numbness', 'seizure', 'tremor', 'memory loss', 'paralysis', 'tingling'],
    causes: ['Tension or migraine headache', 'Dehydration', 'Eye strain', 'Stress or lack of sleep', 'Neurological causes (needs evaluation)'],
    selfCare: ['Rest in a quiet, dark room', 'Stay hydrated', 'Maintain regular sleep', 'Limit screen time', 'Track triggers'],
    followUps: ['How long and how severe is it?', 'Any vision changes, weakness or numbness?', 'Is it the worst headache of your life?', 'Any nausea or sensitivity to light?'],
  },
  {
    name: 'Psychiatry',
    specialists: ['Psychiatrist', 'Mental Health Expert'],
    keywords: ['anxiety', 'depression', 'stress', 'insomnia', 'panic', 'mood', 'mental', 'worry', 'sleepless', 'low mood', 'sad'],
    causes: ['Stress or burnout', 'Anxiety', 'Sleep disturbance', 'Mood changes', 'Life or work pressure'],
    selfCare: ['Maintain a regular sleep schedule', 'Practice breathing or mindfulness', 'Stay connected with people you trust', 'Limit caffeine and alcohol', 'Gentle daily exercise'],
    followUps: ['How long have you been feeling this way?', 'How is your sleep and appetite?', 'Is it affecting your daily life?', 'Do you have support around you?'],
  },
  {
    name: 'Gastroenterology',
    specialists: ['Gastroenterologist'],
    keywords: ['stomach', 'digestion', 'digestive', 'acidity', 'constipation', 'diarrhea', 'nausea', 'vomit', 'gas', 'bloating', 'indigestion', 'abdominal', 'stomach pain'],
    causes: ['Indigestion or acidity', 'Food intolerance', 'Mild infection', 'Irregular eating habits', 'Dehydration'],
    selfCare: ['Eat light, home-cooked meals', 'Stay hydrated', 'Avoid spicy/oily food', 'Eat smaller, frequent meals', 'Avoid lying down right after eating'],
    followUps: ['How long has this lasted?', 'Any fever, blood or severe pain?', 'Any recent change in food or water?', 'How is your appetite?'],
  },
  {
    name: 'ENT',
    specialists: ['ENT Specialist'],
    keywords: ['ear', 'throat', 'nose', 'sinus', 'hearing', 'tinnitus', 'tonsil', 'sore throat', 'ear pain'],
    causes: ['Infection (ear/throat/sinus)', 'Allergy', 'Congestion', 'Wax build-up', 'Viral cold'],
    selfCare: ['Stay hydrated and rest', 'Warm salt-water gargle for throat', 'Steam inhalation for congestion', 'Avoid cold drinks', 'Avoid inserting objects in the ear'],
    followUps: ['How long have you had it?', 'Any fever or discharge?', 'Any hearing change or pain?', 'Any recent cold or allergy?'],
  },
  {
    name: 'Gynecology',
    specialists: ['Gynecologist'],
    keywords: ['period', 'menstrual', 'pregnancy', 'pregnant', 'vaginal', 'pcos', 'menopause', 'uterus'],
    causes: ['Hormonal changes', 'Menstrual irregularity', 'PCOS-related causes', 'Pregnancy-related changes', 'Stress'],
    selfCare: ['Track your cycle', 'Maintain a balanced diet', 'Stay hydrated', 'Manage stress', 'Note any unusual bleeding or pain'],
    followUps: ['When was your last period?', 'Is the cycle regular?', 'Any pain, unusual bleeding or discharge?', 'Could you be pregnant?'],
  },
  {
    name: 'Ophthalmology',
    specialists: ['Ophthalmologist'],
    keywords: ['eye', 'vision', 'blurry', 'blurred', 'sight', 'watery eyes', 'eye pain', 'red eye'],
    causes: ['Eye strain', 'Dryness or allergy', 'Infection (conjunctivitis)', 'Refractive error', 'Screen overuse'],
    selfCare: ['Rest your eyes (20-20-20 rule)', 'Avoid rubbing', 'Use lubricating drops if dry', 'Reduce screen brightness', 'Maintain good lighting'],
    followUps: ['How long has this been going on?', 'Any pain, redness or discharge?', 'Is your vision blurred?', 'Do you use screens for long hours?'],
  },
  {
    name: 'Pediatrics',
    specialists: ['Pediatrician'],
    keywords: ['child', 'baby', 'infant', 'kid', 'toddler', 'my son', 'my daughter'],
    causes: ['Common childhood infection', 'Teething or growth-related discomfort', 'Mild viral illness', 'Dietary cause'],
    selfCare: ['Keep the child hydrated', 'Ensure rest', 'Monitor temperature', 'Light, easy-to-digest food', 'Watch for worsening signs'],
    followUps: ['How old is the child?', 'Any fever and how high?', 'Is the child eating and active?', 'How long have the symptoms lasted?'],
  },
  {
    name: 'Endocrinology',
    specialists: ['Endocrinologist', 'Diabetologist'],
    keywords: ['diabetes', 'sugar', 'thyroid', 'hormone', 'weight gain', 'weight loss'],
    causes: ['Blood sugar variation', 'Thyroid imbalance', 'Hormonal changes', 'Lifestyle and diet factors', 'Metabolic causes'],
    selfCare: ['Maintain a balanced, low-sugar diet', 'Exercise regularly', 'Stay hydrated', 'Monitor relevant levels', 'Maintain regular sleep'],
    followUps: ['How long have you noticed this?', 'Any family history?', 'Any change in appetite, thirst or weight?', 'Are your levels being monitored?'],
  },
  {
    name: 'Pulmonology',
    specialists: ['Pulmonologist'],
    keywords: ['breathing', 'asthma', 'cough', 'wheezing', 'lungs', 'breathless'],
    causes: ['Respiratory infection', 'Allergy or asthma', 'Cold or flu', 'Air-quality irritation', 'Needs evaluation if persistent'],
    selfCare: ['Rest and stay hydrated', 'Avoid smoke and dust', 'Use steam for congestion', 'Warm fluids', 'Seek care if breathing worsens'],
    followUps: ['How long have you had it?', 'Any breathlessness or chest tightness?', 'Any fever?', 'Do you have asthma or allergies?'],
  },
  {
    name: 'Urology',
    specialists: ['Urologist'],
    keywords: ['urine', 'urinary', 'kidney', 'bladder', 'urination', 'burning urination'],
    causes: ['Urinary tract irritation/infection', 'Dehydration', 'Kidney-related causes', 'Stone-related causes', 'Needs evaluation'],
    selfCare: ['Drink plenty of water', 'Avoid holding urine', 'Maintain hygiene', 'Limit caffeine', 'Note any pain or blood'],
    followUps: ['How long has this lasted?', 'Any burning, pain or blood?', 'How is your fluid intake?', 'Any fever or back pain?'],
  },
  {
    name: 'Dental',
    specialists: ['Dentist'],
    keywords: ['tooth', 'teeth', 'toothache', 'gum', 'cavity', 'dental'],
    causes: ['Cavity or decay', 'Gum inflammation', 'Sensitivity', 'Infection', 'Wisdom-tooth related'],
    selfCare: ['Rinse with warm salt water', 'Avoid very hot/cold/sweet food', 'Maintain oral hygiene', 'Use a soft toothbrush', 'Avoid chewing on the affected side'],
    followUps: ['How long has the pain lasted?', 'Is it sensitive to hot/cold/sweet?', 'Any swelling or fever?', 'Which tooth area is affected?'],
  },
  {
    name: 'Nutrition',
    specialists: ['Nutritionist'],
    keywords: ['diet', 'nutrition', 'obesity', 'overweight', 'weight'],
    causes: ['Dietary imbalance', 'Lifestyle factors', 'Low activity level', 'Metabolic factors', 'Irregular eating'],
    selfCare: ['Eat a balanced, portion-controlled diet', 'Stay active daily', 'Stay hydrated', 'Limit processed sugar', 'Maintain regular meal times'],
    followUps: ['What are your current eating habits?', 'How active are you daily?', 'Any specific goal (loss/gain)?', 'Any medical conditions?'],
  },
  {
    name: 'General Medicine',
    specialists: ['General Physician'],
    keywords: ['fever', 'cold', 'flu', 'body pain', 'weakness', 'fatigue', 'tired', 'infection', 'cough', 'headache'],
    causes: ['Viral infection', 'Common cold or flu', 'Fatigue or exhaustion', 'Mild infection', 'Seasonal illness'],
    selfCare: ['Rest well', 'Stay hydrated', 'Eat light, nutritious food', 'Monitor your temperature', 'Seek care if it worsens'],
    followUps: ['How long have you had this?', 'Any high fever?', 'Any other symptoms?', 'Are you able to eat and drink?'],
  },
];

const EMERGENCY_FLAGS = [
  'chest pain', 'chest tightness', 'difficulty breathing', 'breathing difficulty', 'shortness of breath',
  "can't breathe", 'cannot breathe', 'unconscious', 'loss of consciousness', 'fainting', 'fainted',
  'severe bleeding', 'heavy bleeding', 'suicidal', 'want to die', 'kill myself', 'slurred speech',
  'face drooping', 'sudden numbness', 'seizure', 'stroke', 'anaphylaxis',
];
const HIGH_SEVERITY = ['severe', 'unbearable', 'intense', 'worsening', 'getting worse', 'very high', 'high fever', 'blood', "can't move", 'cannot move', 'extreme'];

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const dedupLimit = (arr, n) => [...new Set(arr)].slice(0, n);

// Word-anchored match: "ear" matches "ear"/"ears"/"earache" but NOT the "ear" in
// "years"/"hear"/"near" (start-of-word boundary). Mirrors the backend engine.
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const wordMatch = (text, kw) => new RegExp('\\b' + escapeRe(kw), 'i').test(text);

function parseDuration(t) {
  const m = t.match(/(\d+)\s*(hour|hours|day|days|week|weeks|month|months|year|years)/i);
  return m ? `${m[1]} ${m[2]}` : null;
}
function durationDays(t) {
  const m = t.match(/(\d+)\s*(hour|hours|day|days|week|weeks|month|months|year|years)/i);
  if (!m) return 0;
  const n = +m[1];
  const u = m[2][0].toLowerCase();
  return u === 'h' ? 0 : u === 'd' ? n : u === 'w' ? n * 7 : u === 'm' ? n * 30 : n * 365;
}
function parseAge(t) {
  const m = t.match(/(\d{1,3})\s*(?:years?|yrs?)\s*old|age\s*(?:is|:)?\s*(\d{1,3})|i\s*am\s*(\d{1,3})/i);
  if (!m) return null;
  const age = +(m[1] || m[2] || m[3]);
  return age > 0 && age < 120 ? age : null;
}

/** Mirror of SymptomTriageEngine.analyze. */
export function analyzeSymptoms(rawText, declaredAge) {
  const text = (rawText || '').toLowerCase();
  const reported = new Set();
  let matched = [];
  for (const cat of CATEGORIES) {
    let hit = false;
    for (const kw of cat.keywords) {
      if (wordMatch(text, kw)) {
        reported.add(kw);
        hit = true;
      }
    }
    if (hit) matched.push(cat);
  }
  if (matched.length > 1) matched = matched.filter((c) => c.name !== 'General Medicine');
  if (matched.length === 0) matched = [CATEGORIES.find((c) => c.name === 'General Medicine')];

  const redFlag = EMERGENCY_FLAGS.find((f) => wordMatch(text, f));
  const emergency = !!redFlag;
  const duration = parseDuration(text);
  const age = declaredAge ?? parseAge(text);
  const persistent = durationDays(text) >= 14;
  const severityHits = HIGH_SEVERITY.filter((s) => wordMatch(text, s)).length;

  let risk, score;
  if (emergency) {
    risk = 'EMERGENCY';
    score = 95;
  } else if (severityHits >= 1) {
    risk = 'HIGH';
    score = clamp(74 + Math.min(severityHits, 3) * 5 + (persistent ? 4 : 0), 71, 90);
  } else if (persistent || matched.length >= 2) {
    risk = 'MODERATE';
    score = clamp(45 + (matched.length - 1) * 6 + (persistent ? 8 : 0), 31, 70);
  } else {
    risk = 'LOW';
    score = clamp(18 + reported.size * 3, 5, 30);
  }
  const concernLevel = score <= 30 ? 'LOW' : score <= 70 ? 'MEDIUM' : 'HIGH';

  const reportedSymptoms = [...reported];
  let narrative = `You reported: ${reportedSymptoms.length ? reportedSymptoms.join(', ') : 'general health concern'}`;
  if (duration) narrative += ` · Duration: ${duration}`;
  if (age) narrative += ` · Age: ${age}`;

  return {
    symptomSummary: { reportedSymptoms, duration, age, narrative },
    possibleCauses: dedupLimit(matched.flatMap((c) => c.causes), 6),
    selfCare: dedupLimit(matched.flatMap((c) => c.selfCare), 6),
    riskLevel: risk,
    emergency,
    emergencyMessage: emergency
      ? `${AI_EMERGENCY_MESSAGE} Your description includes symptoms that may need urgent care. Please seek immediate medical attention or call your local emergency number.`
      : null,
    healthScore: score,
    concernLevel,
    categories: matched.map((c) => c.name),
    recommendedSpecialists: dedupLimit(matched.flatMap((c) => c.specialists), 5),
    followUpQuestions: matched[0].followUps,
    disclaimer: AI_DISCLAIMER,
  };
}

/** Mirror of DoctorRanker.rank — returns top 5 ranked recommendations. */
export function rankDoctors(doctors, recommendedSpecialists) {
  const wanted = new Set(recommendedSpecialists.map((s) => s.toLowerCase()));
  return doctors
    .map((d) => {
      const exact = d.specializations?.some((s) => wanted.has(s.toLowerCase()));
      const generalist = d.specializations?.some((s) => s.toLowerCase() === 'general physician');
      const specialty = exact ? 1 : generalist ? 0.4 : 0;
      if (specialty <= 0) return null;
      const experience = Math.min((d.experience || 0) / 25, 1);
      const rating = (d.rating || 0) / 5;
      const availability = d.availability?.length > 0 ? 1 : 0;
      const cost = 1 - Math.min((d.consultationCharges || 0) / 3000, 1);
      const total = 0.4 * specialty + 0.25 * experience + 0.2 * rating + 0.1 * availability + 0.05 * cost;
      return {
        id: d.id,
        name: d.name,
        profilePicture: d.profilePicture,
        specializations: d.specializations,
        rating: d.rating,
        experience: d.experience,
        consultationCharges: d.consultationCharges,
        available: availability > 0,
        matchScore: Math.round(total * 100),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
}
