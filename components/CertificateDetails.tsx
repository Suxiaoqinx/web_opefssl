import React from 'react';
import { Descriptions, Tag } from 'antd';

interface Certificate {
    subject: Record<string, string>;
    issuer: Record<string, string>;
    valid_from: string;
    valid_to: string;
    serialNumber: string;
    fingerprint: string;
    sanCount?: number;
    sans?: string[];
}

interface CertificateDetailsProps {
    certificate: Certificate;
}

const CertificateDetails: React.FC<CertificateDetailsProps> = ({ certificate }) => {
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleString();
    };

    const getRemainingDays = (dateStr: string) => {
        if (!dateStr) return null;
        const validTo = new Date(dateStr).getTime();
        const now = new Date().getTime();
        const diff = validTo - now;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const remainingDays = getRemainingDays(certificate.valid_to);

    return (
        <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="子域名数量">
                <Tag color="purple">{certificate.sanCount || 0} 个</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="颁发给 (Subject)">
                <div className="flex flex-wrap gap-2">
                    {certificate.subject && Object.entries(certificate.subject).map(([key, val]) => (
                        <Tag key={key} color="blue" className="py-1" style={{ whiteSpace: 'normal', wordBreak: 'break-all', height: 'auto' }}>
                            {key}: {val}
                        </Tag>
                    ))}
                </div>
            </Descriptions.Item>
            <Descriptions.Item label="颁发者 (Issuer)">
                <div className="flex flex-wrap gap-2">
                    {certificate.issuer && Object.entries(certificate.issuer).map(([key, val]) => (
                        <Tag key={key} className="py-1" style={{ whiteSpace: 'normal', wordBreak: 'break-all', height: 'auto' }}>
                            {key}: {val}
                        </Tag>
                    ))}
                </div>
            </Descriptions.Item>
            <Descriptions.Item label="有效期开始">
                {formatDate(certificate.valid_from)}
            </Descriptions.Item>
            <Descriptions.Item label="有效期结束">
                {formatDate(certificate.valid_to)}
            </Descriptions.Item>
            {remainingDays !== null && (
                <Descriptions.Item label="剩余天数">
                    <Tag color={remainingDays > 30 ? 'success' : remainingDays > 7 ? 'warning' : 'error'}>
                        {remainingDays > 0 ? `${remainingDays} 天` : `已过期 ${Math.abs(remainingDays)} 天`}
                    </Tag>
                </Descriptions.Item>
            )}
            <Descriptions.Item label="序列号">
                <span style={{ wordBreak: 'break-all' }}>{certificate.serialNumber}</span>
            </Descriptions.Item>
            <Descriptions.Item label="指纹">
                <span style={{ wordBreak: 'break-all' }}>{certificate.fingerprint}</span>
            </Descriptions.Item>
        </Descriptions>
    );
};

export default CertificateDetails;
