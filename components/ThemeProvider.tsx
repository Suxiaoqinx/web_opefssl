'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ConfigProvider, theme as antdTheme, Spin } from 'antd';

type ThemeMode = 'light' | 'dark' | 'system';
export type LayoutMode = 'grid' | 'tabs';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  setMode: () => {},
  primaryColor: '#1677ff',
  setPrimaryColor: () => {},
  layoutMode: 'grid',
  setLayoutMode: () => {},
  isTransitioning: false,
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [primaryColor, setPrimaryColorState] = useState<string>('#1677ff');
  const [layoutMode, setLayoutModeState] = useState<LayoutMode>('grid');
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Prevent hydration mismatch
    setMounted(true);
    // Load from local storage
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
    if (savedMode) setModeState(savedMode);
    
    const savedColor = localStorage.getItem('theme-color');
    if (savedColor) setPrimaryColorState(savedColor);

    const savedLayout = localStorage.getItem('theme-layout') as LayoutMode;
    if (savedLayout) setLayoutModeState(savedLayout);
  }, []);

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color);
    localStorage.setItem('theme-color', color);
  };

  const setLayoutMode = (newLayout: LayoutMode) => {
    setLayoutModeState(newLayout);
    localStorage.setItem('theme-layout', newLayout);
  };

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
    <ThemeContext.Provider value={{ mode, setMode, primaryColor, setPrimaryColor, layoutMode, setLayoutMode, isTransitioning }}>
      <ConfigProvider
        theme={{
          algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
             colorPrimary: primaryColor,
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
