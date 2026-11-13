import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for offline PWA functionality
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('Update PWA tersedia.');
  },
  onOfflineReady() {
    console.log('Photobox siap digunakan offline tanpa koneksi internet!');
  },
});

// Avoid unused var warning
if (typeof updateSW === 'function') {
  // ready
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
