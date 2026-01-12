'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ConfigProvider, theme as antdTheme, Spin } from 'antd';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  setMode: () => {},
  isTransitioning: false,
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Prevent hydration mismatch
    setMounted(true);
    // Load from local storage
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
    if (savedMode) setModeState(savedMode);
  }, []);

  const setMode = (newMode: ThemeMode) => {
    if (newMode === mode) return;
    
    setIsTransitioning(true);
    
    // Smooth transition sequence
    setTimeout(() => {
      setModeState(newMode);
      
      // Allow time for theme to apply before hiding loader
      setTimeout(() => {
        setIsTransitioning(false);
      }, 600);
    }, 300);
  };

  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem('theme-mode', mode);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = () => {
      let shouldBeDark = false;
      if (mode === 'dark') {
        shouldBeDark = true;
      } else if (mode === 'light') {
        shouldBeDark = false;
      } else {
        shouldBeDark = mediaQuery.matches;
      }
      
      setIsDark(shouldBeDark);
      
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();
    
    if (mode === 'system') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [mode, mounted]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ mode, setMode, isTransitioning }}>
      <ConfigProvider
        theme={{
          algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
             // Custom token overrides if needed
          }
        }}
      >
        {children}
        {isTransitioning && (
          <div 
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-300"
            style={{ 
              backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <Spin size="large" />
            <div className="mt-4 text-base font-medium text-gray-800 dark:text-gray-100">
              正在切换主题...
            </div>
          </div>
        )}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}
