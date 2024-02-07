import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import RealtimeWorthJar from './realtime_worth_jar';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <RealtimeWorthJar />
  </React.StrictMode>
);
