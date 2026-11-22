import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import { activeBugs } from './bugs';

// CSS-only seeded bugs hook into <html data-bugs="…">
if (activeBugs().length) document.documentElement.dataset.bugs = activeBugs().join(' ');

// Strip the trailing slash: "/" -> "", "/qa-playground/" -> "/qa-playground"
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
