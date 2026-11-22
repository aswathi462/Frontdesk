
import {
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateTicket from './pages/CreateTicket';
import TicketDetails from './pages/TicketDetails';
import Layout from './components/Layout';

// Protect routes that require login
function Protected({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <Layout>
      {children}
    </Layout>
  );
}

// Application routes
export default function App() {
  return (
    <Routes>

      {/* Login Page */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* Dashboard */}
      <Route
        path="/"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />

      {/* Create Ticket */}
      <Route
        path="/tickets/new"
        element={
          <Protected>
            <CreateTicket />
          </Protected>
        }
      />

      {/* Ticket Details */}
      <Route
        path="/tickets/:id"
        element={
          <Protected>
            <TicketDetails />
          </Protected>
        }
      />

      {/* Redirect Unknown Routes */}
      <Route
        path="*"
        element={<Navigate to="/" />}
      />

    </Routes>
  );
}
