import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiBell, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { NAV, ROLE_LABEL } from '../../constants/navigation';
import { cn, formatDateTime } from '../../utils';
import Logo from '../common/Logo';
import Avatar from '../ui/Avatar';
import ThemeToggle from '../ui/ThemeToggle';

export default function DashboardLayout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = NAV[role] || [];
  const roleMeta = ROLE_LABEL[role];

  // Always close the mobile drawer when the route changes (covers nav clicks,
  // back/forward and programmatic navigation alike).
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo to={`/${role?.toLowerCase()}/dashboard`} />
        <button className="lg:hidden" onClick={() => setMobileOpen(false)}>
          <FiX size={22} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-glow'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5',
              )
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200/70 p-4 dark:border-white/10">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
          <Avatar src={user?.profilePicture} name={user?.name} size={38} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">{user?.name}</p>
            <p className="flex items-center gap-1 text-xs text-slate-400">
              {roleMeta?.icon && <roleMeta.icon size={11} />} {roleMeta?.label}
            </p>
          </div>
          <button onClick={handleLogout} title="Logout" className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10">
            <FiLogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50 lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar — plain conditional render (no AnimatePresence) so it
          reliably unmounts the moment `mobileOpen` is false. */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div onClick={() => setMobileOpen(false)} className="absolute inset-0 animate-fade-in bg-slate-900/50 backdrop-blur-sm" />
          <aside className="absolute left-0 top-0 h-full w-72 animate-fade-in glass-strong">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function Topbar({ onMenu }) {
  const { user } = useAuth();
  const { notifications, unread, markRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const toggle = () => {
    setOpen((o) => {
      if (!o && unread) markRead();
      return !o;
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/70 bg-white/70 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50 sm:px-6">
      <button onClick={onMenu} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 lg:hidden">
        <FiMenu size={22} />
      </button>
      <div className="hidden lg:block">
        <h2 className="font-display text-lg font-semibold text-slate-800 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h2>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <div className="relative">
          <button onClick={toggle} className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/60 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <FiBell size={18} />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
          {open && (
            <div className="animate-fade-in">
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="glass-strong absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-2xl">
                  <div className="border-b border-slate-200/70 px-4 py-3 font-semibold dark:border-white/10">Notifications</div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-slate-400">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="flex gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-0 dark:border-white/5">
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                          <div>
                            <p className="text-slate-700 dark:text-slate-200">{n.message}</p>
                            <p className="mt-0.5 text-xs text-slate-400">{formatDateTime(n.timestamp)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
    </header>
  );
}
