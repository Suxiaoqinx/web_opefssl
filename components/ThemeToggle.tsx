'use client';
import { useState } from 'react';
import { Button, Modal, ColorPicker, Tooltip } from 'antd';
import { Moon, Sun, Monitor, Settings, X, RotateCcw, LayoutDashboard, Layers } from 'lucide-react';
import { useTheme, LayoutMode } from './ThemeProvider';
import { Color } from 'antd/es/color-picker';

const PRESET_COLORS = [
  '#1677ff', // Blue (Default)
  '#f5222d', // Red
  '#fa8c16', // Orange
  '#fadb14', // Yellow
  '#52c41a', // Green
  '#13c2c2', // Cyan
  '#722ed1', // Purple
  '#eb2f96', // Magenta
];

export default function ThemeToggle() {
  const { mode, setMode, primaryColor, setPrimaryColor, layoutMode, setLayoutMode } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModeChange = (value: string) => {
    setMode(value as 'light' | 'dark' | 'system');
  };

  const handleLayoutChange = (value: LayoutMode) => {
    setLayoutMode(value);
  };

  const handleColorChange = (value: Color, hex: string) => {
    setPrimaryColor(hex);
  };

  const resetColor = () => {
    setPrimaryColor('#1677ff');
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50">
        <Button 
          size="large"
          shape="circle"
          icon={<Settings size={20} />} 
          className="flex items-center justify-center shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
          onClick={() => setIsModalOpen(true)}
        />
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-medium">
            <Settings size={18} />
            <span>设置</span>
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
        <div className="py-4 space-y-6">
          {/* Mode Selection */}
          <div>
            <div className="mb-3 text-sm text-gray-500 dark:text-gray-400 font-medium">外观模式</div>
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

          {/* Layout Selection */}
          <div>
            <div className="mb-3 text-sm text-gray-500 dark:text-gray-400 font-medium">布局模式</div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleLayoutChange('grid')}
                className={`
                  flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200
                  ${layoutMode === 'grid' 
                    ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <LayoutDashboard size={24} />
                <span className="text-sm">网格布局</span>
              </button>
              
              <button
                onClick={() => handleLayoutChange('tabs')}
                className={`
                  flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200
                  ${layoutMode === 'tabs' 
                    ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <Layers size={24} />
                <span className="text-sm">聚合布局</span>
              </button>
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                <span className="w-1 h-4 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                主题色彩
              </div>
              <Tooltip title="重置默认颜色">
                <Button 
                  type="text" 
                  size="small" 
                  icon={<RotateCcw size={14} />} 
                  onClick={resetColor}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                />
              </Tooltip>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="flex flex-wrap gap-3 mb-4">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setPrimaryColor(color)}
                      className={`
                        w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-2 dark:ring-offset-gray-900
                        ${primaryColor === color ? 'ring-gray-400 dark:ring-gray-500 scale-110' : 'ring-transparent'}
                      `}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
                
                <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500">自定义颜色</span>
                    <div className="flex-1">
                        <ColorPicker 
                            value={primaryColor}
                            onChange={handleColorChange}
                            showText
                            className="w-full"
                        />
                    </div>
                </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
