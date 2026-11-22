
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Ticket,
  LogOut,
  PlusCircle,
  LayoutDashboard,
  Headphones
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Layout({ children }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen md:flex">

      {/* Sidebar */}
      <aside
        className="hidden md:flex w-64 shrink-0 flex-col border-r p-5 sticky top-0 h-screen"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--line)'
        }}
      >
        {/* Branding */}
        <Link
          to="/"
          className="flex items-center gap-3 px-1 py-4 mb-10"
        >
          <span
            className="w-11 h-11 rounded-xl grid place-items-center text-white shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            <Headphones size={24} />
          </span>

          <span className="text-2xl font-extrabold tracking-tight">
            FRONTDESK
          </span>
        </Link>

        {/* Navigation */}
        <div className="eyebrow px-3 mb-4">
          Navigation
        </div>

        <nav className="space-y-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `side-link ${isActive ? 'active' : ''}`
            }
          >
            <LayoutDashboard size={19} />
            Dashboard
          </NavLink>

          <NavLink
            to="/tickets/new"
            className={({ isActive }) =>
              `side-link ${isActive ? 'active' : ''}`
            }
          >
            <PlusCircle size={19} />
            New Ticket
          </NavLink>
        </nav>

        {/* Sidebar Footer */}
        <div className="mt-auto">
          <button
            onClick={logout}
            className="side-link w-full text-left"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 min-w-0">

        {/* Top Header */}
        <header
          className="h-20 border-b flex items-center justify-between px-5 md:px-9"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--line)'
          }}
        >
          <div className="flex items-center gap-4">

            {/* Mobile Branding */}
            <Link
              to="/"
              className="md:hidden flex items-center gap-2 font-extrabold text-xl"
            >
              <Ticket
                size={24}
                style={{ color: 'var(--accent)' }}
              />
              FRONTDESK
            </Link>

            {/* Desktop Header */}
            <div className="hidden md:block">
              <div className="font-bold text-base">
                Ticket Management
              </div>
              <div className="muted text-xs">
                Customer Support
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Link
              to="/tickets/new"
              className="btn-secondary hidden sm:inline-flex text-sm"
            >
              <PlusCircle size={16} />
              New Ticket
            </Link>

            <button
              onClick={logout}
              className="md:hidden btn-secondary"
              aria-label="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto p-5 md:p-9">
          {children}
        </main>
      </div>
    </div>
  );
}
