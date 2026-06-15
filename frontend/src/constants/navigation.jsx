import {
  FiGrid,
  FiUsers,
  FiCalendar,
  FiUser,
  FiClock,
  FiDollarSign,
  FiActivity,
  FiShield,
  FiFileText,
  FiBarChart2,
  FiSearch,
} from 'react-icons/fi';
import { ROLES } from './index';

export const NAV = {
  [ROLES.USER]: [
    { to: '/user/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/user/doctors', label: 'Find Doctors', icon: FiSearch },
    { to: '/user/appointments', label: 'My Appointments', icon: FiCalendar },
    { to: '/user/profile', label: 'My Profile', icon: FiUser },
  ],
  [ROLES.DOCTOR]: [
    { to: '/doctor/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/doctor/appointments', label: 'Appointments', icon: FiCalendar },
    { to: '/doctor/availability', label: 'Availability', icon: FiClock },
    { to: '/doctor/patients', label: 'Patients', icon: FiUsers },
    { to: '/doctor/earnings', label: 'Earnings', icon: FiDollarSign },
    { to: '/doctor/profile', label: 'Profile', icon: FiUser },
  ],
  [ROLES.ADMIN]: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/admin/doctors', label: 'Doctors', icon: FiActivity },
    { to: '/admin/users', label: 'Users', icon: FiUsers },
    { to: '/admin/appointments', label: 'Appointments', icon: FiCalendar },
    { to: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
    { to: '/admin/audit', label: 'Audit Logs', icon: FiFileText },
  ],
};

export const ROLE_LABEL = {
  [ROLES.USER]: { label: 'Patient', icon: FiUser },
  [ROLES.DOCTOR]: { label: 'Doctor', icon: FiActivity },
  [ROLES.ADMIN]: { label: 'Administrator', icon: FiShield },
};
