import React from 'react';
import { cn } from '@/lib/utils';

export const Card = ({ title, children, className }: { title?: React.ReactNode, children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col", className)}>
    {title && (
      <div className="px-5 py-4 border-b border-gray-200">
        <div className="text-base font-bold text-gray-900">{title}</div>
      </div>
    )}
    <div className="p-5 flex-grow">
      {children}
    </div>
  </div>
);
