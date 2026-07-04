import { Box, Camera, ChevronRight, Clock, Cuboid, LayoutGrid } from "lucide-react";

export function HomePage() {
  return (
    <main className="page">
      <header className="topbar">
        <a className="brand" href="/">VR.q-c.hk</a>
        <nav>
          <a href="/scan/history">扫描历史</a>
        </nav>
      </header>

      <section className="hero-scan">
        <div>
          <p className="eyebrow">第一项功能</p>
          <h1>三维扫描</h1>
          <p className="lead">用 iPhone 扫描房间或物体，自动生成 3D 模型与尺寸信息。</p>
          <p>支持房间扫描、物体 360° 扫描、模型预览、尺寸估算。适合后续装修设计、材料选择和空间规划。</p>
          <a className="primary-button" href="/scan">
            <Camera size={20} />
            开始扫描
            <ChevronRight size={18} />
          </a>
          <a className="secondary-button hero-secondary" href="/scan/result/demo-room">
            <Cuboid size={20} />
            查看示例模型
          </a>
        </div>
        <div className="scan-visual" aria-hidden="true">
          <div className="room-wire">
            <span className="wall wall-a" />
            <span className="wall wall-b" />
            <span className="wall wall-c" />
            <span className="scan-line" />
          </div>
        </div>
      </section>

      <section className="feature-grid" aria-label="功能入口">
        <a className="feature-card feature-card-main" href="/scan">
          <Cuboid size={28} />
          <div>
            <h2>三维扫描</h2>
            <p>房间 RoomPlan、物体 Object Capture、上传、结果页和尺寸估算。</p>
          </div>
        </a>
        <a className="feature-card" href="/scan/result/demo-room">
          <Box size={26} />
          <div>
            <h2>示例模型</h2>
            <p>直接内置在网站中的 GLB 模型，不需要 API token 或外部生成服务。</p>
          </div>
        </a>
        <div className="feature-card disabled">
          <LayoutGrid size={26} />
          <div>
            <h2>空间规划</h2>
            <p>预留功能位，后续接入模型标注和方案管理。</p>
          </div>
        </div>
        <div className="feature-card disabled">
          <Box size={26} />
          <div>
            <h2>材料选择</h2>
            <p>预留功能位，后续根据扫描尺寸辅助材料估算。</p>
          </div>
        </div>
        <div className="feature-card disabled">
          <Clock size={26} />
          <div>
            <h2>项目记录</h2>
            <p>预留功能位，后续整理每次扫描、模型和沟通记录。</p>
          </div>
        </div>
      </section>
    </main>
  );
}
