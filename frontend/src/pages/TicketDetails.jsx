
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import {
  ArrowLeft,
  MessageSquareText,
  History,
  Send,
  LockKeyhole,
  Clock3,
  UserRound,
  CheckCircle2
} from 'lucide-react';

import api, { err } from '../api';

const fmt = (value) =>
  value ? new Date(value).toLocaleString() : '—';

const pretty = (value) =>
  value?.replaceAll('_', ' ');

export default function TicketDetails() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [customerBody, setCustomerBody] = useState('');
  const [busy, setBusy] = useState(false);

  // Load ticket details
  async function load() {
    try {
      const [ticketResponse, agentResponse] = await Promise.all([
        api.get(`/api/tickets/${id}`),
        api.get('/api/me')
      ]);

      setData(ticketResponse.data);
      setMe(agentResponse.data);
    } catch (e) {
      setError(err(e));
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  // POST actions
  async function action(path, payload = {}) {
    setBusy(true);

    try {
      setError('');

      await api.post(`/api/tickets/${id}/${path}`, payload);
      await load();

      return true;
    } catch (e) {
      setError(err(e));
      return false;
    } finally {
      setBusy(false);
    }
  }

  // PATCH actions
  async function patch(path, payload) {
    setBusy(true);

    try {
      setError('');

      await api.patch(`/api/tickets/${id}/${path}`, payload);
      await load();
    } catch (e) {
      setError(err(e));
    } finally {
      setBusy(false);
    }
  }

  if (!data) {
    return (
      <p className="muted">
        {error || 'Loading ticket...'}
      </p>
    );
  }

  const t = data.ticket;
  const owner = t.assignee_id === me?.id;

  return (
    <div className="space-y-6">

      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex gap-2 items-center muted text-sm font-semibold hover:underline"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Ticket Header */}
      <div className="flex flex-wrap gap-4 items-start justify-between">
        <div>
          <div className="eyebrow mb-2">
            Ticket #{t.id}
          </div>

          <h1 className="page-title">
            {t.subject}
          </h1>

          <p className="muted mt-2 text-sm">
            {t.customer_name} · {t.customer_email}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <span className={`status-pill status-${t.status}`}>
            {pretty(t.status)}
          </span>

          <span className={`status-pill priority-${t.priority}`}>
            {t.priority}
          </span>
        </div>
      </div>

      {error && (
        <div className="panel text-danger">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5 items-start">

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">

          {/* Issue Description */}
          <section className="panel">
            <h2 className="font-extrabold text-lg flex gap-2 items-center mb-4">
              <MessageSquareText
                size={19}
                style={{ color: 'var(--accent)' }}
              />
              Issue Description
            </h2>

            <p className="whitespace-pre-wrap text-sm leading-7">
              {t.description}
            </p>
          </section>

          {/* Conversation */}
          <section className="panel space-y-4">
            <div>
              <h2 className="font-extrabold text-lg flex gap-2 items-center">
                <MessageSquareText
                  size={19}
                  style={{ color: 'var(--accent)' }}
                />
                Conversation
              </h2>

              <p className="muted text-xs mt-1">
                Public replies and internal notes
              </p>
            </div>

            {data.messages.length === 0 && (
              <p className="muted text-sm">
                No messages yet.
              </p>
            )}

            {data.messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl p-4 ${
                  message.visibility === 'INTERNAL'
                    ? 'note-private'
                    : 'note-public'
                }`}
              >
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <span className="text-xs font-extrabold flex gap-2 items-center">
                    {message.visibility === 'INTERNAL' ? (
                      <LockKeyhole size={14} />
                    ) : (
                      <MessageSquareText size={14} />
                    )}

                    {message.visibility === 'INTERNAL'
                      ? 'PRIVATE TEAM NOTE'
                      : 'PUBLIC MESSAGE'}
                  </span>

                  <span className="muted text-xs">
                    {fmt(message.created_at)}
                  </span>
                </div>

                <p className="whitespace-pre-wrap mt-3 text-sm leading-6">
                  {message.body}
                </p>
              </div>
            ))}

            {/* Add Message */}
            {owner &&
              !['RESOLVED', 'CLOSED'].includes(t.status) && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();

                    if (
                      await action('messages', {
                        body,
                        visibility
                      })
                    ) {
                      setBody('');
                    }
                  }}
                  className="space-y-3 pt-3"
                >
                  <label>Write a Message</label>

                  <select
                    value={visibility}
                    onChange={(e) =>
                      setVisibility(e.target.value)
                    }
                  >
                    <option value="PUBLIC">
                      Public Reply
                    </option>

                    <option value="INTERNAL">
                      Private Team Note
                    </option>
                  </select>

                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                    rows="4"
                    placeholder={
                      visibility === 'INTERNAL'
                        ? 'Write an internal note...'
                        : 'Write your reply...'
                    }
                  />

                  <button
                    type="submit"
                    disabled={busy}
                    className="btn"
                  >
                    <Send size={16} />
                    Save Message
                  </button>
                </form>
              )}
          </section>

          {/* Activity History */}
          <section className="panel">
            <h2 className="font-extrabold text-lg flex gap-2 items-center mb-5">
              <History
                size={19}
                style={{ color: 'var(--accent)' }}
              />
              Activity History
            </h2>

            <div className="space-y-0">
              {data.history.map((history) => (
                <div
                  key={history.id}
                  className="flex gap-3 pb-5 last:pb-0"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className="w-8 h-8 rounded-full grid place-items-center shrink-0"
                      style={{
                        background: 'var(--soft)',
                        color: 'var(--accent)'
                      }}
                    >
                      <CheckCircle2 size={15} />
                    </div>

                    <div
                      className="w-px flex-1 mt-2"
                      style={{
                        background: 'var(--line)'
                      }}
                    />
                  </div>

                  <div className="min-w-0 pt-1">
                    <div className="font-bold text-sm">
                      {pretty(history.action)}
                    </div>

                    <div className="muted text-xs mt-1">
                      {history.actor_id != null
                        ? `Agent ${history.actor_id}`
                        : 'System'}
                      {' · '}
                      {fmt(history.created_at)}
                    </div>

                    {history.details && (
                      <div className="muted text-xs mt-2 break-words">
                        {typeof history.details === 'string'
                          ? history.details
                          : JSON.stringify(history.details)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">

          {/* Ticket Controls */}
          <section className="panel space-y-5">
            <h2 className="font-extrabold text-lg">
              Ticket Controls
            </h2>

            {/* Assigned Agent */}
            <div>
              <label className="flex items-center gap-2">
                <UserRound size={15} />
                Assigned Agent
              </label>

              <div className="field-box text-sm font-bold">
                {t.assignee_id
                  ? `Agent #${t.assignee_id}`
                  : 'Unassigned'}
              </div>

              {!t.assignee_id && (
                <button
                  type="button"
                  disabled={busy}
                  className="btn w-full mt-3"
                  onClick={() => action('claim')}
                >
                  Take This Ticket
                </button>
              )}
            </div>

            {/* Priority */}
            <div>
              <label>Priority</label>

              <select
                disabled={
                  busy ||
                  !owner ||
                  ['RESOLVED', 'CLOSED'].includes(t.status)
                }
                value={t.priority}
                onChange={(e) =>
                  patch('priority', {
                    priority: e.target.value
                  })
                }
              >
                {['LOW', 'MEDIUM', 'URGENT'].map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label>Status</label>

              <select
                disabled={
                  busy ||
                  !owner ||
                  t.status === 'CLOSED'
                }
                value={t.status}
                onChange={(e) =>
                  patch('status', {
                    status: e.target.value
                  })
                }
              >
                {[
                  'OPEN',
                  'IN_PROGRESS',
                  'WAITING_CUSTOMER',
                  'RESOLVED',
                  'CLOSED'
                ].map((status) => (
                  <option key={status} value={status}>
                    {pretty(status)}
                  </option>
                ))}
              </select>
            </div>

            {/* Response Deadline */}
            <div className="field-box">
              <label className="flex items-center gap-2">
                <Clock3 size={15} />
                Response Deadline
              </label>

              <p className="text-sm">
                {fmt(t.response_due_at)}
              </p>

              {t.response_overdue && (
                <b className="text-danger text-xs">
                  Overdue
                </b>
              )}
            </div>

            {/* Resolution Deadline */}
            <div className="field-box">
              <label className="flex items-center gap-2">
                <Clock3 size={15} />
                Resolution Deadline
              </label>

              <p className="text-sm">
                {fmt(t.resolution_due_at)}
              </p>

              {t.resolution_overdue && (
                <b className="text-danger text-xs">
                  Overdue
                </b>
              )}
            </div>
          </section>

          {/* Customer Reply Simulation */}
          <section className="panel space-y-3">
            <h2 className="font-extrabold text-sm">
              Incoming Customer Reply
            </h2>

            <p className="muted text-xs">
              Demo: Record a reply received from the customer.
            </p>

            <textarea
              rows="3"
              value={customerBody}
              onChange={(e) =>
                setCustomerBody(e.target.value)
              }
              placeholder="Customer's message..."
            />

            <button
              type="button"
              disabled={busy || !customerBody.trim()}
              className="btn-secondary w-full"
              onClick={async () => {
                if (
                  await action('customer-reply', {
                    body: customerBody
                  })
                ) {
                  setCustomerBody('');
                }
              }}
            >
              <Send size={15} />
              Record Reply
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
