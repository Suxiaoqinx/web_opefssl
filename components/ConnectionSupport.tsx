import React, { useMemo } from 'react';
import { Descriptions, Tag, Space, Card, Button } from 'antd';
import { ArrowRight, Info } from 'lucide-react';

interface ConnectionSupportProps {
    http: any;
    tls: any;
    onCheckUrl?: (url: string) => void;
}

type HstsInfo = 
    | { enabled: false }
    | { enabled: true; maxAge: number; includeSubDomains: boolean; preload: boolean };

const ConnectionSupport: React.FC<ConnectionSupportProps> = ({ http, tls, onCheckUrl }) => {
    const hstsInfo = useMemo<HstsInfo>(() => {
        if (!http || !http.headers) {
             return { enabled: false };
        }
        
        // Case insensitive check
        const hstsKey = Object.keys(http.headers).find(k => k.toLowerCase() === 'strict-transport-security');
        if (!hstsKey) {
            return { enabled: false };
        }
        
        const hsts = http.headers[hstsKey] as string;
        const maxAgeMatch = hsts.match(/max-age=(\d+)/i);
        const includeSubDomains = /includeSubDomains/i.test(hsts);
        const preload = /preload/i.test(hsts);

        return {
            enabled: true,
            maxAge: maxAgeMatch ? parseInt(maxAgeMatch[1]) : 0,
            includeSubDomains,
            preload
        };
    }, [http]);

    const redirectInfo = useMemo(() => {
        if (!http || !http.headers || (http.statusCode !== 301 && http.statusCode !== 302)) {
            return null;
        }
        const locationKey = Object.keys(http.headers).find(k => k.toLowerCase() === 'location');
        if (!locationKey) return null;
        
        return http.headers[locationKey];
    }, [http]);

    return (
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="状态码">
            <div className="flex flex-col gap-2 w-full">
                <div><Tag>{http.statusCode}</Tag></div>
                
                {redirectInfo && (
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-lg p-3 mt-2 border border-blue-100 dark:border-blue-900/30">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0 overflow-hidden">
                                <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mb-1">
                                    <Info size={12} className="mr-1.5" />
                                    重定向目标
                                </div>
                                <div className="text-blue-600 dark:text-blue-400 font-mono text-sm break-all leading-snug">
                                    {redirectInfo}
                                </div>
                            </div>
                            {onCheckUrl && (
                                <Button 
                                    type="primary"
                                    size="small"
                                    className="shrink-0 shadow-none bg-blue-500 hover:bg-blue-600 border-transparent"
                                    onClick={() => onCheckUrl(redirectInfo)}
                                >
                                    检测 <ArrowRight size={12} className="ml-1" />
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Descriptions.Item>
    
        <Descriptions.Item label="HTTP/1.1">
            {http.support && http.support.h1 ? (
                <Tag color="success">支持</Tag>
            ) : (
                <Tag color="default">未知</Tag>
            )}
        </Descriptions.Item>
    
        <Descriptions.Item label="HTTP/2">
            {http.support && http.support.h2 ? (
                <Tag color="success">支持</Tag>
            ) : (
                <Tag color="default">不支持</Tag>
            )}
        </Descriptions.Item>
    
        <Descriptions.Item label="HTTP/3 (QUIC)">
            {http.support && http.support.h3 ? (
                <Tag color="success">支持</Tag>
            ) : (
                <Tag color="default">不支持</Tag>
            )}
        </Descriptions.Item>
    
        <Descriptions.Item label="HSTS 支持">
            <div className="flex flex-col gap-2 w-full">
                <div>
                    <Tag color={hstsInfo.enabled ? 'success' : 'default'}>
                        {hstsInfo.enabled ? '是' : '否'}
                    </Tag>
                </div>
                
                {hstsInfo.enabled && (
                    <Card size="small" className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                        <Space orientation="vertical" style={{ width: '100%' }} size={0}>
                            <div className="flex justify-between text-xs py-0.5">
                                <span className="text-gray-400 dark:text-gray-400">最大有效期:</span>
                                <span className="text-gray-600 dark:text-white font-medium">{hstsInfo.maxAge} 秒 ({Math.round(hstsInfo.maxAge / 86400)} 天)</span>
                            </div>
                            <div className="flex justify-between text-xs py-0.5">
                                <span className="text-gray-400 dark:text-gray-400">包含子域名:</span>
                                <span className="text-gray-600 dark:text-white font-medium">{hstsInfo.includeSubDomains ? '是' : '否'}</span>
                            </div>
                            <div className="flex justify-between text-xs py-0.5">
                                <span className="text-gray-400 dark:text-gray-400">预加载 (Preload):</span>
                                <span className="text-gray-600 dark:text-white font-medium">{hstsInfo.preload ? '是' : '否'}</span>
                            </div>
                        </Space>
                    </Card>
                )}
            </div>
        </Descriptions.Item>
    
        <Descriptions.Item label="TLS 版本">
            <Tag>{tls.version}</Tag>
        </Descriptions.Item>
    
        <Descriptions.Item label="加密套件">
            <span className="text-sm text-gray-800 dark:text-white break-all font-mono">
                {tls.cipher.name} ({tls.version})
            </span>
        </Descriptions.Item>
      </Descriptions>
    );
};

export default ConnectionSupport;
