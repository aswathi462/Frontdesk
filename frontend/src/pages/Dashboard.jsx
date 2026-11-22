
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Ticket,
  Clock3,
  AlertTriangle,
  Inbox,
  ArrowUpRight,
  Search,
  RefreshCw
} from 'lucide-react';
import api, { err } from '../api';

const states = [
  'ALL',
  'OPEN',
  'IN_PROGRESS',
  'WAITING_CUSTOMER',
  'RESOLVED',
  'CLOSED'
];

const pretty = (s) => s?.replaceAll('_', ' ');
const dt = (v) => v ? new Date(v).toLocaleString() : '—';

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [mine, setMine] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/api/tickets', {
        params: { mine }
      });
      setTickets(response.data);
    } catch (e) {
      setError(err(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [mine]);

  const visible = tickets.filter((t) =>
    (filter === 'ALL' || t.status === filter) &&
    `${t.id} ${t.subject} ${t.customer_name} ${t.customer_email}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const overdue = tickets.filter(
    (t) => t.response_overdue || t.resolution_overdue
  ).length;

  const cards = [
    {
      name: 'Total Tickets',
      value: tickets.length,
      icon: Ticket,
      color: '#6660e8',
      bg: '#eeedff'
    },
    {
      name: 'Overdue Tickets',
      value: overdue,
      icon: AlertTriangle,
      color: '#e36b6b',
      bg: '#fff0f0'
    },
    {
      name: 'Awaiting Customer',
      value: tickets.filter(
        (t) => t.status === 'WAITING_CUSTOMER'
      ).length,
      icon: Clock3,
      color: '#e5a14a',
      bg: '#fff3e2'
    },
    {
      name: 'Active Tickets',
      value: tickets.filter(
        (t) => !['RESOLVED', 'CLOSED'].includes(t.status)
      ).length,
      icon: Inbox,
      color: '#299e85',
      bg: '#e5f8f1'
    }
  ];

  return (
    <div className="space-y-7">

      {/* Dashboard Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="muted mt-2 text-sm">
            Manage customer tickets, track progress, and monitor deadlines.
          </p>
        </div>

        <Link to="/tickets/new" className="btn text-sm">
          <Plus size={17} />
          Create Ticket
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div className="panel !p-5" key={card.name}>
            <div className="flex justify-between items-center gap-2 mb-5">
              <span className="muted text-xs md:text-sm font-semibold">
                {card.name}
              </span>

              <span
                className="w-10 h-10 rounded-xl grid place-items-center shrink-0"
                style={{
                  background: card.bg,
                  color: card.color
                }}
              >
                <card.icon size={19} />
              </span>
            </div>

            <div className="text-3xl font-extrabold tracking-tight">
              {card.value}
            </div>

            <div className="muted text-xs mt-2">
              Tickets
            </div>
          </div>
        ))}
      </div>

      {/* Ticket Table */}
      <section className="panel !p-0 overflow-hidden">

        <div className="p-5 md:p-6 flex flex-wrap gap-4 items-center justify-between border-b divider">
          <div>
            <h2 className="text-lg font-extrabold">
              Ticket List
            </h2>
            <p className="muted text-xs mt-1">
              View and manage support requests
            </p>
          </div>

          <button
            onClick={load}
            disabled={loading}
            className="btn-secondary text-sm"
          >
            <RefreshCw size={15} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Filters */}
        <div className="p-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[190px]">
            <Search
              size={17}
              className="absolute left-3 top-3.5 muted"
            />

            <input
              className="!pl-10"
              placeholder="Search tickets..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <select
            className="max-w-[210px]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {states.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Statuses' : pretty(s)}
              </option>
            ))}
          </select>

          <label className="!mb-0 flex gap-2 items-center whitespace-nowrap text-sm">
            <input
              type="checkbox"
              checked={mine}
              onChange={(e) => setMine(e.target.checked)}
            />
            My Tickets Only
          </label>
        </div>

        {error && (
          <p className="text-danger px-6 pb-4">{error}</p>
        )}

        {/* Tickets */}
        <div className="table-wrap">
          <table className="ticket-table">
            <thead>
              <tr>
                {[
                  'Ticket',
                  'Priority',
                  'Status',
                  'Assigned To',
                  'Response Due',
                  'Resolution Due',
                  ''
                ].map((heading) => (
                  <th key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {visible.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link
                      to={`/tickets/${t.id}`}
                      className="font-extrabold hover:underline"
                      style={{ color: 'var(--accent)' }}
                    >
                      #{t.id} {t.subject}
                    </Link>

                    <div className="muted text-xs mt-1">
                      {t.customer_name}
                    </div>
                  </td>

                  <td>
                    <span className={`status-pill priority-${t.priority}`}>
                      {t.priority}
                    </span>
                  </td>

                  <td>
                    <span className={`status-pill status-${t.status}`}>
                      {pretty(t.status)}
                    </span>
                  </td>

                  <td className="font-semibold">
                    {t.assignee_id
                      ? `Agent #${t.assignee_id}`
                      : 'Unassigned'}
                  </td>

                  <td className={t.response_overdue ? 'text-danger font-bold' : 'muted'}>
                    {dt(t.response_due_at)}
                  </td>

                  <td className={t.resolution_overdue ? 'text-danger font-bold' : 'muted'}>
                    {dt(t.resolution_due_at)}
                  </td>

                  <td>
                    <Link
                      to={`/tickets/${t.id}`}
                      aria-label={`Open ticket ${t.id}`}
                    >
                      <ArrowUpRight
                        size={18}
                        style={{ color: 'var(--accent)' }}
                      />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {visible.length === 0 && (
            <div className="p-10 text-center muted">
              No tickets found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
