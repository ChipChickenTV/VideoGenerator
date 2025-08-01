import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './style.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found');
}

const root = createRoot(container);
root.render(<App />);