import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Dashboard from "./pages/Dashboard/Dashboard";
import AddBooking from "./pages/AddBooking/AddBooking";
import Payments from "./pages/Payments/Payments";



import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-booking" element={<AddBooking />} />
            <Route path="/payments" element={<Payments />} />


            {/* future routes */}
          
            {/* <Route path="/tasks" element={<Tasks />} /> */}
            
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
