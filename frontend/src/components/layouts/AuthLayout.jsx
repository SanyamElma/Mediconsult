import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';
import Logo from '../common/Logo';
import ThemeToggle from '../ui/ThemeToggle';

const HIGHLIGHTS = [
  'Consult 5,000+ verified specialists',
  'Book appointments in under 60 seconds',
  'Secure, encrypted health records',
  'Trusted by 2 million+ patients',
];

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen">
      {/* Branding panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-accent-700 lg:flex">
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(40rem_40rem_at_20%_20%,white,transparent),radial-gradient(30rem_30rem_at_80%_80%,white,transparent)]" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Logo className="[&_span]:!text-white" />
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-display text-4xl font-extrabold leading-tight"
            >
              Healthcare,
              <br /> reimagined for everyone.
            </motion.h1>
            <p className="mt-4 max-w-md text-white/80">
              The modern consultation platform connecting patients with the right doctors — faster, smarter and safer.
            </p>
            <ul className="mt-8 space-y-3">
              {HIGHLIGHTS.map((h, i) => (
                <motion.li
                  key={h}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3 text-white/90"
                >
                  <FiCheckCircle className="shrink-0 text-accent-300" /> {h}
                </motion.li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-white/60">© {new Date().getFullYear()} MediConsult. All rights reserved.</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between p-5">
          <Logo className="lg:hidden" />
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <h2 className="font-display text-3xl font-bold text-slate-800 dark:text-white">{title}</h2>
            {subtitle && <p className="mt-2 text-slate-500 dark:text-slate-400">{subtitle}</p>}
            <div className="mt-8">{children}</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
