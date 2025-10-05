import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Board } from './pages/Board';
import { Tasks } from './pages/Tasks';
import { Team } from './pages/Team';
import { Projects } from './pages/Projects';
import { Analytics } from './pages/Analytics';
import { Calendar } from './pages/Calendar';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Admin } from './pages/Admin';

function App() {
  return (
    <Router>
      <AppProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes with Layout */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="board" element={<Board />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="team" element={<Team />} />
            <Route path="projects" element={<Projects />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="settings" element={<Settings />} />
            <Route path="admin" element={<Admin />} />
          </Route>

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AppProvider>
    </Router>
  );
}

export default App;