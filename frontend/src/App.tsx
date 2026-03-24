import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import DownloadPage from './pages/DownloadPage';
import Pricing from './pages/Pricing';
import Payment from './pages/Payment';

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/payment/:tier" element={user ? <Payment /> : <Navigate to="/login" />} />
          <Route path="/d/:code" element={<DownloadPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
