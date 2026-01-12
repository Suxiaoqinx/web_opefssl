import React from 'react';
import { cn } from '@/lib/utils';

export const DescriptionItem = ({ label, children, className }: { label: string, children: React.ReactNode, className?: string }) => (
  <div className={cn("flex border-b border-gray-200 last:border-b-0", className)}>
    <div className="w-[150px] bg-gray-50 p-3 text-sm font-bold text-gray-600 flex-shrink-0 border-r border-gray-200 flex items-center">
      {label}
    </div>
    <div className="p-3 text-sm text-gray-800 flex-grow flex items-center break-all">
      {children}
    </div>
  </div>
);

export const DescriptionTable = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("border border-gray-200 rounded-sm overflow-hidden bg-white", className)}>
    {children}
  </div>
);
