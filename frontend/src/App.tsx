import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuthStore } from './store/useAuthStore'; // Keep this import for now, as it's not explicitly removed from the final App component structure in the instruction, only the usage of 'user' is.

// Lazy load components
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Pricing = lazy(() => import('./pages/Pricing'));
const DownloadPage = lazy(() => import('./pages/DownloadPage'));
const Payment = lazy(() => import('./pages/Payment'));

const App = () => {
  const { user } = useAuthStore(); // Keep this line as it's not explicitly removed from the App component in the instruction, only the usage in routes.

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Suspense fallback={
          <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-6 text-center space-y-8 overflow-hidden">
            <div className="relative">
              <div className="w-24 h-24 border-b-2 border-primary-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-12 h-12 bg-primary-500/10 rounded-xl animate-pulse" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-48 bg-white/5 rounded-full animate-pulse mx-auto" />
              <div className="h-3 w-32 bg-white/5 rounded-full animate-pulse mx-auto opacity-50" />
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/security" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/analytics" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user && user.isAdmin ? <Dashboard /> : <Navigate to="/dashboard" />} />
            <Route path="/trash" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/payment/:tier" element={user ? <Payment /> : <Navigate to="/login" />} />
            <Route path="/d/:code" element={<DownloadPage />} />
          </Routes>
        </Suspense>
        <Toaster position="bottom-right" />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
