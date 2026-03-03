import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// apply stored theme settings on startup (same logic as in Profile)
const applyTheme = (color, font) => {
  const map = {
    teal: ['#14b8a6', '#0d9488'],
    blue: ['#3b82f6', '#2563eb'],
    purple: ['#8b5cf6', '#7c3aed'],
    orange: ['#f97316', '#ea580c'],
  };
  const [primary, primaryDark] = map[color] || map.teal;
  document.documentElement.style.setProperty('--primary', primary);
  document.documentElement.style.setProperty('--primary-dark', primaryDark);
  const hexToRgb = (h) => {
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    return `${r},${g},${b}`;
  };
  document.documentElement.style.setProperty('--primary-alpha', `rgba(${hexToRgb(primary)}, 0.1)`);
  document.body.style.fontFamily = font;
};

const savedColor = localStorage.getItem('themeColor') || 'teal';
const savedFont = localStorage.getItem('fontFamily') || "'Inter',sans-serif";
applyTheme(savedColor, savedFont);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
