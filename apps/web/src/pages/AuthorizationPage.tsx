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
        <p>这个页面专门给 iPhone 浏览器使用。Cloudflare API 和网站部署已经走无绑卡方案完成；现在真正差的是 Apple / iOS 授权，用来把原生扫描 App 安装到 iPhone，并让 Safari 的「开始扫描」拉起 App。</p>
      </section>

      <section className="panel warning">
        <h2><ShieldCheck size={22} /> 安全说明</h2>
        <p>Cloudflare 和 Apple 不允许第三方网页直接做“一键交出全部管理权限”。所以这里不会收集你的密码，也不会让你把密钥发到聊天框。</p>
        <p>当前网站 API 已上线到 workers.dev，不需要绑定银行卡。iOS 真机扫描仍需要 Apple Developer 团队、Bundle ID、Associated Domains 和 TestFlight。</p>
      </section>

      <section className="panel">
        <h2><KeyRound size={22} /> Cloudflare API 状态</h2>
        <p>已完成：Worker API + D1 数据库已部署到 workers.dev，网站已经连接这个真实 API。当前没有启用 R2，所以不会要求绑卡。</p>
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
          <b>当前状态：</b>
          <span>Account / Workers Scripts / Edit</span>
          <span>Account / D1 / Edit</span>
          <span>API：https://vr-q-c-hk-scan-api.vr-q-c-hk-gavin.workers.dev</span>
          <span>存储：local 占位，暂不保存真实 USDZ 大文件</span>
          <span>后续如要保存模型文件，可接 Supabase Storage 或启用 R2</span>
        </div>
        <p className="notice">Cloudflare 这一步现在不拦住「开始扫描」。真正进入扫描需要安装签名后的 iOS App。</p>
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
          <li>使用已部署的 workers.dev API 创建扫描任务。</li>
          <li>把 Apple Team ID 写入 iOS 工程和 AASA 文件。</li>
          <li>在 Apple Developer 开启 Bundle ID、Associated Domains 和 App Clip。</li>
          <li>用 Xcode/TestFlight 安装到你的 iPhone。</li>
          <li>测试 Safari 点击「开始扫描」后拉起 VR QC Scanner，并上传结果页展示。</li>
        </ul>
      </section>
    </main>
  );
}
