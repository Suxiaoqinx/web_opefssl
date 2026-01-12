import React from 'react';
import { DescriptionItem, DescriptionTable } from './ui/Descriptions';
import Tag from './ui/Tag';

interface Certificate {
    subject: Record<string, string>;
    issuer: Record<string, string>;
    valid_from: string;
    valid_to: string;
    serialNumber: string;
    fingerprint: string;
}

interface CertificateDetailsProps {
    certificate: Certificate;
}

const CertificateDetails: React.FC<CertificateDetailsProps> = ({ certificate }) => {
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleString();
    };

    return (
        <DescriptionTable>
            <DescriptionItem label="颁发给 (Subject)">
                <div className="flex flex-wrap gap-2">
                    {certificate.subject && Object.entries(certificate.subject).map(([key, val]) => (
                        <Tag key={key} effect="light">
                            {key}: {val}
                        </Tag>
                    ))}
                </div>
            </DescriptionItem>
            <DescriptionItem label="颁发者 (Issuer)">
                <div className="flex flex-wrap gap-2">
                    {certificate.issuer && Object.entries(certificate.issuer).map(([key, val]) => (
                        <Tag key={key} type="info" effect="plain">
                            {key}: {val}
                        </Tag>
                    ))}
                </div>
            </DescriptionItem>
            <DescriptionItem label="有效期开始">
                {formatDate(certificate.valid_from)}
            </DescriptionItem>
            <DescriptionItem label="有效期结束">
                {formatDate(certificate.valid_to)}
            </DescriptionItem>
            <DescriptionItem label="序列号">
                {certificate.serialNumber}
            </DescriptionItem>
            <DescriptionItem label="指纹">
                {certificate.fingerprint}
            </DescriptionItem>
        </DescriptionTable>
    );
};

export default CertificateDetails;
