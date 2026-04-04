import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";
import SignUp from "./pages/SignUp/SignUp";
import PendingView from "./pages/Pending/PendingView";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Navbar from "./components/Navbar/Navbar";
import Dashboard from "./pages/Dashboard/Dashboard";
import AddBooking from "./pages/AddBooking/AddBooking";
import Payments from "./pages/Payments/Payments";
import Bookings from "./pages/Bookings/Bookings";
import Transactions from "./pages/Transactions/Transactions";
import Profile from "./pages/Profile/Profile";

import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";

import "./App.css";

const ProtectedLayout = ({ children, requireAdmin = false }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 💡 Master Admin - Strictly isolated to /admin management
  if (user.email === "admin@studio.com") {
    const path = window.location.pathname;
    if (path !== "/admin" && path !== "/profile") {
      return <Navigate to="/admin" replace />;
    }
  }

  // 💡 Power User or Approved Photographer - Standard Access
  if (profile?.isAdmin || profile?.status === "active") {
    return (
      <div className="app">
        <Navbar />
        <main className="main">{children}</main>
      </div>
    );
  }

  // Handle Pending Users
  if (profile?.status === "pending") {
    return <Navigate to="/pending" replace />;
  }

  // Handle Admin Pages
  if (requireAdmin && !profile?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app">
      <Navbar />
      <main className="main">{children}</main>
    </div>
  );
};

import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/pending" element={<PendingView />} />

            <Route
              path="/admin"
              element={
                <ProtectedLayout requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedLayout>
              }
            />

            <Route
              path="/"
              element={
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              }
            />

            <Route
              path="/add-booking"
              element={
                <ProtectedLayout>
                  <AddBooking />
                </ProtectedLayout>
              }
            />

            <Route
              path="/edit-booking/:id"
              element={
                <ProtectedLayout>
                  <AddBooking />
                </ProtectedLayout>
              }
            />

            <Route
              path="/payments"
              element={
                <ProtectedLayout>
                  <Payments />
                </ProtectedLayout>
              }
            />

            <Route
              path="/bookings"
              element={
                <ProtectedLayout>
                  <Bookings />
                </ProtectedLayout>
              }
            />

            <Route
              path="/transactions"
              element={
                <ProtectedLayout>
                  <Transactions />
                </ProtectedLayout>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedLayout>
                  <Profile />
                </ProtectedLayout>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
