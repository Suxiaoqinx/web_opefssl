'use client';
import { useState } from 'react';
import { Button, Modal, Segmented, ConfigProvider, theme } from 'antd';
import { Moon, Sun, Monitor, Settings, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getIcon = () => {
    switch (mode) {
      case 'light': return <Sun size={20} />;
      case 'dark': return <Moon size={20} />;
      default: return <Monitor size={20} />;
    }
  };

  const handleModeChange = (value: string) => {
    setMode(value as 'light' | 'dark' | 'system');
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50">
        <Button 
          size="large"
          shape="circle"
          icon={getIcon()} 
          className="flex items-center justify-center shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
          onClick={() => setIsModalOpen(true)}
        />
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-medium">
            <Settings size={18} />
            <span>主题设置</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={360}
        closeIcon={<X size={18} />}
        centered
        className="theme-settings-modal"
      >
        <div className="py-4">
          <div className="mb-3 text-sm text-gray-500 dark:text-gray-400">显示模式</div>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleModeChange('light')}
              className={`
                flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200
                ${mode === 'light' 
                  ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <Sun size={24} />
              <span className="text-sm">浅色</span>
            </button>
            
            <button
              onClick={() => handleModeChange('dark')}
              className={`
                flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200
                ${mode === 'dark' 
                  ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <Moon size={24} />
              <span className="text-sm">深色</span>
            </button>

            <button
              onClick={() => handleModeChange('system')}
              className={`
                flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200
                ${mode === 'system' 
                  ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <Monitor size={24} />
              <span className="text-sm">系统</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
