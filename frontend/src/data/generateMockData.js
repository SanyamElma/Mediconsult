// Deterministic mock dataset generator.
// Produces 50 doctors, 200 users, 500 appointments, availability, reviews and audit logs.
// Deterministic seeding keeps the dataset stable across reloads so pagination/sorting is testable.

import {
  SPECIALIZATIONS,
  WEEK_DAYS,
  TIME_SLOTS,
  APPOINTMENT_STATUS,
  DOCTOR_APPROVAL,
  AUDIT_ACTIONS,
} from '../constants';
import { seededRandom, range, pick } from '../utils';

const rnd = seededRandom('mediconsult-seed-v1');

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Krishna', 'Ishaan', 'Rohan',
  'Ananya', 'Diya', 'Aadhya', 'Saanvi', 'Pari', 'Anika', 'Navya', 'Myra', 'Sara', 'Riya',
  'Kabir', 'Aryan', 'Dhruv', 'Kiaan', 'Rudra', 'Meera', 'Ira', 'Kavya', 'Tara', 'Nisha',
  'Rahul', 'Priya', 'Neha', 'Vikram', 'Sneha', 'Karan', 'Pooja', 'Manish', 'Deepa', 'Suresh',
];
const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Gupta', 'Reddy', 'Nair', 'Iyer', 'Khan', 'Singh', 'Mehta',
  'Joshi', 'Kapoor', 'Das', 'Bose', 'Rao', 'Menon', 'Pillai', 'Chopra', 'Malhotra', 'Bhat',
];

const QUALIFICATIONS = [
  'MBBS, MD', 'MBBS, MS', 'MBBS, DNB', 'MBBS, MD, DM', 'MBBS, MS, MCh',
  'BDS, MDS', 'BHMS', 'MBBS, Diploma', 'MBBS, MD (Gold Medalist)', 'MBBS, FRCS',
];

const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];

const ABOUT_TEMPLATES = [
  'is a dedicated specialist with a patient-first approach, focusing on evidence-based care and clear communication.',
  'brings deep clinical expertise and a compassionate bedside manner to every consultation.',
  'is known for accurate diagnosis, personalized treatment plans and excellent patient outcomes.',
  'combines modern medical techniques with holistic care to deliver the best results for patients.',
  'has helped thousands of patients with consistent, high-quality and empathetic medical care.',
];

const REVIEW_SNIPPETS = [
  'Very thorough and patient. Explained everything clearly.',
  'Excellent doctor, highly recommended!',
  'Quick diagnosis and effective treatment. Felt much better.',
  'Polite, professional and knowledgeable.',
  'Great experience, the consultation was smooth.',
  'Took time to understand my problem. Very satisfied.',
  'Good doctor but the wait was a bit long.',
  'Caring and attentive. Will visit again.',
];

function fullName() {
  return `${pick(FIRST_NAMES, rnd)} ${pick(LAST_NAMES, rnd)}`;
}

function phone() {
  return `+91 ${Math.floor(70000 + rnd() * 29999)}${Math.floor(10000 + rnd() * 89999)}`;
}

function avatar(seed, type = 'doctor') {
  // DiceBear deterministic avatars (no API key, renders as SVG via img).
  const style = type === 'doctor' ? 'avataaars' : 'initials';
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

function isoDaysFromNow(days, hour = 9) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

/* ----------------------------- Specializations ---------------------------- */
const specializations = SPECIALIZATIONS.map((name, i) => ({ id: i + 1, name }));

/* --------------------------------- Doctors -------------------------------- */
const doctors = range(50).map((i) => {
  const id = i + 1;
  const name = fullName();
  const primary = pick(SPECIALIZATIONS, rnd);
  const extra = rnd() > 0.6 ? [pick(SPECIALIZATIONS, rnd)] : [];
  const specs = Array.from(new Set([primary, ...extra]));
  const experience = Math.floor(1 + rnd() * 25);
  const charges = pick([200, 300, 400, 500, 600, 800, 1000, 1200, 1500, 2000, 2500], rnd);
  const rating = Math.round((3 + rnd() * 2) * 10) / 10;
  const reviewCount = Math.floor(10 + rnd() * 480);

  // Availability: 3-6 days a week with 1-2 windows each.
  const availDays = WEEK_DAYS.filter(() => rnd() > 0.35).slice(0, 6);
  const availability = availDays.map((day, di) => ({
    id: id * 100 + di,
    day,
    startTime: pick(['09:00 AM', '10:00 AM', '03:00 PM', '04:00 PM'], rnd),
    endTime: pick(['01:00 PM', '02:00 PM', '07:00 PM', '08:00 PM'], rnd),
  }));

  const approvalRoll = rnd();
  const approvalStatus =
    approvalRoll > 0.85 ? DOCTOR_APPROVAL.PENDING : approvalRoll > 0.95 ? DOCTOR_APPROVAL.SUSPENDED : DOCTOR_APPROVAL.APPROVED;

  return {
    id,
    name: `Dr. ${name}`,
    email: `dr.${name.toLowerCase().replace(/\s+/g, '.')}.${id}@mediconsult.io`,
    phone: phone(),
    role: 'DOCTOR',
    profilePicture: avatar(name + id, 'doctor'),
    qualification: pick(QUALIFICATIONS, rnd),
    experience,
    specializations: specs,
    consultationCharges: charges,
    about: `Dr. ${name} ${pick(ABOUT_TEMPLATES, rnd)}`,
    city: pick(CITIES, rnd),
    rating,
    reviewCount,
    approvalStatus,
    bookings: Math.floor(rnd() * 2000),
    availability,
    languages: ['English', 'Hindi', pick(['Marathi', 'Tamil', 'Telugu', 'Bengali', 'Kannada'], rnd)],
    createdAt: isoDaysFromNow(-Math.floor(rnd() * 365)),
  };
});

/* ---------------------------------- Users --------------------------------- */
const users = range(200).map((i) => {
  const id = i + 1;
  const name = fullName();
  return {
    id,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}.${id}@gmail.com`,
    phone: phone(),
    role: 'USER',
    profilePicture: avatar(name + 'u' + id, 'user'),
    city: pick(CITIES, rnd),
    blocked: rnd() > 0.93,
    gender: pick(['Male', 'Female', 'Other'], rnd),
    age: Math.floor(18 + rnd() * 60),
    createdAt: isoDaysFromNow(-Math.floor(rnd() * 365)),
  };
});

/* ------------------------------ Appointments ------------------------------ */
const statuses = [
  APPOINTMENT_STATUS.PENDING,
  APPOINTMENT_STATUS.ACCEPTED,
  APPOINTMENT_STATUS.COMPLETED,
  APPOINTMENT_STATUS.COMPLETED,
  APPOINTMENT_STATUS.CANCELLED,
  APPOINTMENT_STATUS.REJECTED,
];

const appointments = range(500).map((i) => {
  const id = i + 1;
  const doctor = pick(doctors, rnd);
  const user = pick(users, rnd);
  const status = pick(statuses, rnd);
  // Past for completed/cancelled/rejected, future for pending/accepted.
  const isFuture = status === APPOINTMENT_STATUS.PENDING || status === APPOINTMENT_STATUS.ACCEPTED;
  const dayOffset = isFuture ? Math.floor(rnd() * 14) : -Math.floor(1 + rnd() * 120);
  const date = isoDaysFromNow(dayOffset).slice(0, 10);

  return {
    id,
    userId: user.id,
    userName: user.name,
    userPhone: user.phone,
    userAvatar: user.profilePicture,
    doctorId: doctor.id,
    doctorName: doctor.name,
    doctorAvatar: doctor.profilePicture,
    specialization: doctor.specializations[0],
    date,
    slot: pick(TIME_SLOTS, rnd),
    status,
    charges: doctor.consultationCharges,
    reason: pick(['Fever & cold', 'Routine checkup', 'Skin allergy', 'Back pain', 'Follow-up', 'Consultation', 'Anxiety', 'Diabetes review'], rnd),
    createdAt: isoDaysFromNow(dayOffset - 2),
  };
});

/* -------------------------------- Reviews --------------------------------- */
const reviews = [];
let reviewId = 1;
doctors.forEach((doc) => {
  const count = Math.floor(2 + rnd() * 6);
  range(count).forEach(() => {
    const user = pick(users, rnd);
    reviews.push({
      id: reviewId++,
      doctorId: doc.id,
      userName: user.name,
      userAvatar: user.profilePicture,
      rating: Math.floor(3 + rnd() * 3),
      comment: pick(REVIEW_SNIPPETS, rnd),
      date: isoDaysFromNow(-Math.floor(rnd() * 200)),
    });
  });
});

/* ------------------------------- Audit Logs ------------------------------- */
const auditActions = Object.values(AUDIT_ACTIONS);
const auditLogs = range(60).map((i) => {
  const action = pick(auditActions, rnd);
  return {
    id: i + 1,
    action,
    actor: 'admin@mediconsult.io',
    target: pick([...doctors.map((d) => d.name), ...users.slice(0, 30).map((u) => u.name)], rnd),
    timestamp: isoDaysFromNow(-Math.floor(rnd() * 90), Math.floor(rnd() * 23)),
    detail: action.replace(/_/g, ' ').toLowerCase(),
  };
});

export function generateMockData() {
  return { doctors, users, appointments, reviews, auditLogs, specializations };
}
