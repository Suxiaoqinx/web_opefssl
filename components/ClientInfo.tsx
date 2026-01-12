import React, { useEffect, useState } from 'react';
import { Card, Skeleton } from 'antd';
import { Monitor, Cpu } from 'lucide-react';
import { UAParser } from 'ua-parser-js';

const ClientInfo: React.FC = () => {
    const [ua, setUa] = useState<string>('');
    const [os, setOs] = useState<string>('Detecting...');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setUa(navigator.userAgent);
        
        const detectOS = async () => {
            const parser = new UAParser(navigator.userAgent);
            const result = parser.getResult();
            
            let detectedOS = `${result.os.name || 'Unknown OS'} ${result.os.version || ''}`.trim();
            
            // Special handling for Windows 11 using Client Hints
            if (result.os.name === 'Windows') {
                // Check for User-Agent Client Hints
                if ((navigator as any).userAgentData) {
                    try {
                        const uaData = await (navigator as any).userAgentData.getHighEntropyValues(['platformVersion']);
                        if (uaData.platform === 'Windows') {
                            const majorVersion = parseInt(uaData.platformVersion.split('.')[0]);
                            // Windows 11 corresponds to platformVersion >= 13.0.0
                            if (majorVersion >= 13) {
                                detectedOS = 'Windows 11';
                            } else {
                                // Keep parser result or refine if needed
                                if (detectedOS === 'Windows 10' && majorVersion < 13) {
                                    detectedOS = 'Windows 10';
                                }
                            }
                        }
                    } catch (e) {
                        // Ignore error, fallback to parser result
                    }
                }
            }

            setOs(detectedOS);
            setLoading(false);
        };

        detectOS();
    }, []);

    return (
        <Card size="small" className="shadow-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex items-center gap-3 shrink-0">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                        <Monitor size={20} />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">您的操作系统</div>
                        <div className="font-bold text-base text-gray-800 dark:text-gray-100">
                            {loading ? <Skeleton.Input active size="small" style={{ width: 100, height: 20 }} /> : os}
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full md:w-auto min-w-0 md:border-l md:border-gray-100 md:dark:border-gray-700 md:pl-4">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Cpu size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">浏览器 User Agent</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 font-mono break-all leading-relaxed">
                        {ua || 'Loading...'}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ClientInfo;
