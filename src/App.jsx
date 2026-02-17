import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";
import Navbar from "./components/Navbar/Navbar";
import Dashboard from "./pages/Dashboard/Dashboard";
import AddBooking from "./pages/AddBooking/AddBooking";
import Payments from "./pages/Payments/Payments";
import Clients from "./pages/Clients/Clients";
import Transactions from "./pages/Transactions/Transactions";

import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";

import "./App.css";

const ProtectedLayout = ({ children }) => {
  const { user } = useAuth();

  if (user === null) {
    return <Navigate to="/login" replace />;
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
              path="/payments"
              element={
                <ProtectedLayout>
                  <Payments />
                </ProtectedLayout>
              }
            />

            <Route
              path="/clients"
              element={
                <ProtectedLayout>
                  <Clients />
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

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
