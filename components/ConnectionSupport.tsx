import React, { useMemo } from 'react';
import { DescriptionTable, DescriptionItem } from './ui/Descriptions';
import { Tag } from './ui/Tag';

interface ConnectionSupportProps {
    http: any;
    tls: any;
}

type HstsInfo = 
    | { enabled: false }
    | { enabled: true; maxAge: number; includeSubDomains: boolean; preload: boolean };

const ConnectionSupport: React.FC<ConnectionSupportProps> = ({ http, tls }) => {
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

    return (
      <DescriptionTable>
        <DescriptionItem label="状态码">
            <Tag effect="light" round>{http.statusCode}</Tag>
        </DescriptionItem>
    
        <DescriptionItem label="HTTP/1.1">
            {http.support && http.support.h1 ? (
                <Tag type="success" effect="dark" round>支持</Tag>
            ) : (
                <Tag type="info" effect="plain" round>未知</Tag>
            )}
        </DescriptionItem>
    
        <DescriptionItem label="HTTP/2">
            {http.support && http.support.h2 ? (
                <Tag type="success" effect="dark" round>支持</Tag>
            ) : (
                <Tag type="info" effect="plain" round>不支持</Tag>
            )}
        </DescriptionItem>
    
        <DescriptionItem label="HTTP/3 (QUIC)">
            {http.support && http.support.h3 ? (
                <Tag type="success" effect="dark" round>支持</Tag>
            ) : (
                <Tag type="info" effect="plain" round>不支持</Tag>
            )}
        </DescriptionItem>
    
        <DescriptionItem label="HSTS 支持">
            <div className="flex flex-col gap-2 w-full">
                <div>
                    <Tag type={hstsInfo.enabled ? 'success' : 'info'} effect="dark" round>
                        {hstsInfo.enabled ? '是' : '否'}
                    </Tag>
                </div>
                
                {hstsInfo.enabled && (
                    <div className="bg-gray-50 p-2 rounded border border-gray-200 w-full">
                        <div className="flex justify-between text-xs py-0.5">
                            <span className="text-gray-400">最大有效期:</span>
                            <span className="text-gray-600 font-medium">{hstsInfo.maxAge} 秒 ({Math.round(hstsInfo.maxAge / 86400)} 天)</span>
                        </div>
                        <div className="flex justify-between text-xs py-0.5">
                            <span className="text-gray-400">包含子域名:</span>
                            <span className="text-gray-600 font-medium">{hstsInfo.includeSubDomains ? '是' : '否'}</span>
                        </div>
                        <div className="flex justify-between text-xs py-0.5">
                            <span className="text-gray-400">预加载 (Preload):</span>
                            <span className="text-gray-600 font-medium">{hstsInfo.preload ? '是' : '否'}</span>
                        </div>
                    </div>
                )}
            </div>
        </DescriptionItem>
    
        <DescriptionItem label="TLS 版本">
            <Tag effect="plain" round>{tls.version}</Tag>
        </DescriptionItem>
    
        <DescriptionItem label="加密套件">
            <span className="text-sm text-gray-800 break-all">
                {tls.cipher.name} ({tls.version})
            </span>
        </DescriptionItem>
      </DescriptionTable>
    );
};

export default ConnectionSupport;
