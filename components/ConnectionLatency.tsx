import React from 'react';
import { Descriptions, Progress } from 'antd';

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

    return (
        <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="DNS 解析">
                <div className="flex items-center w-full">
                    <div className="flex-1 mr-4 max-w-[300px]">
                        <Progress 
                            percent={getTimingPercent(timing.dns, timing.total)} 
                            showInfo={false} 
                            strokeColor="#1890ff"
                            size="small"
                            status="active"
                        />
                    </div>
                    <span className="w-[60px] text-right text-gray-600 dark:text-gray-400 text-sm">{timing.dns}ms</span>
                </div>
            </Descriptions.Item>
            
            <Descriptions.Item label="TCP 连接">
                <div className="flex items-center w-full">
                    <div className="flex-1 mr-4 max-w-[300px]">
                        <Progress 
                            percent={getTimingPercent(timing.tcp, timing.total)} 
                            showInfo={false} 
                            strokeColor="#faad14"
                            size="small"
                            status="active"
                        />
                    </div>
                    <span className="w-[60px] text-right text-gray-600 dark:text-gray-400 text-sm">{timing.tcp}ms</span>
                </div>
            </Descriptions.Item>

            <Descriptions.Item label="TLS 握手">
                <div className="flex items-center w-full">
                    <div className="flex-1 mr-4 max-w-[300px]">
                        <Progress 
                            percent={getTimingPercent(timing.tls, timing.total)} 
                            showInfo={false} 
                            strokeColor="#722ed1"
                            size="small"
                            status="active"
                        />
                    </div>
                    <span className="w-[60px] text-right text-gray-600 dark:text-gray-400 text-sm">{timing.tls}ms</span>
                </div>
            </Descriptions.Item>

            <Descriptions.Item label="TTFB (首字节)">
                <div className="flex items-center w-full">
                    <div className="flex-1 mr-4 max-w-[300px]">
                        <Progress 
                            percent={getTimingPercent(timing.ttfb, timing.total)} 
                            showInfo={false} 
                            strokeColor="#52c41a"
                            size="small"
                            status="active"
                        />
                    </div>
                    <span className="w-[60px] text-right text-gray-600 dark:text-gray-400 text-sm">{timing.ttfb}ms</span>
                </div>
            </Descriptions.Item>

            <Descriptions.Item label="总计耗时">
                <span className="text-base font-bold text-gray-800 dark:text-gray-200">{timing.total}ms</span>
            </Descriptions.Item>
        </Descriptions>
    );
};

export default ConnectionLatency;
