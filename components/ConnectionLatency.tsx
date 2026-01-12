import React from 'react';
import { DescriptionItem, DescriptionTable } from './ui/Descriptions';
import { cn } from '@/lib/utils';

interface Timing {
    dns: number;
    tcp: number;
    tls: number;
    ttfb: number;
    total: number;
}

interface ConnectionLatencyProps {
    timing: Timing;
}

const ConnectionLatency: React.FC<ConnectionLatencyProps> = ({ timing }) => {
    const getTimingPercent = (value: number, total: number) => {
        if (!total || total === 0) return 0;
        // Ensure small values are visible (at least 1%) if they exist
        if (value > 0 && (value / total) < 0.01) return 1;
        return (value / total) * 100;
    };

    const TimingRow = ({ label, value, colorClass }: { label: string, value: number, colorClass: string }) => (
        <DescriptionItem label={label}>
            <div className="flex items-center w-full">
                <div className="flex-1 h-2 bg-gray-100 rounded overflow-hidden mr-4 max-w-[300px]">
                    <div 
                        className={cn("h-full rounded transition-all duration-500", colorClass)}
                        style={{ width: `${getTimingPercent(value, timing.total)}%` }}
                    />
                </div>
                <span className="w-[60px] text-right text-gray-600 text-sm">{value}ms</span>
            </div>
        </DescriptionItem>
    );

    return (
        <DescriptionTable>
            <TimingRow 
                label="DNS 解析" 
                value={timing.dns} 
                colorClass="bg-blue-500" 
            />
            <TimingRow 
                label="TCP 连接" 
                value={timing.tcp} 
                colorClass="bg-yellow-500" 
            />
            <TimingRow 
                label="TLS 握手" 
                value={timing.tls} 
                colorClass="bg-purple-600" 
            />
            <TimingRow 
                label="TTFB (首字节)" 
                value={timing.ttfb} 
                colorClass="bg-green-500" 
            />
            <DescriptionItem label="总计耗时">
                <span className="text-base font-bold text-gray-800">{timing.total}ms</span>
            </DescriptionItem>
        </DescriptionTable>
    );
};

export default ConnectionLatency;
