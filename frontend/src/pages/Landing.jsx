import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiSearch, FiCalendar, FiShield, FiStar, FiActivity } from 'react-icons/fi';
import Logo from '../components/common/Logo';
import ThemeToggle from '../components/ui/ThemeToggle';
import Button from '../components/ui/Button';
import { SPECIALIZATIONS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { ROLE_HOME } from '../constants';

const FEATURES = [
  { icon: FiSearch, title: 'Find the right doctor', desc: 'Filter 5,000+ verified specialists by experience, fees, ratings and availability.' },
  { icon: FiCalendar, title: 'Book in seconds', desc: 'Pick a slot, confirm, done. Reschedule or cancel anytime from your dashboard.' },
  { icon: FiShield, title: 'Safe & secure', desc: 'Bank-grade encryption keeps your health records private and protected.' },
];

const STATS = [
  { value: '5,000+', label: 'Verified Doctors' },
  { value: '2M+', label: 'Happy Patients' },
  { value: '24', label: 'Specialities' },
  { value: '4.9★', label: 'Average Rating' },
];

export default function Landing() {
  const { isAuthenticated, role } = useAuth();
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link to={ROLE_HOME[role]}><Button size="sm">Go to Dashboard</Button></Link>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
                <Link to="/register"><Button size="sm">Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 text-sm font-semibold text-brand-600"
              >
                <FiStar /> India&apos;s most-loved consultation platform
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-5 font-display text-5xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-6xl"
              >
                Your health, <span className="gradient-text">one tap away.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-5 max-w-lg text-lg text-slate-600 dark:text-slate-300"
              >
                Consult top-rated doctors online, book appointments instantly, and manage your care — all in one beautifully simple platform.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Link to="/register">
                  <Button size="lg">Find a Doctor <FiArrowRight /></Button>
                </Link>
                <Link to="/register/doctor">
                  <Button variant="outline" size="lg"><FiActivity /> Join as Doctor</Button>
                </Link>
              </motion.div>

              <div className="mt-12 grid grid-cols-4 gap-4">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{s.value}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating cards visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative hidden h-[460px] lg:block"
            >
              <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-gradient-to-br from-brand-400 to-accent-400 opacity-20 blur-3xl" />
              <div className="glass absolute left-4 top-8 w-64 animate-float rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-white"><FiActivity /></div>
                  <div>
                    <p className="font-semibold">Dr. Ananya Sharma</p>
                    <p className="text-xs text-slate-500">Cardiologist · 12 yrs</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-sm text-amber-500"><FiStar className="fill-amber-400" /> 4.9 (320)</div>
              </div>
              <div className="glass absolute bottom-12 right-2 w-60 rounded-2xl p-5" style={{ animationDelay: '1s' }}>
                <p className="text-sm font-semibold">Next appointment</p>
                <p className="mt-1 text-xs text-slate-500">Today · 4:30 PM</p>
                <div className="mt-3 h-2 w-full rounded-full bg-slate-200 dark:bg-white/10">
                  <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-brand-500 to-accent-500" />
                </div>
              </div>
              <div className="glass absolute left-12 bottom-0 w-52 animate-float rounded-2xl p-4" style={{ animationDelay: '0.5s' }}>
                <p className="text-xs text-slate-500">Consultation fee</p>
                <p className="font-display text-2xl font-bold gradient-text">₹499</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
                  <f.icon size={22} />
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-slate-800 dark:text-white">{f.title}</h3>
                <p className="mt-2 text-slate-500 dark:text-slate-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialities */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center font-display text-3xl font-bold text-slate-800 dark:text-white">Browse by speciality</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {SPECIALIZATIONS.map((s) => (
              <Link key={s} to="/register" className="rounded-full border border-slate-200 bg-white/60 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-400 hover:text-brand-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-accent-600 px-8 py-16 text-center text-white shadow-glow">
          <h2 className="font-display text-4xl font-extrabold">Ready to feel better?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">Create your free account and consult a doctor in minutes.</p>
          <Link to="/register" className="mt-8 inline-block">
            <Button size="lg" variant="subtle" className="!bg-white !text-brand-700">Get Started Free <FiArrowRight /></Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200/60 px-4 py-8 text-center text-sm text-slate-400 dark:border-white/10">
        © {new Date().getFullYear()} MediConsult. Built for demonstration purposes.
      </footer>
    </div>
  );
}
