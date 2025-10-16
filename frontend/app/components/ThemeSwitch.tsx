// app/Components/ThemeSwitch.tsx
'use client';

import { useEffect, useState } from 'react';

const KEY = 'bs-theme';

export default function ThemeSwitch() {
  const [isDark, setIsDark] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as 'light' | 'dark' | null) ?? 'light';
    const dark = saved === 'dark';
    setIsDark(dark);
    document.documentElement.setAttribute('data-bs-theme', saved);
  }, []);

  function toggle() {
    const nextDark = !isDark;
    setIsDark(nextDark);
    const next = nextDark ? 'dark' : 'light';
    localStorage.setItem(KEY, next);
    document.documentElement.setAttribute('data-bs-theme', next);
  }

  return (
    <div className="form-check form-switch d-inline-flex align-items-center gap-2">
      <input
        className="form-check-input"
        type="checkbox"
        id="darkModeSwitch"
        role="switch"
        checked={isDark}
        onChange={toggle}
        aria-label="Toggle dark mode"
      />
      <label className="form-check-label" htmlFor="darkModeSwitch">
        Dark Mode
      </label>
    </div>
  );
}