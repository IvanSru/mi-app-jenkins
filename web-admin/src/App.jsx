import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout     from './components/Layout.jsx';
import Login      from './pages/Login.jsx';
import Dashboard  from './pages/Dashboard.jsx';
import Citas      from './pages/Citas.jsx';
import Barberos   from './pages/Barberos.jsx';
import Servicios  from './pages/Servicios.jsx';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index        element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="citas"     element={<Citas />} />
        <Route path="barberos"  element={<Barberos />} />
        <Route path="servicios" element={<Servicios />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
