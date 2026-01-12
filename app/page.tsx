'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Clock, Trash2, Search, Github, Globe, FileText } from 'lucide-react';
import SiteInfo from '@/components/SiteInfo';
import ConnectionSupport from '@/components/ConnectionSupport';
import ConnectionLatency from '@/components/ConnectionLatency';
import CertificateDetails from '@/components/CertificateDetails';
import TlsCipherSuite from '@/components/TlsCipherSuite';
import HttpHeaders from '@/components/HttpHeaders';
import { Card } from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';

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

export default function Home() {
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>([]);

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
    // Use setTimeout to allow state update before checking (though not strictly needed if we pass url to checkUrl)
    // But better to call checkUrl with the value directly
    checkUrl(url);
  };

  const checkUrl = async (urlOverride?: string) => {
    let urlToCheck = (urlOverride || targetUrl).trim();
    if (!urlToCheck) {
      // Could use a toast here
      alert('请输入目标网址');
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
      const response = await axios.get(`/api/check?url=${encodeURIComponent(urlToCheck)}`);
      setResult(response.data);
      addToHistory(urlToCheck);
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
    <div className="min-h-screen bg-[#f5f7fa] p-5 font-sans">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">网站安全检测工具</h1>
          <p className="text-base text-slate-500">即时分析 HTTP 版本、TLS 支持和证书详情。</p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-5">
          <div className="mb-5">
            <h3 className="text-lg font-bold m-0 mb-1">输入网站 URL</h3>
            <p className="text-gray-400 text-sm">必须包含 http:// 或 https://，且不跟随重定向</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
                <input 
                    type="text" 
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && checkUrl()}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-10"
                />
            </div>
            <button 
                onClick={() => checkUrl()}
                disabled={loading}
                className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-6 rounded h-10 transition-colors disabled:opacity-70 flex items-center justify-center min-w-[100px]"
            >
                {loading ? '检测中...' : '开始检测'}
            </button>
          </div>

          <div className="mt-4">
            <p className="text-gray-400 text-sm mb-2 flex items-center">常用检测</p>
            <div className="flex flex-wrap gap-2">
              {commonSites.map((site) => (
                <button 
                  key={site.url}
                  onClick={() => fillAndCheck(site.url)}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-600 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  {site.name}
                </button>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-gray-400 text-sm flex items-center">
                    <Clock size={14} className="mr-1" /> 历史记录
                 </span>
                 <button 
                    onClick={clearHistory}
                    className="text-gray-400 text-sm hover:text-red-500 flex items-center transition-colors"
                 >
                    <Trash2 size={14} className="mr-1" /> 清空
                 </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((url) => (
                  <button 
                    key={url}
                    onClick={() => fillAndCheck(url)}
                    className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-600 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    {url}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-5 flex items-center" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Results Grid */}
        {result && (
          <div className="mt-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Row 1 */}
              <div className="md:col-span-1">
                <Card title="站点信息">
                  <SiteInfo site={result.site} target={result.site.title || targetUrl} />
                </Card>
              </div>
              <div className="md:col-span-1">
                <Card title="连接支持">
                  <ConnectionSupport http={result.http} tls={result.tls} />
                </Card>
              </div>

              {/* Row 2 */}
              <div className="md:col-span-1">
                <Card title="连接耗时">
                  <ConnectionLatency timing={result.timing} />
                </Card>
              </div>
              <div className="md:col-span-1">
                <Card title="TLS/加密套件">
                  <TlsCipherSuite tls={result.tls} />
                </Card>
              </div>

              {/* Row 3 */}
              <div className="md:col-span-1">
                <Card title="证书详情">
                  <CertificateDetails certificate={result.certificate} />
                </Card>
              </div>
              <div className="md:col-span-1">
                <Card title="HTTP 头部">
                  <HttpHeaders headers={result.http.headers} />
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pb-8 text-gray-400 text-sm border-t border-gray-200 pt-5">
          <p className="mb-2">&copy; {new Date().getFullYear()} 网站安全检测工具. All rights reserved.</p>
          <div className="flex justify-center items-center gap-4">
            <a href="https://github.com/Suxiaoqinx/web_opefssl" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-500 transition-colors">
              <Github size={14} className="mr-1" />
              开源项目
            </a>
            <span className="border-l border-gray-300 h-3 mx-1"></span>
            <a href="https://github.com/Suxiaoqinx" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-500 transition-colors">
              <User size={14} className="mr-1" />
              作者主页
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
