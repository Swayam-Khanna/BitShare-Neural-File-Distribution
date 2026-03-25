import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { MotionConfig } from 'framer-motion';
import './index.css'
import App from './App.tsx'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'placeholder-client-id';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <MotionConfig transition={{ type: "tween", ease: [0.65, 0, 0.35, 1], duration: 0.6 }}>
        <App />
      </MotionConfig>
    </GoogleOAuthProvider>
  </StrictMode>,
)
