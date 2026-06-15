import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/layouts/DashboardLayout';
import Spinner from './components/ui/Spinner';
import { ROLES } from './constants';

// Eager (small/critical) pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import UserRegister from './pages/auth/UserRegister';
import DoctorRegister from './pages/auth/DoctorRegister';
import NotFound from './pages/NotFound';

// Lazy-loaded portal pages (code-splitting per route)
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const DoctorListing = lazy(() => import('./pages/user/DoctorListing'));
const DoctorDetails = lazy(() => import('./pages/user/DoctorDetails'));
const MyAppointments = lazy(() => import('./pages/user/MyAppointments'));
const UserProfile = lazy(() => import('./pages/user/UserProfile'));

const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));
const DoctorAppointments = lazy(() => import('./pages/doctor/DoctorAppointments'));
const DoctorAvailability = lazy(() => import('./pages/doctor/DoctorAvailability'));
const DoctorPatients = lazy(() => import('./pages/doctor/DoctorPatients'));
const DoctorEarnings = lazy(() => import('./pages/doctor/DoctorEarnings'));
const DoctorProfile = lazy(() => import('./pages/doctor/DoctorProfile'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminDoctors = lazy(() => import('./pages/admin/AdminDoctors'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAppointments = lazy(() => import('./pages/admin/AdminAppointments'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminAudit = lazy(() => import('./pages/admin/AdminAudit'));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-brand-500">
      <Spinner size={32} />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="/register/doctor" element={<DoctorRegister />} />

        {/* User portal */}
        <Route element={<ProtectedRoute allow={[ROLES.USER]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/doctors" element={<DoctorListing />} />
            <Route path="/user/doctors/:id" element={<DoctorDetails />} />
            <Route path="/user/appointments" element={<MyAppointments />} />
            <Route path="/user/profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Doctor portal */}
        <Route element={<ProtectedRoute allow={[ROLES.DOCTOR]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/appointments" element={<DoctorAppointments />} />
            <Route path="/doctor/availability" element={<DoctorAvailability />} />
            <Route path="/doctor/patients" element={<DoctorPatients />} />
            <Route path="/doctor/earnings" element={<DoctorEarnings />} />
            <Route path="/doctor/profile" element={<DoctorProfile />} />
          </Route>
        </Route>

        {/* Admin portal */}
        <Route element={<ProtectedRoute allow={[ROLES.ADMIN]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/doctors" element={<AdminDoctors />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/appointments" element={<AdminAppointments />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/audit" element={<AdminAudit />} />
          </Route>
        </Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}
