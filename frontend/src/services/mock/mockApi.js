// Mock API: mirrors the shape of the future REST backend so the UI can be built
// without a running server. Each method returns a Promise to mimic async I/O.

import { db } from './mockDb';
import { config } from '../../config';
import { ROLES, APPOINTMENT_STATUS, DOCTOR_APPROVAL, AUDIT_ACTIONS } from '../../constants';
import { addDaysISO, todayISO } from '../../utils';

const delay = (ms = config.MOCK_LATENCY) => new Promise((r) => setTimeout(r, ms));

function makeToken(payload) {
  // A non-cryptographic JWT-shaped token for mock auth only.
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify({ ...payload, iat: Date.now() }));
  return `${header}.${body}.mock-signature`;
}

function sanitize(entity) {
  if (!entity) return entity;
  const { password, ...rest } = entity;
  return rest;
}

function audit(action, target, actor = 'system') {
  db.set((d) => {
    d.auditLogs.unshift({
      id: (d.auditLogs[0]?.id || 0) + 1,
      action,
      actor,
      target,
      timestamp: new Date().toISOString(),
      detail: action.replace(/_/g, ' ').toLowerCase(),
    });
    return d;
  });
}

function notify(targetRole, targetId, type, message) {
  db.set((d) => {
    d.notifications.unshift({
      id: (d.notifications[0]?.id || 0) + 1,
      targetRole,
      targetId,
      type,
      message,
      read: false,
      timestamp: new Date().toISOString(),
    });
    return d;
  });
}

/* -------------------------- paginate/sort helper -------------------------- */
function paginate(rows, { page = 1, size = 10, sortBy, sortDir = 'asc', search, searchKeys } = {}) {
  let data = [...rows];
  if (search && searchKeys?.length) {
    const q = search.toLowerCase();
    data = data.filter((r) => searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(q)));
  }
  if (sortBy) {
    data.sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }
  const total = data.length;
  const start = (page - 1) * size;
  return { content: data.slice(start, start + size), total, page, size, totalPages: Math.ceil(total / size) || 1 };
}

export const mockApi = {
  /* ================================ AUTH ================================= */
  async login({ email, password, role }) {
    await delay();
    const d = db.get();
    let account;
    if (role === ROLES.ADMIN) account = d.admins.find((a) => a.email === email);
    else if (role === ROLES.DOCTOR) account = d.doctors.find((x) => x.email === email);
    else account = d.users.find((x) => x.email === email);

    if (!account || (account.password && account.password !== password)) {
      throw { response: { status: 401, data: { message: 'Invalid email or password' } } };
    }
    if (account.blocked) throw { response: { status: 403, data: { message: 'Your account has been blocked.' } } };
    if (role === ROLES.DOCTOR && account.approvalStatus === DOCTOR_APPROVAL.REJECTED)
      throw { response: { status: 403, data: { message: 'Your doctor application was rejected.' } } };

    const user = sanitize(account);
    return {
      user: { ...user, role },
      accessToken: makeToken({ sub: account.id, role, email }),
      refreshToken: makeToken({ sub: account.id, type: 'refresh' }),
    };
  },

  async registerUser(payload) {
    await delay();
    const d = db.get();
    if (d.users.some((u) => u.email === payload.email) || d.doctors.some((x) => x.email === payload.email))
      throw { response: { status: 409, data: { message: 'Email already registered' } } };
    const id = Math.max(0, ...d.users.map((u) => u.id)) + 1;
    const newUser = {
      id,
      name: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      role: ROLES.USER,
      profilePicture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(payload.fullName)}`,
      blocked: false,
      createdAt: new Date().toISOString(),
    };
    db.set((s) => {
      s.users.push(newUser);
      return s;
    });
    return { user: { ...sanitize(newUser), role: ROLES.USER }, accessToken: makeToken({ sub: id, role: ROLES.USER }), refreshToken: makeToken({ sub: id, type: 'refresh' }) };
  },

  async registerDoctor(payload) {
    await delay();
    const d = db.get();
    if (d.doctors.some((x) => x.email === payload.email) || d.users.some((u) => u.email === payload.email))
      throw { response: { status: 409, data: { message: 'Email already registered' } } };
    const id = Math.max(0, ...d.doctors.map((x) => x.id)) + 1;
    const newDoc = {
      id,
      name: payload.fullName.startsWith('Dr.') ? payload.fullName : `Dr. ${payload.fullName}`,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      role: ROLES.DOCTOR,
      profilePicture: payload.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.fullName)}`,
      qualification: payload.qualification,
      experience: Number(payload.experience) || 0,
      specializations: payload.specializations || [],
      consultationCharges: Number(payload.consultationCharges) || 0,
      about: payload.about || '',
      rating: 0,
      reviewCount: 0,
      bookings: 0,
      // Auto-approved on registration (kept consistent with the backend).
      approvalStatus: DOCTOR_APPROVAL.APPROVED,
      availability: [],
      languages: ['English'],
      createdAt: new Date().toISOString(),
    };
    db.set((s) => {
      s.doctors.push(newDoc);
      return s;
    });
    audit(AUDIT_ACTIONS.DOCTOR_CREATED, newDoc.name, payload.email);
    return { user: { ...sanitize(newDoc), role: ROLES.DOCTOR }, accessToken: makeToken({ sub: id, role: ROLES.DOCTOR }), refreshToken: makeToken({ sub: id, type: 'refresh' }) };
  },

  async refresh() {
    await delay(150);
    return { accessToken: makeToken({ refreshed: true }) };
  },

  /* =============================== DOCTORS =============================== */
  async getDoctors(filters = {}) {
    await delay();
    const d = db.get();
    let list = d.doctors.filter((x) => x.approvalStatus === DOCTOR_APPROVAL.APPROVED);

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (x) => x.name.toLowerCase().includes(q) || x.specializations.some((s) => s.toLowerCase().includes(q)),
      );
    }
    if (filters.specializations?.length)
      list = list.filter((x) => x.specializations.some((s) => filters.specializations.includes(s)));
    if (filters.experience) {
      const { min, max } = filters.experience;
      list = list.filter((x) => x.experience >= min && x.experience < max);
    }
    if (filters.charges) {
      const { min, max } = filters.charges;
      list = list.filter((x) => x.consultationCharges >= min && x.consultationCharges <= max);
    }
    if (filters.minRating) list = list.filter((x) => x.rating >= filters.minRating);
    if (filters.availability) {
      const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const tomorrowDay = new Date(Date.now() + 864e5).toLocaleDateString('en-US', { weekday: 'long' });
      if (filters.availability === 'TODAY') list = list.filter((x) => x.availability.some((a) => a.day === todayDay));
      else if (filters.availability === 'TOMORROW') list = list.filter((x) => x.availability.some((a) => a.day === tomorrowDay));
      // WEEK = any availability (all approved doctors qualify)
    }

    // Sorting
    const sort = filters.sort || 'relevance';
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sort === 'experience') list.sort((a, b) => b.experience - a.experience);
    else if (sort === 'charges_low') list.sort((a, b) => a.consultationCharges - b.consultationCharges);
    else if (sort === 'charges_high') list.sort((a, b) => b.consultationCharges - a.consultationCharges);
    else if (sort === 'popular') list.sort((a, b) => b.bookings - a.bookings);

    const page = filters.page || 1;
    const size = filters.size || 9;
    const total = list.length;
    return { content: list.slice((page - 1) * size, page * size), total, page, size, totalPages: Math.ceil(total / size) || 1 };
  },

  async getDoctorById(id) {
    await delay();
    const d = db.get();
    const doctor = d.doctors.find((x) => x.id === Number(id));
    if (!doctor) throw { response: { status: 404, data: { message: 'Doctor not found' } } };
    const reviews = d.reviews.filter((r) => r.doctorId === doctor.id);
    return { ...sanitize(doctor), reviews };
  },

  async getDashboardStats() {
    await delay();
    const d = db.get();
    const approved = d.doctors.filter((x) => x.approvalStatus === DOCTOR_APPROVAL.APPROVED);
    const categories = new Set();
    approved.forEach((x) => x.specializations.forEach((s) => categories.add(s)));
    return {
      totalDoctors: approved.length,
      totalCategories: categories.size,
      recentDoctors: [...approved].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6).map(sanitize),
      mostBooked: [...approved].sort((a, b) => b.bookings - a.bookings).slice(0, 6).map(sanitize),
      featured: [...approved].sort((a, b) => b.rating - a.rating).slice(0, 6).map(sanitize),
    };
  },

  /* ============================ APPOINTMENTS ============================ */
  async bookAppointment({ userId, doctorId, date, slot, reason }) {
    await delay();
    const d = db.get();
    const doctor = d.doctors.find((x) => x.id === Number(doctorId));
    const user = d.users.find((x) => x.id === Number(userId));
    const id = Math.max(0, ...d.appointments.map((a) => a.id)) + 1;
    const appt = {
      id,
      userId: Number(userId),
      userName: user?.name,
      userPhone: user?.phone,
      userAvatar: user?.profilePicture,
      doctorId: Number(doctorId),
      doctorName: doctor?.name,
      doctorAvatar: doctor?.profilePicture,
      specialization: doctor?.specializations[0],
      date,
      slot,
      status: APPOINTMENT_STATUS.PENDING,
      charges: doctor?.consultationCharges,
      reason: reason || 'Consultation',
      createdAt: new Date().toISOString(),
    };
    db.set((s) => {
      s.appointments.unshift(appt);
      const doc = s.doctors.find((x) => x.id === Number(doctorId));
      if (doc) doc.bookings += 1;
      return s;
    });
    audit(AUDIT_ACTIONS.APPOINTMENT_BOOKED, `${user?.name} → ${doctor?.name}`, user?.email);
    notify(ROLES.DOCTOR, Number(doctorId), 'APPOINTMENT_BOOKED', `New appointment from ${user?.name} on ${date} at ${slot}`);
    notify(ROLES.USER, Number(userId), 'APPOINTMENT_BOOKED', `Appointment booked with ${doctor?.name} on ${date}`);
    return appt;
  },

  async getUserAppointments(userId) {
    await delay();
    const d = db.get();
    return d.appointments.filter((a) => a.userId === Number(userId)).sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async getDoctorAppointments(doctorId) {
    await delay();
    const d = db.get();
    return d.appointments.filter((a) => a.doctorId === Number(doctorId)).sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async updateAppointmentStatus(id, status, actor = 'system') {
    await delay();
    let updated;
    db.set((s) => {
      const a = s.appointments.find((x) => x.id === Number(id));
      if (a) {
        a.status = status;
        updated = a;
        if (status === APPOINTMENT_STATUS.CANCELLED) audit(AUDIT_ACTIONS.APPOINTMENT_CANCELLED, `Appt #${id}`, actor);
      }
      return s;
    });
    if (updated) {
      notify(ROLES.USER, updated.userId, 'STATUS', `Your appointment with ${updated.doctorName} is now ${status.toLowerCase()}`);
    }
    return updated;
  },

  async rescheduleAppointment(id, { date, slot }) {
    await delay();
    let updated;
    db.set((s) => {
      const a = s.appointments.find((x) => x.id === Number(id));
      if (a) {
        a.date = date;
        a.slot = slot;
        a.status = APPOINTMENT_STATUS.PENDING;
        updated = a;
      }
      return s;
    });
    return updated;
  },

  /* ============================ DOCTOR PORTAL ============================ */
  async getDoctorStats(doctorId) {
    await delay();
    const d = db.get();
    const appts = d.appointments.filter((a) => a.doctorId === Number(doctorId));
    const today = todayISO();
    const completed = appts.filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED);
    const monthly = completed
      .filter((a) => new Date(a.date).getMonth() === new Date().getMonth())
      .reduce((sum, a) => sum + (a.charges || 0), 0);
    return {
      totalAppointments: appts.length,
      todayAppointments: appts.filter((a) => a.date === today).length,
      monthlyEarnings: monthly,
      upcomingPatients: appts.filter((a) => a.status === APPOINTMENT_STATUS.ACCEPTED && new Date(a.date) >= new Date(today)).length,
      totalEarnings: completed.reduce((s, a) => s + (a.charges || 0), 0),
    };
  },

  async getDoctorEarnings(doctorId) {
    await delay();
    const d = db.get();
    const completed = d.appointments.filter((a) => a.doctorId === Number(doctorId) && a.status === APPOINTMENT_STATUS.COMPLETED);
    // Last 7 days + last 6 months series
    const daily = [];
    for (let i = 6; i >= 0; i--) {
      const day = addDaysISO(-i);
      const total = completed.filter((a) => a.date === day).reduce((s, a) => s + a.charges, 0);
      daily.push({ label: new Date(day).toLocaleDateString('en-IN', { weekday: 'short' }), value: total });
    }
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const dt = new Date();
      dt.setMonth(dt.getMonth() - i);
      const total = completed
        .filter((a) => new Date(a.date).getMonth() === dt.getMonth() && new Date(a.date).getFullYear() === dt.getFullYear())
        .reduce((s, a) => s + a.charges, 0);
      monthly.push({ label: dt.toLocaleDateString('en-IN', { month: 'short' }), value: total });
    }
    return { daily, monthly };
  },

  async updateDoctorProfile(doctorId, updates) {
    await delay();
    let doc;
    db.set((s) => {
      const target = s.doctors.find((x) => x.id === Number(doctorId));
      if (target) {
        Object.assign(target, updates);
        doc = target;
      }
      return s;
    });
    return sanitize(doc);
  },

  async setDoctorAvailability(doctorId, availability) {
    await delay();
    let doc;
    db.set((s) => {
      const target = s.doctors.find((x) => x.id === Number(doctorId));
      if (target) {
        target.availability = availability;
        doc = target;
      }
      return s;
    });
    return sanitize(doc).availability;
  },

  /* ================================ USER ================================ */
  async updateUserProfile(userId, updates) {
    await delay();
    let user;
    db.set((s) => {
      const target = s.users.find((x) => x.id === Number(userId));
      if (target) {
        Object.assign(target, updates);
        user = target;
      }
      return s;
    });
    return sanitize(user);
  },

  /* ================================ ADMIN ================================ */
  async getAdminStats() {
    await delay();
    const d = db.get();
    const revenue = d.appointments
      .filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED)
      .reduce((s, a) => s + (a.charges || 0), 0);
    return {
      totalUsers: d.users.length,
      totalDoctors: d.doctors.length,
      totalAppointments: d.appointments.length,
      revenue,
      pendingDoctors: d.doctors.filter((x) => x.approvalStatus === DOCTOR_APPROVAL.PENDING).length,
    };
  },

  async getAdminAnalytics() {
    await delay();
    const d = db.get();
    // Registrations over last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const dt = new Date();
      dt.setMonth(dt.getMonth() - i);
      const m = dt.getMonth();
      const y = dt.getFullYear();
      const inMonth = (iso) => new Date(iso).getMonth() === m && new Date(iso).getFullYear() === y;
      months.push({
        label: dt.toLocaleDateString('en-IN', { month: 'short' }),
        users: d.users.filter((u) => inMonth(u.createdAt)).length,
        doctors: d.doctors.filter((x) => inMonth(x.createdAt)).length,
        revenue: d.appointments
          .filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED && inMonth(a.createdAt))
          .reduce((s, a) => s + a.charges, 0),
      });
    }
    const byStatus = ['PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED', 'REJECTED'].map((st) => ({
      name: st,
      value: d.appointments.filter((a) => a.status === st).length,
    }));
    const bySpecialization = {};
    d.doctors.forEach((x) => x.specializations.forEach((s) => (bySpecialization[s] = (bySpecialization[s] || 0) + 1)));
    return {
      months,
      byStatus,
      topSpecializations: Object.entries(bySpecialization)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8),
    };
  },

  async getAdminDoctors(params) {
    await delay();
    return paginate(db.get().doctors.map(sanitize), { ...params, searchKeys: ['name', 'email', 'qualification'] });
  },

  async getAdminUsers(params) {
    await delay();
    return paginate(db.get().users.map(sanitize), { ...params, searchKeys: ['name', 'email', 'phone'] });
  },

  async getAdminAppointments(params) {
    await delay();
    return paginate(db.get().appointments, { ...params, searchKeys: ['userName', 'doctorName', 'status', 'specialization'] });
  },

  async getAuditLogs(params) {
    await delay();
    return paginate(db.get().auditLogs, { ...params, sortBy: 'timestamp', sortDir: 'desc', searchKeys: ['action', 'actor', 'target'] });
  },

  async setDoctorApproval(doctorId, status, actor = 'admin@demo.com') {
    await delay();
    let doc;
    db.set((s) => {
      const target = s.doctors.find((x) => x.id === Number(doctorId));
      if (target) {
        target.approvalStatus = status;
        doc = target;
      }
      return s;
    });
    const actionMap = {
      APPROVED: AUDIT_ACTIONS.DOCTOR_APPROVED,
      REJECTED: AUDIT_ACTIONS.DOCTOR_REJECTED,
      SUSPENDED: AUDIT_ACTIONS.DOCTOR_SUSPENDED,
    };
    if (actionMap[status]) audit(actionMap[status], doc?.name, actor);
    if (status === DOCTOR_APPROVAL.APPROVED) notify(ROLES.DOCTOR, Number(doctorId), 'APPROVED', 'Your profile has been approved! You can now receive appointments.');
    return sanitize(doc);
  },

  async deleteDoctor(doctorId, actor = 'admin@demo.com') {
    await delay();
    let name;
    db.set((s) => {
      name = s.doctors.find((x) => x.id === Number(doctorId))?.name;
      s.doctors = s.doctors.filter((x) => x.id !== Number(doctorId));
      return s;
    });
    audit(AUDIT_ACTIONS.DOCTOR_DELETED, name, actor);
    return { success: true };
  },

  async setUserBlocked(userId, blocked, actor = 'admin@demo.com') {
    await delay();
    let user;
    db.set((s) => {
      const t = s.users.find((x) => x.id === Number(userId));
      if (t) {
        t.blocked = blocked;
        user = t;
      }
      return s;
    });
    if (blocked) audit(AUDIT_ACTIONS.USER_BLOCKED, user?.name, actor);
    return sanitize(user);
  },

  async deleteUser(userId, actor = 'admin@demo.com') {
    await delay();
    let name;
    db.set((s) => {
      name = s.users.find((x) => x.id === Number(userId))?.name;
      s.users = s.users.filter((x) => x.id !== Number(userId));
      return s;
    });
    audit(AUDIT_ACTIONS.USER_DELETED, name, actor);
    return { success: true };
  },

  /* ============================ NOTIFICATIONS ============================ */
  async getNotifications(role, id) {
    await delay(150);
    return db
      .get()
      .notifications.filter((n) => n.targetRole === role && (!id || n.targetId === Number(id)))
      .slice(0, 20);
  },

  async markNotificationsRead(role, id) {
    await delay(100);
    db.set((s) => {
      s.notifications.forEach((n) => {
        if (n.targetRole === role && (!id || n.targetId === Number(id))) n.read = true;
      });
      return s;
    });
    return { success: true };
  },
};
