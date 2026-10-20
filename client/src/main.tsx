import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import './index.css';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

// Initialize native mobile features if running inside Capacitor Android/iOS app
if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
  StatusBar.setBackgroundColor({ color: '#0f172a' }).catch(() => {});
  SplashScreen.hide().catch(() => {});
}

// Register service worker for Progressive Web App (PWA) installation
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('Kailash Bhawan SW registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('Kailash Bhawan SW registration failed:', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
