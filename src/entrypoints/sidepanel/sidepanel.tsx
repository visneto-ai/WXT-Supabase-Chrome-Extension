import React from 'react';
import ReactDOM from 'react-dom/client';
import AppSidePanel from './AppSidepanel.tsx';
import './AppSidepanel.css';
// Remove this line since we're using React state management instead
// import '@/lib/auth.js';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppSidePanel />
  </React.StrictMode>,
);
