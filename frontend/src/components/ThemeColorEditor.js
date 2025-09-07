import React, { useEffect, useState } from 'react';

const VARS = [
  { key: '--bg-primary', label: 'Background Primary' },
  { key: '--bg-secondary', label: 'Background Secondary' },
  { key: '--accent-primary', label: 'Accent Primary' },
  { key: '--accent-secondary', label: 'Accent Secondary' },
  { key: '--radial-accent-color1', label: 'Radial Accent Color 1' },
  { key: '--radial-accent-color2', label: 'Radial Accent Color 2' },
  { key: '--radial-bg-color', label: 'Radial Background Color' },
];

function normalizeHex(value) {
  if (!value) return '#000000';
  const v = value.trim();
  // If value is already a hex like #rrggbb or #rgb, return as-is
  if (v.startsWith('#')) return v.toUpperCase();
  // If it's rgb(...) convert to hex
  if (v.startsWith('rgb')) {
    const nums = v.replace(/[^0-9,]/g, '').split(',').map(n => parseInt(n, 10));
    if (nums.length >= 3) {
      return '#' + nums.slice(0,3).map(n => n.toString(16).padStart(2,'0')).join('').toUpperCase();
    }
  }
  return v.toUpperCase();
}

export default function ThemeColorEditor() {
  const [colors, setColors] = useState(() => VARS.reduce((acc, v) => ({ ...acc, [v.key]: '#000000' }), {}));
  const [active, setActive] = useState(false);

  useEffect(() => {
    const cs = getComputedStyle(document.body);
    const next = {};
    VARS.forEach(v => {
      const raw = cs.getPropertyValue(v.key) || cs.getPropertyValue(v.key.replace(/^--/, '')) || '';
      const hex = normalizeHex(raw || window.getComputedStyle(document.documentElement).getPropertyValue(v.key) || raw);
      next[v.key] = hex || '#000000';
    });
    setColors(next);
    setActive(document.body.classList.contains('theme-happy'));
  }, []);

  const onChange = (key, value) => {
    const hex = normalizeHex(value);
    // Update the CSS variable on the body element so it overrides the theme class variables
    document.body.style.setProperty(key, hex);
    setColors(prev => ({ ...prev, [key]: hex }));
  };

  return (
    <div className="theme-color-editor">
      <h4 className="section-subtitle">Happy theme - Color customizer</h4>
      {!active && <p className="muted">Toggle the Happy theme to edit these colors (applies when <code>theme-happy</code> class is active).</p>}
      {VARS.map(v => (
        <div className="color-row" key={v.key}>
          <div className="color-label">{v.label} <small className="muted">{v.key}</small></div>
          <input
            aria-label={v.label}
            className="color-input"
            type="color"
            value={colors[v.key] || '#000000'}
            onChange={(e) => onChange(v.key, e.target.value)}
          />
          <div className="color-swatch" style={{ background: colors[v.key] }} />
          <div className="color-hex">{(colors[v.key] || '').toUpperCase()}</div>
        </div>
      ))}
    </div>
  );
}
