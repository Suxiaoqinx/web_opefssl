'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Clock, Trash2, Github, MapPin } from 'lucide-react';
import { Input, Button, Card, Alert, Row, Col, Typography, Space, message, Select, Spin, notification, Tabs } from 'antd';
import SiteInfo from '@/components/SiteInfo';
import ConnectionSupport from '@/components/ConnectionSupport';
import ConnectionLatency from '@/components/ConnectionLatency';
import CertificateDetails from '@/components/CertificateDetails';
import TlsCipherSuite from '@/components/TlsCipherSuite';
import HttpHeaders from '@/components/HttpHeaders';
import ClientHandshakeSimulation from '@/components/ClientHandshakeSimulation';
import CertificateCompatibility from '@/components/CertificateCompatibility';
import ClientInfo from '@/components/ClientInfo';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/components/ThemeProvider';

const { Title, Text } = Typography;
const { Search } = Input;

// Types
interface CheckResult {
  site: any;
  http: any;
  tls: any;
  certificate: any;
  timing: any;
}

const commonSites = [
  { name: 'Cloudflare', url: 'www.cloudflare.com' },
  { name: 'Google', url: 'www.google.com' },
  { name: 'Bing', url: 'www.bing.com' },
  { name: 'Baidu', url: 'www.baidu.com' },
  { name: 'Bilibili', url: 'www.bilibili.com' },
  { name: 'Github', url: 'github.com' },
  { name: 'Pixiv', url: 'www.pixiv.net' },
];

const apiNodes = [
  { label: '海外节点', value: 'https://http-vercel.toubiec.cn' },
  { label: '国内节点', value: 'https://http.toubiec.cn' },
  { label: '本地节点', value: '' },
];

export default function Home() {
  const { layoutMode } = useTheme();
  const [notificationApi, contextHolder] = notification.useNotification();
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [nodeInfo, setNodeInfo] = useState<any>(null);
  const [nodeLoading, setNodeLoading] = useState(true);
  const [apiNode, setApiNode] = useState('');

  useEffect(() => {
    const savedHistory = localStorage.getItem('tls_check_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // Fetch node info when apiNode changes
  useEffect(() => {
    const fetchNodeInfo = async () => {
      setNodeLoading(true);
      try {
        const timestamp = Date.now();
        const secret = 'wyyapi-salt-2026';
        const str = `${timestamp}${secret}`;
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const res = await axios.post(`${apiNode}/api/node-info`, { timestamp, hash });
        setNodeInfo(res.data);
      } catch (err) {
        console.error('Failed to fetch node info', err);
        setNodeInfo(null);
      } finally {
        setNodeLoading(false);
      }
    };
    
    fetchNodeInfo();
  }, [apiNode]);

  const addToHistory = (url: string) => {
    const newHistory = [...history];
    const index = newHistory.indexOf(url);
    if (index > -1) {
      newHistory.splice(index, 1);
    }
    newHistory.unshift(url);
    if (newHistory.length > 10) {
      newHistory.pop();
    }
    setHistory(newHistory);
    localStorage.setItem('tls_check_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('tls_check_history');
  };

  const fillAndCheck = (url: string) => {
    setTargetUrl(url);
    checkUrl(url);
  };

  const checkUrl = async (urlOverride?: string) => {
    // If urlOverride is a string, use it; otherwise use targetUrl
    // Note: antd Search onSearch passes value as first arg
    let urlToCheck = (typeof urlOverride === 'string' ? urlOverride : targetUrl).trim();
    
    if (!urlToCheck) {
      // Antd message could be used here but we'll stick to Alert for now or just return
      return;
    }

    // Ensure HTTPS
    if (!urlToCheck.startsWith('http://') && !urlToCheck.startsWith('https://')) {
      urlToCheck = 'https://' + urlToCheck;
    }

    setTargetUrl(urlToCheck);
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const timestamp = Date.now();
      const secret = 'wyyapi-salt-2026';
      const str = `${urlToCheck}${timestamp}${secret}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const [response] = await Promise.all([
        axios.post(`${apiNode}/api/check`, {
          url: urlToCheck,
          timestamp,
          hash
        }),
        new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 2000) + 1000))
      ]);

      setResult(response.data);
      addToHistory(urlToCheck);

      notificationApi.success({
        message: '检测完成',
        description: '已成功获取目标站点信息',
        placement: 'topRight',
        duration: 3,
      });

    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('检测失败，请检查服务是否运行或网络连接');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-5 font-sans transition-colors duration-300">
      {contextHolder}
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-10 relative">
          <Title level={1} style={{ marginBottom: 8 }}>网站安全检测工具</Title>
          <Text type="secondary" className="text-base">即时分析 HTTP 版本、TLS 支持和证书详情。</Text>
          
          {(nodeInfo || nodeLoading) && (
            <div className="mt-4 px-4 flex justify-center items-start sm:items-center text-gray-500 text-sm animate-pulse">
               <MapPin size={14} className="mr-1.5 text-blue-500 shrink-0 mt-1 sm:mt-0" />
               <span className="text-left sm:text-center break-words leading-tight">
                 {nodeLoading ? (
                   '正在获取探测节点信息...'
                 ) : (
                   `探测节点: ${nodeInfo.country} ${nodeInfo.regionName} ${nodeInfo.city}`
                 )}
               </span>
            </div>
          )}
        </div>

        {/* Search Card */}
        <Card className="mb-5 shadow-sm" variant="borderless">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
            <div>
              <Title level={4} style={{ margin: 0, marginBottom: 4 }}>输入网站 URL</Title>
              <Text type="secondary" className="text-sm">必须包含 http:// 或 https://，且不跟随重定向</Text>
            </div>
            <Select
              value={apiNode}
              onChange={setApiNode}
              options={apiNodes}
              style={{ width: 260 }}
              placeholder="选择检测节点"
            />
          </div>
          
          <div className="mb-5">
             <Search
                placeholder="https://example.com"
                enterButton={loading ? "检测中..." : "开始检测"}
                size="large"
                loading={loading}
                onSearch={checkUrl}
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
             />
          </div>

          <div className="mt-4">
            <Text type="secondary" className="text-sm mb-2 block">常用检测</Text>
            <Space wrap>
              {commonSites.map((site) => (
                <Button 
                  key={site.url}
                  onClick={() => fillAndCheck(site.url)}
                  size="small"
                >
                  {site.name}
                </Button>
              ))}
            </Space>
          </div>

          {history.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-gray-400 text-sm flex items-center">
                    <Clock size={14} className="mr-1" /> 历史记录
                 </span>
                 <Button 
                    type="text" 
                    danger 
                    size="small" 
                    icon={<Trash2 size={14} />} 
                    onClick={clearHistory}
                 >
                    清空
                 </Button>
              </div>
              <Space wrap>
                {history.map((url) => (
                  <Button 
                    key={url}
                    onClick={() => fillAndCheck(url)}
                    size="small"
                  >
                    {url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </Button>
                ))}
              </Space>
            </div>
          )}
        </Card>

        {/* Client Info */}
        <div className="mb-5 mt-5">
          <ClientInfo />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-5">
             <Card className="shadow-sm text-center py-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <Spin size="large" />
                <div className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-200">正在全面检测中...</div>
                <div className="mt-2 text-gray-500 dark:text-gray-400">正在分析目标站点的 HTTPS 配置、证书详情及客户端兼容性</div>
             </Card>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert
            message="检测失败"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError('')}
            className="mb-5"
          />
        )}

        {/* Results Grid */}
        {result && (
          <div className="mt-5">
            {layoutMode === 'grid' ? (
              <Row gutter={[20, 20]}>
                {/* Row 1 */}
                <Col xs={24} md={12}>
                  <Card title="站点信息" variant="borderless" className="h-full shadow-sm">
                    <SiteInfo site={result.site} target={result.site.title || targetUrl} />
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="连接支持" variant="borderless" className="h-full shadow-sm">
                    <ConnectionSupport http={result.http} tls={result.tls} onCheckUrl={fillAndCheck} />
                  </Card>
                </Col>

                {/* Row 2 */}
                <Col xs={24} md={12}>
                  <Card title="连接耗时" variant="borderless" className="h-full shadow-sm">
                    <ConnectionLatency timing={result.timing} />
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="TLS/加密套件" variant="borderless" className="h-full shadow-sm">
                    <TlsCipherSuite tls={result.tls} />
                  </Card>
                </Col>

                {/* Row 3 */}
                <Col xs={24} md={12}>
                  <Card title="证书详情" variant="borderless" className="h-full shadow-sm">
                    <CertificateDetails certificate={result.certificate} />
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card title="HTTP 头部" variant="borderless" className="h-full shadow-sm">
                    <HttpHeaders headers={result.http.headers} />
                  </Card>
                </Col>

                {/* Row 4: Client Simulation */}
                <Col xs={24}>
                  <Card title="客户端握手模拟测试" variant="borderless" className="h-full shadow-sm">
                    <ClientHandshakeSimulation tls={result.tls} />
                  </Card>
                </Col>

                {/* Row 5: Certificate Compatibility */}
                <Col xs={24}>
                  <Card title="证书兼容性测试 (基于根证书)" variant="borderless" className="h-full shadow-sm">
                    <CertificateCompatibility certificate={result.certificate} />
                  </Card>
                </Col>
              </Row>
            ) : (
              <Card className="shadow-sm" bodyStyle={{ padding: '0' }}>
                <Tabs
                  defaultActiveKey="overview"
                  size="large"
                  tabBarStyle={{ padding: '0 24px', marginBottom: 0 }}
                  items={[
                    {
                      label: '概览',
                      key: 'overview',
                      children: (
                        <div className="p-6 bg-gray-50 dark:bg-gray-900/30" style={{ padding: '24px' }}>
                          <Row gutter={[20, 20]}>
                            <Col xs={24} md={12}>
                              <Card title="站点信息" variant="borderless" className="h-full shadow-sm">
                                <SiteInfo site={result.site} target={result.site.title || targetUrl} />
                              </Card>
                            </Col>
                            <Col xs={24} md={12}>
                              <Card title="连接支持" variant="borderless" className="h-full shadow-sm">
                                <ConnectionSupport http={result.http} tls={result.tls} onCheckUrl={fillAndCheck} />
                              </Card>
                            </Col>
                          </Row>
                        </div>
                      )
                    },
                    {
                      label: '性能',
                      key: 'performance',
                      children: (
                         <div className="p-6 bg-gray-50 dark:bg-gray-900/30" style={{ padding: '24px' }}>
                          <Row gutter={[20, 20]}>
                            <Col xs={24} md={12}>
                              <Card title="连接耗时" variant="borderless" className="h-full shadow-sm">
                                <ConnectionLatency timing={result.timing} />
                              </Card>
                            </Col>
                            <Col xs={24} md={12}>
                              <Card title="HTTP 头部" variant="borderless" className="h-full shadow-sm">
                                <HttpHeaders headers={result.http.headers} />
                              </Card>
                            </Col>
                          </Row>
                        </div>
                      )
                    },
                    {
                      label: '证书安全',
                      key: 'security',
                      children: (
                         <div className="p-6 bg-gray-50 dark:bg-gray-900/30" style={{ padding: '24px' }}>
                          <Row gutter={[20, 20]}>
                            <Col xs={24} md={12}>
                              <Card title="TLS/加密套件" variant="borderless" className="h-full shadow-sm">
                                <TlsCipherSuite tls={result.tls} />
                              </Card>
                            </Col>
                            <Col xs={24} md={12}>
                              <Card title="证书详情" variant="borderless" className="h-full shadow-sm">
                                <CertificateDetails certificate={result.certificate} />
                              </Card>
                            </Col>
                          </Row>
                        </div>
                      )
                    },
                    {
                      label: '兼容性测试',
                      key: 'compatibility',
                      children: (
                         <div className="p-6 bg-gray-50 dark:bg-gray-900/30" style={{ padding: '24px' }}>
                          <Row gutter={[20, 20]}>
                            <Col span={24}>
                              <Card title="客户端握手模拟测试" variant="borderless" className="shadow-sm">
                                <ClientHandshakeSimulation tls={result.tls} />
                              </Card>
                            </Col>
                            <Col span={24}>
                              <Card title="证书兼容性测试 (基于根证书)" variant="borderless" className="shadow-sm">
                                <CertificateCompatibility certificate={result.certificate} />
                              </Card>
                            </Col>
                          </Row>
                        </div>
                      )
                    }
                  ]}
                />
              </Card>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pb-8 text-gray-400 text-sm border-t border-gray-200 dark:border-gray-800 pt-5">
          <p className="mb-2">&copy; {new Date().getFullYear()} 网站安全检测工具. All rights reserved.</p>
          <div className="flex justify-center items-center gap-4">
            <a href="https://github.com/Suxiaoqinx/web_opefssl" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-500 transition-colors">
              <Github size={14} className="mr-1" />
              开源项目
            </a>
            <span className="border-l border-gray-300 dark:border-gray-700 h-3 mx-1"></span>
            <a href="https://github.com/Suxiaoqinx" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-500 transition-colors">
              <User size={14} className="mr-1" />
              作者主页
            </a>
          </div>
          <div className="mt-2 text-xs opacity-75">
             <span className="mr-3">Version 0.2.0</span>
             <span>当前节点: {apiNodes.find(n => n.value === apiNode)?.label || '未知节点'}</span>
          </div>
        </div>
      </div>
      <ThemeToggle />
    </div>
  );
}
