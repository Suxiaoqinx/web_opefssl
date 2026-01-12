import React, { useMemo } from 'react';
import { Tag } from 'antd';
import { Monitor, Smartphone, Terminal, Bot } from 'lucide-react';

interface ClientHandshakeSimulationProps {
    tls: any;
}

interface ClientResult {
    name: string;
    icon: React.ReactNode;
    status: 'success' | 'fail' | 'warning'; // warning could be for old protocols
    protocol?: string;
}

const ClientHandshakeSimulation: React.FC<ClientHandshakeSimulationProps> = ({ tls }) => {
    const results = useMemo(() => {
        if (!tls || !tls.supportedVersions) return [];

        const versions = new Set(tls.supportedVersions.filter((v: any) => v.supported).map((v: any) => v.version));
        const hasTls13 = versions.has('TLSv1.3');
        const hasTls12 = versions.has('TLSv1.2');
        const hasTls11 = versions.has('TLSv1.1');
        const hasTls10 = versions.has('TLSv1');
        const hasSsl3 = versions.has('SSLv3');

        const clients: ClientResult[] = [];

        // Modern Browsers (Chrome, Firefox, Edge, Safari)
        // They prioritize 1.3, fallback to 1.2. If neither, they fail (mostly).
        const modernStatus = hasTls13 ? 'success' : (hasTls12 ? 'success' : 'fail');
        const modernProtocol = hasTls13 ? 'TLS 1.3' : (hasTls12 ? 'TLS 1.2' : '');
        
        clients.push({ name: 'Chrome 100+ (Win 10)', icon: <Monitor size={14} />, status: modernStatus, protocol: modernProtocol });
        clients.push({ name: 'Firefox 100+ (Win 10)', icon: <Monitor size={14} />, status: modernStatus, protocol: modernProtocol });
        clients.push({ name: 'Edge (Win 10)', icon: <Monitor size={14} />, status: modernStatus, protocol: modernProtocol });
        clients.push({ name: 'Safari 16+ (macOS)', icon: <Monitor size={14} />, status: modernStatus, protocol: modernProtocol });

        // IE 11 (Win 10) - TLS 1.2
        if (hasTls12) {
            clients.push({ name: 'IE 11 (Win 10)', icon: <Monitor size={14} />, status: 'success', protocol: 'TLS 1.2' });
        } else {
            clients.push({ name: 'IE 11 (Win 10)', icon: <Monitor size={14} />, status: 'fail' });
        }

        // IE 8-10 (Win 7) - TLS 1.0 (default)
        if (hasTls10) {
            clients.push({ name: 'IE 8-10 (Win 7)', icon: <Monitor size={14} />, status: 'warning', protocol: 'TLS 1.0' });
        } else {
            clients.push({ name: 'IE 8-10 (Win 7)', icon: <Monitor size={14} />, status: 'fail' });
        }

        // IE 6 (Win XP) - TLS 1.0 or SSLv3
        if (hasTls10) {
            clients.push({ name: 'IE 6 (XP)', icon: <Monitor size={14} />, status: 'warning', protocol: 'TLS 1.0' });
        } else if (hasSsl3) {
            clients.push({ name: 'IE 6 (XP)', icon: <Monitor size={14} />, status: 'warning', protocol: 'SSL 3.0' });
        } else {
            clients.push({ name: 'IE 6 (XP)', icon: <Monitor size={14} />, status: 'fail' });
        }

        // Mobile
        // iOS 15+ -> Modern
        clients.push({ name: 'iOS 15+ (Safari)', icon: <Smartphone size={14} />, status: modernStatus, protocol: modernProtocol });
        
        // Android 10 -> Modern
        clients.push({ name: 'Android 10', icon: <Smartphone size={14} />, status: modernStatus, protocol: modernProtocol });

        // Android 7.0 -> TLS 1.2
        if (hasTls12) {
            clients.push({ name: 'Android 7.0', icon: <Smartphone size={14} />, status: 'success', protocol: 'TLS 1.2' });
        } else {
            clients.push({ name: 'Android 7.0', icon: <Smartphone size={14} />, status: 'fail' });
        }

        // Android 6.0 -> TLS 1.2
        if (hasTls12) {
            clients.push({ name: 'Android 6.0', icon: <Smartphone size={14} />, status: 'success', protocol: 'TLS 1.2' });
        } else {
             clients.push({ name: 'Android 6.0', icon: <Smartphone size={14} />, status: 'fail' });
        }

        // Android 4.4.2 -> TLS 1.2/1.1/1.0
        if (hasTls12) {
             clients.push({ name: 'Android 4.4.2', icon: <Smartphone size={14} />, status: 'success', protocol: 'TLS 1.2' });
        } else if (hasTls11) {
             clients.push({ name: 'Android 4.4.2', icon: <Smartphone size={14} />, status: 'warning', protocol: 'TLS 1.1' });
        } else if (hasTls10) {
             clients.push({ name: 'Android 4.4.2', icon: <Smartphone size={14} />, status: 'warning', protocol: 'TLS 1.0' });
        } else {
             clients.push({ name: 'Android 4.4.2', icon: <Smartphone size={14} />, status: 'fail' });
        }

        // Android 2.3.7 -> TLS 1.0
        if (hasTls10) {
             clients.push({ name: 'Android 2.3.7', icon: <Smartphone size={14} />, status: 'warning', protocol: 'TLS 1.0' });
        } else {
             clients.push({ name: 'Android 2.3.7', icon: <Smartphone size={14} />, status: 'fail' });
        }

        // Bots / Tools
        // Java 8 -> TLS 1.2
        if (hasTls12) {
             clients.push({ name: 'Java 8', icon: <Terminal size={14} />, status: 'success', protocol: 'TLS 1.2' });
        } else {
             clients.push({ name: 'Java 8', icon: <Terminal size={14} />, status: 'fail' });
        }

        // Java 6/7 -> TLS 1.0 default
        if (hasTls10) {
            clients.push({ name: 'Java 6/7', icon: <Terminal size={14} />, status: 'warning', protocol: 'TLS 1.0' });
        } else {
            clients.push({ name: 'Java 6/7', icon: <Terminal size={14} />, status: 'fail' });
        }

        // Python 3.8+ -> Modern
        clients.push({ name: 'Python 3.8+', icon: <Terminal size={14} />, status: modernStatus, protocol: modernProtocol });

        // OpenSSL 1.0.2 -> TLS 1.2
        if (hasTls12) {
            clients.push({ name: 'OpenSSL 1.0.2', icon: <Terminal size={14} />, status: 'success', protocol: 'TLS 1.2' });
        } else {
            clients.push({ name: 'OpenSSL 1.0.2', icon: <Terminal size={14} />, status: 'fail' });
        }

        // GoogleBot
        clients.push({ name: 'GoogleBot', icon: <Bot size={14} />, status: modernStatus, protocol: modernProtocol });

        // BingBot -> TLS 1.3/1.2
        clients.push({ name: 'BingBot', icon: <Bot size={14} />, status: modernStatus, protocol: modernProtocol });

        // BaiduSpider -> TLS 1.2
        if (hasTls12) {
            clients.push({ name: 'BaiduSpider', icon: <Bot size={14} />, status: 'success', protocol: 'TLS 1.2' });
        } else if (hasTls10) {
            clients.push({ name: 'BaiduSpider', icon: <Bot size={14} />, status: 'warning', protocol: 'TLS 1.0' });
        } else {
            clients.push({ name: 'BaiduSpider', icon: <Bot size={14} />, status: 'fail' });
        }

        return clients;
    }, [tls]);

    if (!tls || !tls.supportedVersions) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.map((client, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-gray-800/20">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="text-gray-400 shrink-0">
                                {client.icon}
                            </div>
                            <span className="text-sm font-medium truncate" title={client.name}>
                                {client.name}
                            </span>
                        </div>
                        <div className="flex items-center shrink-0 ml-2">
                            {client.status === 'success' && (
                                <Tag color="success" className="mr-0 flex items-center gap-1">
                                    {client.protocol}
                                </Tag>
                            )}
                            {client.status === 'warning' && (
                                <Tag color="warning" className="mr-0 flex items-center gap-1">
                                    {client.protocol}
                                </Tag>
                            )}
                            {client.status === 'fail' && (
                                <Tag color="error" className="mr-0">
                                    失败
                                </Tag>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClientHandshakeSimulation;
