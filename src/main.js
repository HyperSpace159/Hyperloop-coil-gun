import * as THREE from 'three';
import { SceneManager } from './utils/SceneManager.js';
import { HyperloopModel } from './components/HyperloopModel.js';
import { HotspotsManager, HOTSPOT_DATA } from './components/Hotspots.js';
import { sfx } from './audio/SoundEffects.js';

class App {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.hotspotsContainer = document.getElementById('hotspots-container');
    this.drawerEl = document.getElementById('info-drawer');

    // Scene & 3D Model
    this.sceneManager = new SceneManager(this.container);
    this.hyperloopModel = new HyperloopModel();
    this.sceneManager.scene.add(this.hyperloopModel.rootGroup);

    // Hotspots Manager
    this.hotspotsManager = new HotspotsManager(
      this.hotspotsContainer,
      this.drawerEl,
      this.sceneManager
    );

    // Simulation State
    this.isSimulating = false;
    this.simSpeed = 0;
    this.targetSpeed = 0;
    this.clock = new THREE.Clock();

    this.initUI();
    this.animate();
  }

  initUI() {
    // Explode Slider
    const slider = document.getElementById('explode-slider');
    const sliderVal = document.getElementById('explode-val');
    slider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) / 100;
      sliderVal.textContent = `${Math.round(val * 100)}%`;
      this.hyperloopModel.setExplodeProgress(val);
      sfx.playExplode();
    });

    // X-Ray Toggle
    const btnXray = document.getElementById('btn-xray');
    btnXray.addEventListener('click', () => {
      const isXRay = !this.hyperloopModel.isXRay;
      this.hyperloopModel.setXRayMode(isXRay);
      btnXray.classList.toggle('active', isXRay);
      sfx.playClick();
    });

    // Reset View Button
    const btnReset = document.getElementById('btn-reset');
    btnReset.addEventListener('click', () => {
      slider.value = 0;
      sliderVal.textContent = '0%';
      this.hyperloopModel.setExplodeProgress(0);
      this.hyperloopModel.setXRayMode(false);
      btnXray.classList.remove('active');
      this.hotspotsManager.closeDrawer();
      this.sceneManager.setCameraLookAt(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(16, 8, 20)
      );
      sfx.playClick();
    });

    // Subsystem Inspector Sidebar Items
    document.querySelectorAll('.part-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        this.hotspotsManager.selectHotspot(id);
      });
    });

    // Camera Presets
    document.querySelectorAll('.btn-cam').forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.cam;
        sfx.playClick();
        switch (preset) {
          case 'overview':
            this.sceneManager.setCameraLookAt(new THREE.Vector3(0, 0, 0), new THREE.Vector3(16, 8, 20));
            break;
          case 'shell':
            this.sceneManager.setCameraLookAt(new THREE.Vector3(3.5, 0.5, 0), new THREE.Vector3(7.5, 3.0, 6.0));
            break;
          case 'tank':
            this.sceneManager.setCameraLookAt(new THREE.Vector3(1.0, 0.2, 0), new THREE.Vector3(3.5, 2.0, 5.0));
            break;
          case 'spine':
            this.sceneManager.setCameraLookAt(new THREE.Vector3(0.5, -0.7, 0), new THREE.Vector3(2.0, -1.8, 5.0));
            break;
          case 'pipeline':
            this.sceneManager.setCameraLookAt(new THREE.Vector3(0.0, -2.4, 0), new THREE.Vector3(1.5, -3.5, 4.5));
            break;
        }
      });
    });

    // Simulation Toggle Button
    const btnSim = document.getElementById('btn-simulation');
    btnSim.addEventListener('click', () => {
      this.isSimulating = !this.isSimulating;
      btnSim.classList.toggle('active', this.isSimulating);
      
      const hudStatus = document.getElementById('hud-status');

      if (this.isSimulating) {
        btnSim.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
          STOP SIMULATION
        `;
        hudStatus.textContent = 'OIL FREIGHT RUN // MACH 0.98';
        hudStatus.style.color = 'var(--accent-amber)';
        this.targetSpeed = 1220;
        sfx.startEngine();
      } else {
        btnSim.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          RUN SIMULATION
        `;
        hudStatus.textContent = 'HYBRID GRID // NOMINAL';
        hudStatus.style.color = 'var(--text-main)';
        this.targetSpeed = 0;
        sfx.stopEngine();
      }
      sfx.playClick();
    });

    // Audio Mute Toggle
    const btnAudio = document.getElementById('btn-audio');
    btnAudio.addEventListener('click', () => {
      const isMuted = sfx.toggleMute();
      const textSpan = btnAudio.querySelector('span');
      textSpan.textContent = isMuted ? 'AUDIO OFF' : 'AUDIO ON';
      btnAudio.style.opacity = isMuted ? '0.5' : '1';
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Lerp simulation speed up/down
    this.simSpeed += (this.targetSpeed - this.simSpeed) * delta * 2;
    const speedRatio = this.simSpeed / 1220;

    // Update HUD Telemetry
    document.getElementById('hud-speed').textContent = `${Math.round(this.simSpeed)} KM/H`;
    const pressure = 100 + (speedRatio * (Math.random() * 4 - 2));
    document.getElementById('hud-pressure').textContent = `${pressure.toFixed(1)} Pa`;

    // Dynamic Oil Heat Sink Temperature rise during simulation
    const oilTemp = 42.5 + (speedRatio * 18.2) + (Math.sin(elapsedTime * 4) * 0.4);
    const oilHud = document.getElementById('hud-oil-temp');
    if (oilHud) {
      oilHud.textContent = `${oilTemp.toFixed(1)} °C`;
      oilHud.style.color = speedRatio > 0.5 ? 'var(--accent-amber)' : 'var(--text-main)';
    }

    // Update Model & Sound
    this.hyperloopModel.update(delta, elapsedTime, speedRatio);
    sfx.setEngineSpeed(speedRatio);

    // Update Scene & Hotspots
    this.sceneManager.update(delta, speedRatio, elapsedTime);
    this.hotspotsManager.updatePositions(
      this.sceneManager.camera,
      this.sceneManager.renderer
    );

    this.sceneManager.render();
  }
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => new App());
} else {
  new App();
}
