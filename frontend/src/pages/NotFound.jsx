import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-8xl font-extrabold gradient-text">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-800 dark:text-white">Page not found</h1>
      <p className="mt-2 max-w-sm text-slate-500 dark:text-slate-400">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link to="/" className="mt-6"><Button size="lg">Back to Home</Button></Link>
    </div>
  );
}
