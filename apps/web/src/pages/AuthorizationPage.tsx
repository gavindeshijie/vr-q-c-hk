import { ExternalLink, ShieldCheck, Smartphone, KeyRound } from "lucide-react";

export function AuthorizationPage() {
  return (
    <main className="page narrow">
      <header className="topbar">
        <a className="brand" href="/">VR.q-c.hk</a>
        <nav><a href="/scan">返回扫描</a></nav>
      </header>

      <section className="section-head">
        <p className="eyebrow">手机授权入口</p>
        <h1>授权部署三维扫描</h1>
        <p>这个页面专门给 iPhone 浏览器使用。你在这里打开 Cloudflare 和 Apple 官方页面完成授权，我拿到权限后继续自动部署 API、iOS 扫描 App、Universal Link 和上传链路。</p>
      </section>

      <section className="panel warning">
        <h2><ShieldCheck size={22} /> 安全说明</h2>
        <p>Cloudflare 和 Apple 不允许第三方网页直接做“一键交出全部管理权限”。所以这里不会收集你的密码，也不会让你把密钥发到聊天框。</p>
        <p>手机版可以完成授权，但需要在 Cloudflare/Apple 官方页面里确认权限或生成临时 Token。</p>
      </section>

      <section className="panel">
        <h2><KeyRound size={22} /> Cloudflare API 授权</h2>
        <p>用于创建 Worker API、D1 数据库、R2 模型存储，并绑定 `api.vr.q-c.hk`。</p>
        <div className="actions">
          <a className="primary-button" href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" rel="noreferrer">
            <ExternalLink size={18} />
            打开 Cloudflare Token 页面
          </a>
          <a className="secondary-button" href="https://dash.cloudflare.com/" target="_blank" rel="noreferrer">
            打开 Cloudflare 控制台
          </a>
        </div>
        <div className="auth-list">
          <b>Token 权限：</b>
          <span>Account / Workers Scripts / Edit</span>
          <span>Account / D1 / Edit</span>
          <span>Account / R2 Storage / Edit</span>
          <span>Zone / DNS / Edit</span>
          <span>Zone / Workers Routes / Edit</span>
          <span>Zone / Zone / Read</span>
        </div>
        <p className="notice">生成后需要把 Token 放到这台部署电脑的环境变量里，或你改用电脑浏览器授权 Wrangler。iPhone 不能完成 `localhost` 回调。</p>
      </section>

      <section className="panel">
        <h2><Smartphone size={22} /> Apple / iOS 授权</h2>
        <p>用于创建 Bundle ID、开启 Associated Domains / App Clip、配置 TestFlight，让 Safari 点击扫描时能拉起 iPhone 原生扫描 App。</p>
        <div className="actions">
          <a className="primary-button" href="https://appstoreconnect.apple.com/access/users" target="_blank" rel="noreferrer">
            <ExternalLink size={18} />
            打开 App Store Connect 用户权限
          </a>
          <a className="secondary-button" href="https://developer.apple.com/account/resources/identifiers/list" target="_blank" rel="noreferrer">
            打开 Apple Bundle ID 页面
          </a>
        </div>
        <div className="auth-list">
          <b>需要授权：</b>
          <span>Apple Developer Team ID</span>
          <span>App Store Connect 创建 App / TestFlight 权限</span>
          <span>Bundle ID：hk.qc.vr.scanner</span>
          <span>App Clip Bundle ID：hk.qc.vr.scanner.Clip</span>
          <span>Associated Domains：applinks:vr.q-c.hk、appclips:vr.q-c.hk</span>
        </div>
      </section>

      <section className="panel">
        <h2>授权后我会做什么</h2>
        <ul className="check-list">
          <li>部署 Cloudflare Worker API 到 `https://api.vr.q-c.hk`。</li>
          <li>创建 D1 扫描记录数据库和 R2 模型文件存储。</li>
          <li>把网站创建扫描任务接口切到真实 API。</li>
          <li>替换 Apple Team ID / App Store ID，占位不会再留在线上。</li>
          <li>生成并测试 iOS 真机扫描、上传、结果页展示。</li>
        </ul>
      </section>
    </main>
  );
}
