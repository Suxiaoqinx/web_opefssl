# Web SSL/TLS 检测工具

一个基于 Next.js + Ant Design 的网站安全检测工具。
输入域名，一键分析 HTTPS 证书、TLS 套件、HTTP 协议版本及连接耗时。

## 功能特性

- **全方位检测**：支持 HTTP/2、HTTP/3 (QUIC)、HSTS 及 CNAME 记录分析。
- **证书详情**：直观展示证书颁发者、有效期（含倒计时）、序列号及 SHA 指纹。
- **加密套件**：识别当前 TLS 握手使用的加密套件、密钥交换算法及签名算法。
- **性能分析**：可视化展示 DNS、TCP、TLS 握手及 TTFB 各阶段耗时。
- **探测节点**：显示发起检测的服务器节点信息（IP/地理位置）。
- **用户体验**：
  - ⚡️ 毫秒级响应
  - 🌗 完美适配深色模式
  - � 移动端友好布局
  - 💾 本地历史记录

## 技术栈

- **Next.js 16** (App Router)
- **TypeScript**
- **Ant Design 5** + **Tailwind CSS**
- **Core**: Node.js `tls` / `net` / `dns` 模块

## 运行项目

你需要 Node.js 18+ 环境。

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
npm start
```

## 部署说明

本项目依赖 Node.js 原生网络模块（TLS/Socket），**不支持** Edge Runtime。
部署到 Vercel, EdgeOne Pages, Netlify 时，请确保使用默认的 Node.js Runtime。

## 注意事项

- 本工具仅用于学习和研究，不建议在生产环境中使用。
- 检测结果仅供参考，不代表绝对安全。

## 贡献与反馈

- 欢迎提交 Pull Request 改进功能。
- 如有问题或建议，请通过 GitHub Issues 反馈。

## 作者

- **苏晓晴** - [苏晓晴](https://github.com/suxiaoqinx)

