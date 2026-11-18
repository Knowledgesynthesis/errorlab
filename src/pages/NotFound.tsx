import { Link } from 'react-router';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600">
        A Type I error on our side, or a typo on yours. <Link to="/" className="text-blue-700 underline">Go home</Link>.
      </p>
    </div>
  );
}
