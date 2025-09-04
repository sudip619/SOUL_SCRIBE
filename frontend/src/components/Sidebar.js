import React, { useEffect, useRef, useState } from 'react';

const NavItem = ({ active, label, onClick, children }) => (
  <button
    className={`sidebar-item ${active ? 'is-active' : ''}`}
    onClick={onClick}
    aria-label={label}
  >
    <span className="sidebar-icon">{children}</span>
    <span className="sidebar-label">{label}</span>
  </button>
);

function Sidebar({ currentView, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [playBounce, setPlayBounce] = useState(false);
  const timerRef = useRef(null);

  const items = [
    { key: 'home', label: 'Home', icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>
    )},
    { key: 'chat', label: 'Chat', icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>
    )},
    { key: 'profile', label: 'Profile', icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.33 0-8 2.17-8 5v1h16v-1c0-2.83-3.67-5-8-5z"/></svg>
    )},
    { key: 'moodTrends', label: 'Mood Trends', icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 3h2v18H3zM19 21h2V7h-2zM11 21h2V12h-2zM7 21h2V9H7zM15 21h2V5h-2z"/></svg>
    )},
    { key: 'insights', label: 'Insights', icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z"/></svg>
    )},
    { key: 'settings', label: 'Settings', icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.14 12.94a7.07 7.07 0 0 0 0-1.88l2.03-1.58a.5.5 0 0 0 .12-.65l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.1 7.1 0 0 0-1.63-.95l-.36-2.54A.5.5 0 0 0 13.9 1h-3.8a.5.5 0 0 0-.49.41l-.36 2.54a7.1 7.1 0 0 0-1.63.95l-2.39-.96a.5.5 0 0 0-.61.22L2.7 7.48a.5.5 0 0 0 .12.65l2.03 1.58a7.07 7.07 0 0 0 0 1.88L2.82 13.6a.5.5 0 0 0-.12.65l1.92 3.32a.5.5 0 0 0 .61.22l2.39-.96a7.1 7.1 0 0 0 1.63.95l.36 2.54a.5.5 0 0 0 .49.41h3.8a.5.5 0 0 0 .49-.41l.36-2.54a7.1 7.1 0 0 0 1.63-.95l2.39.96a.5.5 0 0 0 .61-.22l1.92-3.32a.5.5 0 0 0-.12-.65zm-7.14 2.06a4 4 0 1 1 4-4 4 4 0 0 1-4 4z"/></svg>
    )},
    { key: 'help', label: 'Help', icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 17h-2v-2h2zm1.07-7.75-.9.92A1.49 1.49 0 0 0 12.5 14h-1v-1a2 2 0 0 1 .55-1.38l1.2-1.2a1.5 1.5 0 1 0-2.55-1.06H9a3.5 3.5 0 1 1 5.07 2.69z"/></svg>
    )},
  ];

  const go = (key) => {
    if (key === 'insights') return onNavigate('moodTrends');
    onNavigate(key);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handleEnter = () => {
    setIsOpen(true);
    setPlayBounce(false);
    timerRef.current = setTimeout(() => setPlayBounce(true), 450);
  };

  const handleLeave = () => {
    setIsOpen(false);
    setPlayBounce(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <aside
      className={`sidebar ${isOpen ? 'is-open' : ''} ${playBounce ? 'play-bounce' : ''}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onAnimationEnd={() => setPlayBounce(false)}
      role="navigation"
      aria-label="Main"
    >
      <div className="sidebar-inner">
        {items.map((it) => (
          <NavItem key={it.key} active={currentView === it.key} label={it.label} onClick={() => go(it.key)}>
            {it.icon}
          </NavItem>
        ))}
      </div>
    </aside>
  );
}

export default Sidebar;
