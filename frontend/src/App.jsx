import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';

// Layouts
import MemberLayout from './layouts/MemberLayout';
import AdminLayout from './layouts/AdminLayout';

// Public/Auth Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Member Dashboard Pages
import MemberDashboard from './pages/MemberDashboard';
import Profile from './pages/Profile';
import Payment from './pages/Payment';
import MembershipPlans from './pages/MembershipPlans';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';

// Admin Panel Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminMembers from './pages/AdminMembers';
import AdminPlans from './pages/AdminPlans';
import AdminPayments from './pages/AdminPayments';
import AdminGallery from './pages/AdminGallery';
import AdminContact from './pages/AdminContact';
import AdminReports from './pages/AdminReports';

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Landing Page (Public View with Sticky Navbar) */}
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <LandingPage />
                </>
              }
            />

            {/* Guest-only Auth Pages */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Member Workspace Routes (Both Members & Admins can access their own workspace) */}
            <Route element={<ProtectedRoute allowedRoles={['member', 'admin']} />}>
              <Route element={<MemberLayout />}>
                <Route path="/dashboard" element={<MemberDashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/plans" element={<MembershipPlans />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/contact" element={<Contact />} />
              </Route>
            </Route>

            {/* Admin Console Control Routes (Admin only) */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/members" element={<AdminMembers />} />
                <Route path="/admin/plans" element={<AdminPlans />} />
                <Route path="/admin/payments" element={<AdminPayments />} />
                <Route path="/admin/gallery" element={<AdminGallery />} />
                <Route path="/admin/contact" element={<AdminContact />} />
                <Route path="/admin/reports" element={<AdminReports />} />
              </Route>
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}
