/* ============ 3D MASK — HERO ============
   The mask outline (mask-shape.js, traced from the logo) is extruded into a
   black bevelled object, the same black as the logo, orbited by dashed
   construction rings (the drafting lines of the loader).
   Intro: morph(rect) places the 3D mask exactly over the 2D loader mask,
   release() then flies it to its hero position. */
import * as THREE from './vendor/three.module.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const host = document.getElementById('hero3d');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function webglOk() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

if (host && window.MASK_SHAPES && webglOk()) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  host.appendChild(renderer.domElement);
  host.classList.add('is-3d');

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const FOV = 30, CAMZ = 7.2;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 0, CAMZ);
  const visH = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAMZ; // world height visible at z = 0

  /* ---- geometry from traced outline ---- */
  const toV = p => new THREE.Vector2(p[0], p[1]);
  const shapes = window.MASK_SHAPES.map(s => {
    const sh = new THREE.Shape(s.o.map(toV));
    s.h.forEach(h => sh.holes.push(new THREE.Path(h.map(toV))));
    return sh;
  });
  const DEPTH = 0.2;
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth: DEPTH, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.012, bevelSegments: 5, curveSegments: 4
  });
  // centre on the traced image (not the bounding box) so it lines up with the 2D mask image
  geo.translate(0, 0, -DEPTH / 2);
  geo.computeVertexNormals();

  const face = new THREE.MeshPhysicalMaterial({ color: 0x121110, metalness: 0.15, roughness: 0.42, clearcoat: 0.8, clearcoatRoughness: 0.25 });
  const edge = new THREE.MeshPhysicalMaterial({ color: 0x2A2622, metalness: 0.55, roughness: 0.35, clearcoat: 0.5, clearcoatRoughness: 0.3 });
  const mask = new THREE.Mesh(geo, [face, edge]);

  const group = new THREE.Group();
  group.add(mask);
  scene.add(group);

  /* ---- dashed construction rings (loader palette: ink + orange) ---- */
  const rings = new THREE.Group();
  [
    { rx: 1.75, ry: 0.72, rot: [1.25, 0.2, 0.1], color: 0xE2570B, speed: 0.12, op: 0.9 },
    { rx: 1.45, ry: 1.45, rot: [0.2, 1.1, 0.4], color: 0x121110, speed: -0.08, op: 0.35 },
    { rx: 2.1, ry: 1.1, rot: [-0.9, 0.5, -0.6], color: 0xE2570B, speed: 0.06, op: 0.55 }
  ].forEach(d => {
    const curve = new THREE.EllipseCurve(0, 0, d.rx, d.ry, 0, Math.PI * 2, false, 0);
    const g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(220));
    const m = new THREE.LineDashedMaterial({ color: d.color, dashSize: 0.045, gapSize: 0.06, transparent: true, opacity: 0 });
    const line = new THREE.Line(g, m);
    line.computeLineDistances();
    line.rotation.set(...d.rot);
    line.userData = d;
    rings.add(line);
  });
  group.add(rings);

  /* ---- lights: soft studio, warm rim ---- */
  const key = new THREE.DirectionalLight(0xFFF4E8, 2.0); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.PointLight(0xE2570B, 18, 12); rim.position.set(-2.5, 1.5, -1.5); scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  /* ---- state ---- */
  const state = { phase: 'wait', from: null, moveStart: 0, scroll: 0, mx: 0, my: 0, tx: 0, ty: 0, visible: true, w: 1, h: 1 };
  const layout = () => {
    state.w = host.clientWidth; state.h = host.clientHeight;
    renderer.setSize(state.w, state.h, false);
    camera.aspect = state.w / state.h;
    camera.updateProjectionMatrix();
    // keep the black mask clear of the black title: left third on desktop, top band on phones
    const visW = visH * camera.aspect, AR = 0.68; // mask width / height
    if (state.w > 900) {
      state.baseS = Math.min(0.68 * visH / 2, 0.3 * visW / (2 * AR));
      state.baseX = -visW / 2 + 0.06 * visW + state.baseS * AR;
      state.baseY = -0.02 * visH;
    } else {
      state.baseS = Math.min(0.22 * visH / 2, 0.6 * visW / (2 * AR));
      state.baseX = 0;
      state.baseY = 0.25 * visH;
    }
  };
  layout();
  new ResizeObserver(layout).observe(host);

  addEventListener('pointermove', e => {
    state.tx = (e.clientX / innerWidth) * 2 - 1;
    state.ty = (e.clientY / innerHeight) * 2 - 1;
  });
  new IntersectionObserver(([en]) => { state.visible = en.isIntersecting; }).observe(host);

  // screen rect of the 2D mask -> world position/scale for the 3D mask
  function fromRect(r) {
    const hr = host.getBoundingClientRect();
    const cx = r.left + r.width / 2 - hr.left, cy = r.top + r.height / 2 - hr.top;
    const visW = visH * camera.aspect;
    return { x: (cx / state.w - 0.5) * visW, y: -(cy / state.h - 0.5) * visH, s: (r.height / state.h) * visH / 2 };
  }

  const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  window.HERO3D = {
    ok: true,
    morph(rect) { state.from = fromRect(rect); state.phase = 'hold'; },
    release() { state.moveStart = performance.now(); state.phase = 'move'; },
    intro() { if (state.phase === 'wait') { state.from = { x: state.baseX, y: state.baseY, s: state.baseS * 0.6 }; this.release(); } },
    setScroll(p) { state.scroll = p; }
  };
  window.dispatchEvent(new Event('hero3d:ready'));

  const MOVE_MS = 1700;
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (!state.visible) return;
    const t = clock.getElapsedTime();
    let e = 1;
    if (state.phase === 'wait') { host.style.visibility = 'hidden'; return; }
    host.style.visibility = '';
    if (state.phase === 'hold') e = 0;
    if (state.phase === 'move') {
      e = reduce ? 1 : easeIO(Math.min(1, (performance.now() - state.moveStart) / MOVE_MS));
      if (e >= 1) state.phase = 'live';
    }
    state.mx += (state.tx - state.mx) * 0.05;
    state.my += (state.ty - state.my) * 0.05;
    const sp = state.scroll, f = state.from || { x: state.baseX, y: state.baseY, s: state.baseS };
    const lerp = (a, b) => a + (b - a) * e;
    const idle = reduce ? 0 : 1;

    group.position.x = lerp(f.x, state.baseX) + sp * 1.0;
    group.position.y = lerp(f.y, state.baseY + Math.sin(t * 0.8) * 0.05 * idle) + sp * 0.6;
    group.scale.setScalar(lerp(f.s, state.baseS) * (1 + sp * 0.35));
    // one full turn while travelling, then follow the mouse
    mask.rotation.y = e * Math.PI * 2 + e * (state.mx * 0.45 + Math.sin(t * 0.35) * 0.12 * idle) + sp * 2.2;
    mask.rotation.x = e * state.my * 0.22 + sp * 0.4;

    rings.children.forEach(r => {
      r.material.opacity = r.userData.op * e * (1 - sp);
      if (idle) r.rotation.z += r.userData.speed * 0.016;
    });
    rings.rotation.y = state.mx * 0.2 * e;
    rim.position.x = -2.5 + state.mx * 1.5;
    host.style.opacity = String(Math.max(0, 1 - sp * 1.15));
    renderer.render(scene, camera);
  });
}
