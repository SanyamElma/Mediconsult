// Central application constants.

export const ROLES = Object.freeze({
  USER: 'USER',
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN',
});

export const APPOINTMENT_STATUS = Object.freeze({
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
});

export const STATUS_META = {
  PENDING: { label: 'Pending', class: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  ACCEPTED: { label: 'Accepted', class: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
  REJECTED: { label: 'Rejected', class: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' },
  COMPLETED: { label: 'Completed', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  CANCELLED: { label: 'Cancelled', class: 'bg-slate-200 text-slate-600 dark:bg-slate-700/40 dark:text-slate-300' },
};

export const DOCTOR_APPROVAL = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
});

export const APPROVAL_META = {
  PENDING: { label: 'Pending Review', class: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
  APPROVED: { label: 'Approved', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  REJECTED: { label: 'Rejected', class: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' },
  SUSPENDED: { label: 'Suspended', class: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300' },
};

export const SPECIALIZATIONS = [
  'General Physician',
  'MBBS',
  'Dermatologist',
  'Orthopedic',
  'Cardiologist',
  'Neurologist',
  'Psychiatrist',
  'Pediatrician',
  'ENT Specialist',
  'Ophthalmologist',
  'Gynecologist',
  'Urologist',
  'Gastroenterologist',
  'Pulmonologist',
  'Endocrinologist',
  'Hair Specialist',
  'Skin Specialist',
  'Diabetologist',
  'Dentist',
  'Physiotherapist',
  'Nutritionist',
  'Mental Health Expert',
  'Sexologist',
  'Oncology Specialist',
];

export const EXPERIENCE_BUCKETS = [
  { label: '0-5 Years', min: 0, max: 5 },
  { label: '5-10 Years', min: 5, max: 10 },
  { label: '10-15 Years', min: 10, max: 15 },
  { label: '15+ Years', min: 15, max: 100 },
];

export const CHARGE_BUCKETS = [
  { label: '₹100 - ₹500', min: 100, max: 500 },
  { label: '₹500 - ₹1000', min: 500, max: 1000 },
  { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
  { label: '₹2000+', min: 2000, max: 100000 },
];

export const AVAILABILITY_FILTERS = [
  { label: 'Available Today', value: 'TODAY' },
  { label: 'Available Tomorrow', value: 'TOMORROW' },
  { label: 'Available This Week', value: 'WEEK' },
];

export const RATING_FILTERS = [
  { label: '1 Star+', value: 1 },
  { label: '2 Star+', value: 2 },
  { label: '3 Star+', value: 3 },
  { label: '4 Star+', value: 4 },
  { label: '5 Star', value: 5 },
];

export const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
];

export const AUDIT_ACTIONS = Object.freeze({
  DOCTOR_CREATED: 'DOCTOR_CREATED',
  DOCTOR_APPROVED: 'DOCTOR_APPROVED',
  DOCTOR_REJECTED: 'DOCTOR_REJECTED',
  DOCTOR_DELETED: 'DOCTOR_DELETED',
  DOCTOR_SUSPENDED: 'DOCTOR_SUSPENDED',
  USER_DELETED: 'USER_DELETED',
  USER_BLOCKED: 'USER_BLOCKED',
  APPOINTMENT_CANCELLED: 'APPOINTMENT_CANCELLED',
  APPOINTMENT_BOOKED: 'APPOINTMENT_BOOKED',
});

export const PAGE_SIZE = 10;

export const ROLE_HOME = {
  USER: '/user/dashboard',
  DOCTOR: '/doctor/dashboard',
  ADMIN: '/admin/dashboard',
};
