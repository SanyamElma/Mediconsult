// In-memory mock database backed by localStorage so mutations survive reloads.
// Acts as the single source of truth for the mock API layer.

import { generateMockData } from '../../data/generateMockData';

const DB_KEY = 'mc_mock_db_v1';

function seed() {
  const base = generateMockData();
  // Seed credential accounts so testers can log in immediately.
  const demoUser = {
    id: 1001,
    name: 'Demo Patient',
    email: 'patient@demo.com',
    phone: '+91 9000000001',
    role: 'USER',
    password: 'password',
    profilePicture: base.users[0].profilePicture,
    city: 'Mumbai',
    blocked: false,
    gender: 'Male',
    age: 30,
    createdAt: new Date().toISOString(),
  };
  const demoDoctor = {
    ...base.doctors[0],
    id: 2001,
    name: 'Dr. Demo Doctor',
    email: 'doctor@demo.com',
    password: 'password',
    approvalStatus: 'APPROVED',
  };
  const admin = {
    id: 1,
    name: 'Platform Admin',
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'ADMIN',
    profilePicture: 'https://api.dicebear.com/7.x/initials/svg?seed=Admin',
  };
  return {
    users: [demoUser, ...base.users],
    doctors: [demoDoctor, ...base.doctors],
    admins: [admin],
    appointments: base.appointments,
    reviews: base.reviews,
    auditLogs: base.auditLogs,
    specializations: base.specializations,
    notifications: [],
  };
}

function load() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore corrupt storage */
  }
  const fresh = seed();
  save(fresh);
  return fresh;
}

function save(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    /* storage quota — keep in memory only */
  }
}

let _db = load();

export const db = {
  get: () => _db,
  set: (mutator) => {
    _db = mutator(_db) || _db;
    save(_db);
    return _db;
  },
  reset: () => {
    _db = seed();
    save(_db);
    return _db;
  },
};
