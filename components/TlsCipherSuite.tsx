import React from 'react';
import { Descriptions, Tag } from 'antd';

interface TlsVersion {
    version: string;
    supported: boolean;
}

interface Cipher {
    name: string;
    standardName: string;
    version: string;
}

interface TlsInfo {
    version: string;
    supportedVersions?: TlsVersion[];
    cipher: Cipher;
    authorized: boolean;
    authorizationError?: string;
}

interface TlsCipherSuiteProps {
    tls: TlsInfo;
}

const TlsCipherSuite: React.FC<TlsCipherSuiteProps> = ({ tls }) => {
    const formatTlsVersion = (version: string) => {
        const map: Record<string, string> = {
            'TLSv1': 'TLS 1.0',
            'TLSv1.1': 'TLS 1.1',
            'TLSv1.2': 'TLS 1.2',
            'TLSv1.3': 'TLS 1.3'
        };
        return map[version] || version;
    };

    return (
        <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="当前协议版本">
                {tls.version}
            </Descriptions.Item>

            <Descriptions.Item label="支持的协议版本">
                {tls.supportedVersions && tls.supportedVersions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {tls.supportedVersions.map((ver) => (
                            <Tag 
                                key={ver.version}
                                color={ver.supported ? 'success' : 'default'}
                            >
                                {formatTlsVersion(ver.version)}
                            </Tag>
                        ))}
                    </div>
                ) : (
                    <span>暂无数据</span>
                )}
            </Descriptions.Item>

            <Descriptions.Item label="加密套件名称">
                <span className="break-all font-mono text-gray-800 dark:text-white">{tls.cipher.name}</span>
            </Descriptions.Item>

            <Descriptions.Item label="标准名称">
                <span className="break-all font-mono text-gray-600 dark:text-gray-300">{tls.cipher.standardName}</span>
            </Descriptions.Item>

            <Descriptions.Item label="授权状态">
                <div className="flex items-center">
                    <Tag color={tls.authorized ? 'success' : 'error'}>
                        {tls.authorized ? 'Authorized' : 'Unauthorized'}
                    </Tag>
                    {tls.authorizationError && (
                        <span className="text-red-500 ml-2">
                            ({tls.authorizationError})
                        </span>
                    )}
                </div>
            </Descriptions.Item>
        </Descriptions>
    );
};

export default TlsCipherSuite;
