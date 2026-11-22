
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import {
  ArrowLeft,
  Send,
  UserRound,
  FileText
} from 'lucide-react';

import api, { err } from '../api';

export default function CreateTicket() {
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: '',
    priority: 'LOW'
  });

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();

  // Update form fields
  const change = (key) => (e) => {
    setForm((previous) => ({
      ...previous,
      [key]: e.target.value
    }));
  };

  // Create ticket
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const response = await api.post('/api/tickets', form);

      navigate(`/tickets/${response.data.id}`);
    } catch (e) {
      setError(err(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">

      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex gap-2 items-center muted text-sm font-semibold hover:underline"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Page Header */}
      <div>
        <h1 className="page-title">
          Create Ticket
        </h1>

        <p className="muted mt-2 text-sm">
          Enter customer details and describe the support issue.
        </p>
      </div>

      {/* Ticket Form */}
      <form
        onSubmit={submit}
        className="panel space-y-7"
      >

        {/* Error Message */}
        {error && (
          <p className="text-danger">
            {error}
          </p>
        )}

        {/* Customer Details */}
        <section className="space-y-4">
          <h2 className="flex gap-2 items-center font-extrabold">
            <UserRound
              size={19}
              style={{ color: 'var(--accent)' }}
            />
            Customer Details
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">

            {/* Customer Name */}
            <div>
              <label>Customer Name</label>

              <input
                type="text"
                required
                value={form.customer_name}
                onChange={change('customer_name')}
                placeholder="Enter customer name"
              />
            </div>

            {/* Customer Email */}
            <div>
              <label>Customer Email</label>

              <input
                type="email"
                required
                value={form.customer_email}
                onChange={change('customer_email')}
                placeholder="customer@example.com"
              />
            </div>
          </div>
        </section>

        <hr className="divider" />

        {/* Issue Information */}
        <section className="space-y-4">
          <h2 className="flex gap-2 items-center font-extrabold">
            <FileText
              size={19}
              style={{ color: 'var(--accent)' }}
            />
            Issue Information
          </h2>

          {/* Subject */}
          <div>
            <label>Subject</label>

            <input
              type="text"
              required
              value={form.subject}
              onChange={change('subject')}
              placeholder="Enter ticket subject"
            />
          </div>

          {/* Description */}
          <div>
            <label>Description</label>

            <textarea
              required
              rows="6"
              value={form.description}
              onChange={change('description')}
              placeholder="Describe the customer's issue in detail..."
            />
          </div>

          {/* Priority */}
          <div>
            <label>Priority</label>

            <select
              value={form.priority}
              onChange={change('priority')}
            >
              {['LOW', 'MEDIUM', 'URGENT'].map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>

            <p className="muted text-xs mt-2">
              Priority determines the response and resolution deadlines.
            </p>
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex flex-wrap justify-end gap-3">

          <Link
            to="/"
            className="btn-secondary"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="btn"
            disabled={busy}
          >
            <Send size={16} />
            {busy ? 'Creating...' : 'Create Ticket'}
          </button>

        </div>
      </form>
    </div>
  );
}
