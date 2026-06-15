// Unified service layer. Every UI call goes through these functions; internally each
// routes to the mock API or the live backend based on config.USE_MOCK. This keeps the
// rest of the app agnostic to the data source — the integration phase only touches this file.

import { config } from '../../config';
import { mockApi } from '../mock/mockApi';
import { http } from './httpClient';

const mock = config.USE_MOCK;

/* --------------------------------- AUTH ---------------------------------- */
export const authService = {
  login: (creds) => (mock ? mockApi.login(creds) : http.post('/auth/login', creds).then((r) => r.data)),
  registerUser: (data) => (mock ? mockApi.registerUser(data) : http.post('/auth/register/user', data).then((r) => r.data)),
  registerDoctor: (data) => (mock ? mockApi.registerDoctor(data) : http.post('/auth/register/doctor', data).then((r) => r.data)),
  refresh: (token) => (mock ? mockApi.refresh(token) : http.post('/auth/refresh', { refreshToken: token }).then((r) => r.data)),
};

/**
 * Flatten the UI's nested filter object into the flat query params the Spring backend
 * expects (experienceMin/Max, chargesMin/Max). Arrays are serialized as repeated params.
 */
function toDoctorParams(filters = {}) {
  const p = {
    search: filters.search || undefined,
    specializations: filters.specializations?.length ? filters.specializations : undefined,
    experienceMin: filters.experience?.min,
    experienceMax: filters.experience?.max,
    chargesMin: filters.charges?.min,
    chargesMax: filters.charges?.max,
    minRating: filters.minRating,
    availability: filters.availability,
    sort: filters.sort,
    page: filters.page,
    size: filters.size,
  };
  return p;
}

const arrayParamsSerializer = {
  serialize: (params) =>
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .flatMap(([k, v]) => (Array.isArray(v) ? v.map((i) => `${k}=${encodeURIComponent(i)}`) : `${k}=${encodeURIComponent(v)}`))
      .join('&'),
};

/* -------------------------------- DOCTORS -------------------------------- */
export const doctorService = {
  list: (filters) =>
    mock
      ? mockApi.getDoctors(filters)
      : http.get('/doctors', { params: toDoctorParams(filters), paramsSerializer: arrayParamsSerializer }).then((r) => r.data),
  getById: (id) => (mock ? mockApi.getDoctorById(id) : http.get(`/doctors/${id}`).then((r) => r.data)),
  patientDashboard: () => (mock ? mockApi.getDashboardStats() : http.get('/doctors/dashboard').then((r) => r.data)),
  stats: (id) => (mock ? mockApi.getDoctorStats(id) : http.get(`/doctors/${id}/stats`).then((r) => r.data)),
  earnings: (id) => (mock ? mockApi.getDoctorEarnings(id) : http.get(`/doctors/${id}/earnings`).then((r) => r.data)),
  updateProfile: (id, data) => (mock ? mockApi.updateDoctorProfile(id, data) : http.put(`/doctors/${id}`, data).then((r) => r.data)),
  setAvailability: (id, data) => (mock ? mockApi.setDoctorAvailability(id, data) : http.put(`/doctors/${id}/availability`, data).then((r) => r.data)),
};

/* ----------------------------- APPOINTMENTS ------------------------------ */
export const appointmentService = {
  book: (data) => (mock ? mockApi.bookAppointment(data) : http.post('/appointments', data).then((r) => r.data)),
  forUser: (userId) => (mock ? mockApi.getUserAppointments(userId) : http.get(`/appointments/user/${userId}`).then((r) => r.data)),
  forDoctor: (doctorId) => (mock ? mockApi.getDoctorAppointments(doctorId) : http.get(`/appointments/doctor/${doctorId}`).then((r) => r.data)),
  updateStatus: (id, status, actor) => (mock ? mockApi.updateAppointmentStatus(id, status, actor) : http.patch(`/appointments/${id}/status`, { status }).then((r) => r.data)),
  reschedule: (id, data) => (mock ? mockApi.rescheduleAppointment(id, data) : http.patch(`/appointments/${id}/reschedule`, data).then((r) => r.data)),
};

/* ---------------------------------- USER --------------------------------- */
export const userService = {
  updateProfile: (id, data) => (mock ? mockApi.updateUserProfile(id, data) : http.put(`/users/${id}`, data).then((r) => r.data)),
};

/* --------------------------------- ADMIN --------------------------------- */
export const adminService = {
  stats: () => (mock ? mockApi.getAdminStats() : http.get('/admin/stats').then((r) => r.data)),
  analytics: () => (mock ? mockApi.getAdminAnalytics() : http.get('/admin/analytics').then((r) => r.data)),
  doctors: (params) => (mock ? mockApi.getAdminDoctors(params) : http.get('/admin/doctors', { params }).then((r) => r.data)),
  users: (params) => (mock ? mockApi.getAdminUsers(params) : http.get('/admin/users', { params }).then((r) => r.data)),
  appointments: (params) => (mock ? mockApi.getAdminAppointments(params) : http.get('/admin/appointments', { params }).then((r) => r.data)),
  auditLogs: (params) => (mock ? mockApi.getAuditLogs(params) : http.get('/admin/audit-logs', { params }).then((r) => r.data)),
  setDoctorApproval: (id, status) => (mock ? mockApi.setDoctorApproval(id, status) : http.patch(`/admin/doctors/${id}/approval`, { status }).then((r) => r.data)),
  deleteDoctor: (id) => (mock ? mockApi.deleteDoctor(id) : http.delete(`/admin/doctors/${id}`).then((r) => r.data)),
  setUserBlocked: (id, blocked) => (mock ? mockApi.setUserBlocked(id, blocked) : http.patch(`/admin/users/${id}/block`, { blocked }).then((r) => r.data)),
  deleteUser: (id) => (mock ? mockApi.deleteUser(id) : http.delete(`/admin/users/${id}`).then((r) => r.data)),
};

/* ----------------------------- NOTIFICATIONS ----------------------------- */
export const notificationService = {
  list: (role, id) => (mock ? mockApi.getNotifications(role, id) : http.get('/notifications', { params: { role, id } }).then((r) => r.data)),
  markRead: (role, id) => (mock ? mockApi.markNotificationsRead(role, id) : http.patch('/notifications/read', { role, id }).then((r) => r.data)),
};
