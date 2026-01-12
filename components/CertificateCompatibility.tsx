import React, { useMemo } from 'react';
import { Tag, Tooltip } from 'antd';
import { Globe } from 'lucide-react';

interface CertificateCompatibilityProps {
    certificate: any;
}

interface CertCompatResult {
    platform: string;
    status: 'success' | 'fail' | 'warning';
    detail: string;
}

const CertificateCompatibility: React.FC<CertificateCompatibilityProps> = ({ certificate }) => {
    const certCompat = useMemo(() => {
        if (!certificate) return [];
        
        const results: CertCompatResult[] = [];
        const { issuer, daysRemaining } = certificate;
        
        // Handle expiration first
        if (daysRemaining <= 0) {
            const expiredMsg = '证书已过期';
            return [
                { platform: 'Windows', status: 'fail', detail: expiredMsg },
                { platform: 'macOS', status: 'fail', detail: expiredMsg },
                { platform: 'iOS', status: 'fail', detail: expiredMsg },
                { platform: 'Android', status: 'fail', detail: expiredMsg },
                { platform: 'Java', status: 'fail', detail: expiredMsg },
                { platform: 'Linux', status: 'fail', detail: expiredMsg },
            ];
        }

        // Issuer heuristics
        const issuerName = typeof issuer === 'string' ? issuer : (issuer?.O || issuer?.CN || JSON.stringify(issuer));
        const issuerStr = String(issuerName).toLowerCase();

        // Common roots logic
        let isLetsEncrypt = issuerStr.includes("let's encrypt");
        
        // Windows
        results.push({ platform: 'Windows 10/11', status: 'success', detail: '受信任的根证书' });
        results.push({ platform: 'Windows 7', status: 'success', detail: '受信任的根证书' });
        if (isLetsEncrypt) {
             results.push({ platform: 'Windows XP', status: 'fail', detail: '默认不信任 ISRG Root X1' });
        } else {
             results.push({ platform: 'Windows XP', status: 'warning', detail: '可能不兼容较新的根证书' });
        }

        // macOS
        results.push({ platform: 'macOS 10.12+', status: 'success', detail: '受信任的根证书' });
        
        // iOS
        results.push({ platform: 'iOS 10+', status: 'success', detail: '受信任的根证书' });
        
        // Android
        results.push({ platform: 'Android 7.1+', status: 'success', detail: '受信任的根证书' });
        if (isLetsEncrypt) {
             results.push({ platform: 'Android < 7.1', status: 'warning', detail: '需注意根证书兼容性' });
        } else {
             results.push({ platform: 'Android < 7.1', status: 'success', detail: '受信任的根证书' });
        }
        
        // Linux
        results.push({ platform: 'Ubuntu / Debian', status: 'success', detail: '受信任的根证书' });
        results.push({ platform: 'CentOS / RHEL', status: 'success', detail: '受信任的根证书' });

        // Java
        results.push({ platform: 'Java 8u101+', status: 'success', detail: '受信任的根证书' });
        if (isLetsEncrypt) {
             results.push({ platform: 'Java < 8u101', status: 'fail', detail: '不信任 ISRG Root X1' });
        } else {
             results.push({ platform: 'Java < 8u101', status: 'warning', detail: '可能缺乏新根证书' });
        }
        
        // Tools
        results.push({ platform: 'Python 3.6+', status: 'success', detail: '受信任的根证书' });
        results.push({ platform: 'Curl / OpenSSL 1.1+', status: 'success', detail: '受信任的根证书' });

        return results;
    }, [certificate]);

    if (!certificate) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certCompat.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-gray-800/20">
                    <div className="flex items-center gap-2 min-w-0">
                        <Globe size={14} className="text-gray-400 shrink-0" />
                        <span className="text-sm font-medium truncate">{item.platform}</span>
                    </div>
                    <div className="flex items-center shrink-0 ml-2">
                            {item.status === 'success' && (
                            <Tooltip title={item.detail}>
                                <Tag color="success" className="mr-0 flex items-center gap-1 cursor-help">
                                    兼容
                                </Tag>
                            </Tooltip>
                        )}
                        {item.status === 'warning' && (
                            <Tooltip title={item.detail}>
                                <Tag color="warning" className="mr-0 flex items-center gap-1 cursor-help">
                                    部分兼容
                                </Tag>
                            </Tooltip>
                        )}
                        {item.status === 'fail' && (
                            <Tooltip title={item.detail}>
                                <Tag color="error" className="mr-0 flex items-center gap-1 cursor-help">
                                    不兼容
                                </Tag>
                            </Tooltip>
                        )}
                    </div>
                    </div>
            ))}
        </div>
    );
};

export default CertificateCompatibility;
