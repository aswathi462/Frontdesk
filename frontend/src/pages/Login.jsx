
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Headphones,
  LockKeyhole,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

import ThemeToggle from '../components/ThemeToggle';
import api, { err } from '../api';

export default function Login() {
  const [email, setEmail] = useState('agent@frontdesk.test');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const { data } = await api.post('/api/login', {
        email,
        password
      });

      localStorage.setItem('token', data.access_token);
      navigate('/');
    } catch (e) {
      setError(err(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* Left Side - Branding */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 xl:p-20 text-white relative overflow-hidden"
        style={{
          background:
            'linear-gradient(145deg,#3932aa,#6d65ee 65%,#958cfb)'
        }}
      >
        {/* Background Decoration */}
        <div className="absolute w-96 h-96 rounded-full border border-white/20 -right-32 top-20" />

        <div className="absolute w-72 h-72 rounded-full border border-white/20 -left-24 bottom-12" />

        {/* Logo */}
        <div className="relative flex gap-3 items-center text-3xl font-extrabold tracking-tight">
          <span className="p-3 rounded-2xl bg-white/20">
            <Headphones size={28} />
          </span>
          FRONTDESK
        </div>

        {/* Introduction */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm mb-8">
            <ShieldCheck size={16} />
            Customer Support Management
          </div>

          <h1 className="text-5xl xl:text-6xl font-extrabold tracking-tight leading-tight">
            Manage Support
            <br />
            Tickets Easily.
          </h1>

          <p className="text-white/75 text-lg mt-7 max-w-md">
            Track customer requests, assign tickets, and manage
            support operations from one place.
          </p>
        </div>

        {/* Footer */}
        <p className="text-sm text-white/60 relative">
          FRONTDESK · Customer Support System
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <div className="lg:hidden flex items-center gap-2 font-extrabold text-xl">
            <Headphones
              size={24}
              style={{ color: 'var(--accent)' }}
            />
            FRONTDESK
          </div>

          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        {/* Login Form */}
        <div className="flex-1 grid place-items-center px-5 py-10">
          <form
            onSubmit={submit}
            className="w-full max-w-md space-y-6"
          >

            {/* Login Icon */}
            <div
              className="w-14 h-14 rounded-2xl grid place-items-center mb-6"
              style={{
                background: 'var(--soft)',
                color: 'var(--accent)'
              }}
            >
              <LockKeyhole size={26} />
            </div>

            {/* Heading */}
            <div>
              <h2 className="page-title">
                Agent Login
              </h2>

              <p className="muted mt-2">
                Sign in to manage customer support tickets.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="field-box text-danger text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label>Email Address</label>

              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div>
              <label>Password</label>

              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={busy}
              className="btn w-full !py-3.5"
            >
              {busy ? 'Signing in...' : 'Sign In'}
              <ArrowRight size={17} />
            </button>

            {/* Footer */}
            <p className="muted text-xs text-center">
              Authorized Agents Only
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}
