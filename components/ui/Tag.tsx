import React from 'react';
import { cn } from '@/lib/utils';

interface TagProps {
  type?: 'success' | 'info' | 'warning' | 'danger' | 'default';
  effect?: 'light' | 'dark' | 'plain';
  children: React.ReactNode;
  className?: string;
  round?: boolean;
}

export const Tag = ({ type = 'default', effect = 'light', children, className, round = false }: TagProps) => {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 text-xs font-medium border transition-colors";
  
  const roundedStyle = round ? "rounded-full" : "rounded-md";

  let colorStyles = "";

  // Element Plus colors
  // Success: #67c23a (bg-green-500), Info: #909399 (bg-gray-500), Danger: #f56c6c (bg-red-500)
  // Light: bg-opacity-10, border-opacity-20, text-color
  // Dark: bg-color, border-color, text-white
  // Plain: bg-white, border-color, text-color

  switch (type) {
    case 'success':
      if (effect === 'dark') colorStyles = "bg-[#67c23a] border-[#67c23a] text-white";
      else if (effect === 'plain') colorStyles = "bg-white border-[#67c23a] text-[#67c23a]";
      else colorStyles = "bg-[#f0f9eb] border-[#e1f3d8] text-[#67c23a]"; // light
      break;
    case 'info':
      if (effect === 'dark') colorStyles = "bg-[#909399] border-[#909399] text-white";
      else if (effect === 'plain') colorStyles = "bg-white border-[#909399] text-[#909399]";
      else colorStyles = "bg-[#f4f4f5] border-[#e9e9eb] text-[#909399]"; // light
      break;
    case 'danger':
      if (effect === 'dark') colorStyles = "bg-[#f56c6c] border-[#f56c6c] text-white";
      else if (effect === 'plain') colorStyles = "bg-white border-[#f56c6c] text-[#f56c6c]";
      else colorStyles = "bg-[#fef0f0] border-[#fde2e2] text-[#f56c6c]"; // light
      break;
    case 'warning':
      if (effect === 'dark') colorStyles = "bg-[#e6a23c] border-[#e6a23c] text-white";
      else if (effect === 'plain') colorStyles = "bg-white border-[#e6a23c] text-[#e6a23c]";
      else colorStyles = "bg-[#fdf6ec] border-[#faecd8] text-[#e6a23c]"; // light
      break;
    default: // default/primary blue
      if (effect === 'dark') colorStyles = "bg-[#409eff] border-[#409eff] text-white";
      else if (effect === 'plain') colorStyles = "bg-white border-[#409eff] text-[#409eff]";
      else colorStyles = "bg-[#ecf5ff] border-[#d9ecff] text-[#409eff]"; // light
      break;
  }

  return (
    <span className={cn(baseStyles, roundedStyle, colorStyles, className)}>
      {children}
    </span>
  );
};

export default Tag;
