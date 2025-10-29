// src/hooks/useTheme.js - Enhanced with better debugging
import { useState, useEffect } from 'react';

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'noir';
    }
    return 'noir';
  });

  useEffect(() => {
    console.log('🎨 Applying theme:', currentTheme);

    // Set the data-theme attribute
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    
    // Log current CSS variables for debugging
    const computedStyle = getComputedStyle(document.documentElement);
    console.log('📊 CSS Variables:', {
      bgPrimary: computedStyle.getPropertyValue('--bg-primary').trim(),
      bgSecondary: computedStyle.getPropertyValue('--bg-secondary').trim(),
      textPrimary: computedStyle.getPropertyValue('--text-primary').trim(),
      accentColor: computedStyle.getPropertyValue('--accent-color').trim()
    });
    
  }, [currentTheme]);

  const changeTheme = (theme) => {
    console.log('🔄 Changing theme to:', theme);
    setCurrentTheme(theme);
  };

  return { currentTheme, changeTheme };
}