import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import DashboardHome from './pages/DashboardHome';
import SystemSettings from './pages/SystemSettings';
import AdminManagement from './pages/AdminManagement';
import AuditLog from './pages/AuditLog';

function App() {
  useEffect(() => {
    // Session Transfer Logic: Check for session in URL
    const urlParams = new URLSearchParams(window.location.search);
    const session = urlParams.get('session');
    
    if (session) {
      try {
        const userData = JSON.parse(atob(session));
        localStorage.setItem('user', JSON.stringify(userData));
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error('Failed to parse session:', e);
      }
    }
    
    // Auth Check: Redirect to main project if no user
    const user = localStorage.getItem('user');
    if (!user && window.location.pathname !== '/login') {
      window.location.href = 'http://localhost:5173/login';
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<DashboardHome />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="admins" element={<AdminManagement />} />
          <Route path="audit" element={<AuditLog />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
