import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VolunteerHub from './pages/VolunteerHub';
import SkillDonation from './pages/SkillDonation';
import BloodDonation from './pages/BloodDonation';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          {/* Sticky glass-panel header */}
          <Navbar />
          
          {/* Main page layout body */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/volunteer-hub" element={<VolunteerHub />} />
              <Route path="/skill-donation" element={<SkillDonation />} />
              <Route path="/blood-donation" element={<BloodDonation />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>

          {/* Persistent page footer */}
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
