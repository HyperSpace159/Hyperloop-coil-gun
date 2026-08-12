import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class SceneManager {
  constructor(containerEl) {
    this.containerEl = containerEl;
    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06080f);
    this.scene.fog = new THREE.FogExp2(0x06080f, 0.015);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(16, 8, 20);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    containerEl.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 50;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.8;

    // Pause auto-rotation when user interacts with mouse/touch
    this.controls.addEventListener('start', () => {
      this.controls.autoRotate = false;
    });

    this.targetCamPos = null;
    this.targetLookAt = null;

    this.initLights();
    this.initEnvironment();
    this.initParticleSpeedLines();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(20, 30, 20);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x00f3ff, 2.0);
    fillLight.position.set(-15, -10, -15);
    this.scene.add(fillLight);

    this.accentLight = new THREE.PointLight(0x9d4edd, 4, 30);
    this.accentLight.position.set(-10, 2, 0);
    this.scene.add(this.accentLight);
  }

  initEnvironment() {
    const gridHelper = new THREE.GridHelper(100, 50, 0x00f3ff, 0x1e293b);
    gridHelper.position.y = -6.6;
    gridHelper.material.opacity = 0.4;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);

    const starsGeo = new THREE.BufferGeometry();
    const count = 1200;
    const posArray = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 150;
      posArray[i + 1] = (Math.random() - 0.5) * 100;
      posArray[i + 2] = (Math.random() - 0.5) * 150;
    }

    starsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starsMat = new THREE.PointsMaterial({
      size: 0.25,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6
    });

    this.starPoints = new THREE.Points(starsGeo, starsMat);
    this.scene.add(this.starPoints);
  }

  initParticleSpeedLines() {
    const lineCount = 300;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(lineCount * 6);

    for (let i = 0; i < lineCount; i++) {
      const idx = i * 6;
      const x = (Math.random() - 0.5) * 60;
      const y = (Math.random() - 0.5) * 8 - 1;
      const z = (Math.random() - 0.5) * 8;
      const len = 2.0 + Math.random() * 4.0;

      positions[idx] = x;
      positions[idx + 1] = y;
      positions[idx + 2] = z;

      positions[idx + 3] = x - len;
      positions[idx + 4] = y;
      positions[idx + 5] = z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.LineBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.0
    });

    this.speedLines = new THREE.LineSegments(geometry, material);
    this.scene.add(this.speedLines);
  }

  setCameraLookAt(targetLookAt, targetCamPos) {
    this.controls.autoRotate = false;
    this.targetLookAt = targetLookAt.clone();
    this.targetCamPos = targetCamPos.clone();
  }

  update(delta, simSpeedRatio = 0, elapsedTime = 0) {
    this.controls.update();

    // Pulse accent light intensity
    if (this.accentLight) {
      this.accentLight.intensity = 3.0 + Math.sin(elapsedTime * 3) * 1.5;
    }

    // Smooth camera transition if preset clicked
    if (this.targetCamPos && this.targetLookAt) {
      this.camera.position.lerp(this.targetCamPos, 0.08);
      this.controls.target.lerp(this.targetLookAt, 0.08);

      if (this.camera.position.distanceTo(this.targetCamPos) < 0.1) {
        this.targetCamPos = null;
        this.targetLookAt = null;
      }
    }

    // Animate star rotation slowly
    if (this.starPoints) {
      this.starPoints.rotation.y += delta * 0.03;
    }

    // Animate speed lines during simulation
    if (this.speedLines) {
      const lineMat = this.speedLines.material;
      if (simSpeedRatio > 0) {
        lineMat.opacity = Math.min(simSpeedRatio * 0.85, 0.8);
        const positions = this.speedLines.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 6) {
          positions[i] -= delta * simSpeedRatio * 90;
          positions[i + 3] -= delta * simSpeedRatio * 90;

          if (positions[i] < -30) {
            positions[i] = 30;
            positions[i + 3] = 27;
          }
        }
        this.speedLines.geometry.attributes.position.needsUpdate = true;
      } else {
        lineMat.opacity = Math.max(0, lineMat.opacity - delta * 2);
      }
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
