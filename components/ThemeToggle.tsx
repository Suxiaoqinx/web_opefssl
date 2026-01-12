'use client';
import { Button, Dropdown, MenuProps } from 'antd';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { mode, setMode } = useTheme();

  const items: MenuProps['items'] = [
    {
      key: 'light',
      label: <div className="flex items-center gap-2"><Sun size={16} /> 浅色模式</div>,
      onClick: () => setMode('light'),
    },
    {
      key: 'dark',
      label: <div className="flex items-center gap-2"><Moon size={16} /> 深色模式</div>,
      onClick: () => setMode('dark'),
    },
    {
      key: 'system',
      label: <div className="flex items-center gap-2"><Monitor size={16} /> 跟随系统</div>,
      onClick: () => setMode('system'),
    },
  ];

  const getIcon = () => {
    switch (mode) {
      case 'light': return <Sun size={20} />;
      case 'dark': return <Moon size={20} />;
      default: return <Monitor size={20} />;
    }
  };

  return (
    <Dropdown menu={{ items, selectedKeys: [mode] }} placement="bottomRight" arrow>
      <Button type="text" icon={getIcon()} className="flex items-center justify-center" />
    </Dropdown>
  );
}
