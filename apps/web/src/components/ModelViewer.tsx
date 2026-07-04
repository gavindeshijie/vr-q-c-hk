import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function ModelViewer({ glbUrl }: { glbUrl?: string | null }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!glbUrl || !hostRef.current) return;
    const host = hostRef.current;
    host.innerHTML = "";
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f7f8fa");

    const camera = new THREE.PerspectiveCamera(55, host.clientWidth / Math.max(host.clientHeight, 1), 0.01, 1000);
    camera.position.set(2.6, 1.8, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    scene.add(new THREE.AmbientLight("#ffffff", 2.1));
    const light = new THREE.DirectionalLight("#ffffff", 2.4);
    light.position.set(4, 6, 5);
    scene.add(light);
    scene.add(new THREE.GridHelper(4, 16, "#94a3b8", "#d7dde5"));
    scene.add(new THREE.AxesHelper(1.2));

    let disposed = false;
    const loader = new GLTFLoader();
    loader.load(
      glbUrl,
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        const maxAxis = Math.max(size.x, size.y, size.z, 0.01);
        model.scale.multiplyScalar(1.8 / maxAxis);
        scene.add(model);
        setProgress(100);
      },
      (event) => {
        if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
      },
      () => setError("GLB 模型加载失败，请下载 USDZ 或稍后重试。")
    );

    const resize = () => {
      const width = host.clientWidth;
      const height = Math.max(host.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", resize);

    const animate = () => {
      if (disposed) return;
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      disposed = true;
      window.removeEventListener("resize", resize);
      controls.dispose();
      renderer.dispose();
      host.innerHTML = "";
    };
  }, [glbUrl]);

  if (!glbUrl) {
    return (
      <div className="model-empty">
        <p>暂未生成网页预览模型，请下载 USDZ 或等待 GLB 转换。</p>
      </div>
    );
  }

  return (
    <div className="model-viewer-wrap">
      <div ref={hostRef} className="model-viewer" />
      <div className="model-progress">GLB 加载进度：{progress}%</div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
