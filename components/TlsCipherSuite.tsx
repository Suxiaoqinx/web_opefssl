import React from 'react';
import { DescriptionItem, DescriptionTable } from './ui/Descriptions';
import Tag from './ui/Tag';

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
        <DescriptionTable>
            <DescriptionItem label="当前协议版本">
                {tls.version}
            </DescriptionItem>

            <DescriptionItem label="支持的协议版本">
                {tls.supportedVersions && tls.supportedVersions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {tls.supportedVersions.map((ver) => (
                            <Tag 
                                key={ver.version}
                                type={ver.supported ? 'success' : 'info'}
                                effect={ver.supported ? 'dark' : 'plain'}
                                round
                            >
                                {formatTlsVersion(ver.version)}
                            </Tag>
                        ))}
                    </div>
                ) : (
                    <span>暂无数据</span>
                )}
            </DescriptionItem>

            <DescriptionItem label="加密套件名称">
                {tls.cipher.name}
            </DescriptionItem>

            <DescriptionItem label="标准名称">
                {tls.cipher.standardName}
            </DescriptionItem>

            <DescriptionItem label="授权状态">
                <div className="flex items-center">
                    <Tag type={tls.authorized ? 'success' : 'danger'}>
                        {tls.authorized ? 'Authorized' : 'Unauthorized'}
                    </Tag>
                    {tls.authorizationError && (
                        <span className="text-red-500 ml-2">
                            ({tls.authorizationError})
                        </span>
                    )}
                </div>
            </DescriptionItem>
        </DescriptionTable>
    );
};

export default TlsCipherSuite;
