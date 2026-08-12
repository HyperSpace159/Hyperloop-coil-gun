import * as THREE from 'three';
import { sfx } from '../audio/SoundEffects.js';

export const HOTSPOT_DATA = [
  {
    id: 'shell',
    num: '1',
    label: 'Carbon Tanker Pod',
    pos: new THREE.Vector3(3.5, 0.5, 0.0),
    title: 'Automated Carbon Fiber Tanker Pod',
    tag: 'Zero Passenger Freight Capsule',
    desc: 'Aerospace-grade carbon fiber liquid cargo pod body. Passenger seats are completely removed to maximize oil payload capacity. Features a seamless aerodynamic teardrop nose and high-speed automated fluid docking valves.',
    specs: {
      'Cargo Type': 'Crude Oil / Liquid Energy',
      'Passenger Seats': '0 Seats (Pure Freight)',
      'Docking Valve': 'High-Speed Automated',
      'Mass Reduction': '-80% vs Steel Tanker'
    },
    camTarget: new THREE.Vector3(3.5, 0.5, 0.0),
    camPos: new THREE.Vector3(7.5, 3.0, 6.0)
  },
  {
    id: 'tank',
    num: '2',
    label: 'Internal Oil Tank Cells',
    pos: new THREE.Vector3(1.0, 0.2, 0.0),
    title: 'Multi-Cell Oil Tanks & Anti-Surge Baffles',
    tag: 'Internal Cargo Structure',
    desc: 'Internal carbon fiber oil tank array equipped with anti-surge baffle ring plates. Prevents liquid inertia sloshing during 1,220 km/h high-speed acceleration and deceleration down the supersonic tube.',
    specs: {
      'Tank Structure': '3 Reinforced Carbon Cells',
      'Surge Control': 'Aluminum Ring Baffles',
      'Fluid Capacity': '45,000 Liters / Pod',
      'Surge Dampening': 'Dynamic Hydraulic Baffle'
    },
    camTarget: new THREE.Vector3(1.0, 0.2, 0.0),
    camPos: new THREE.Vector3(3.5, 2.0, 5.0)
  },
  {
    id: 'spine',
    num: '3',
    label: 'Honeycomb Spine Rail',
    pos: new THREE.Vector3(0.5, -0.7, 0.0),
    title: 'Central Spine & Honeycomb Track',
    tag: 'Passive Maglev & Tilt Lock',
    desc: 'Single-track monorail backbone. Uses hexagonal honeycomb aluminum plates that generate natural passive electrodynamic levitation (Inductrack) and automatic tilt-lock stability as Halbach permanent magnets pass over.',
    specs: {
      'Track Plate': 'Hexagonal Honeycomb Al',
      'Levitation System': 'Passive Halbach Array',
      'Tilt Control': 'Passive Auto-Locking',
      'Structure Cost': '-50% Material Saved'
    },
    camTarget: new THREE.Vector3(0.5, -0.7, 0.0),
    camPos: new THREE.Vector3(2.0, -1.8, 5.0)
  },
  {
    id: 'tunnel',
    num: '4',
    label: 'TBM Shell & Egg Tunnel',
    pos: new THREE.Vector3(-6.0, 0.2, 0.0),
    title: 'TBM Circular Shell & Egg Partition',
    tag: 'Structural Tunnel Architecture',
    desc: 'Circular TBM concrete outer shell divided by a central concrete deck. Reduces outer wall thickness by 30% against soil pressure and shapes the upper vacuum chamber into an egg profile, cutting air volume to evacuate by 40%.',
    specs: {
      'Outer Tunnel': 'Circular Concrete TBM',
      'Wall Reduction': '30% Thickness Saved',
      'Inner Section': 'Egg / Vertical Oval',
      'Vacuum Level': '0.1% (100 Pa)'
    },
    camTarget: new THREE.Vector3(-6.0, 0.2, 0.0),
    camPos: new THREE.Vector3(-9.0, 2.0, 7.5)
  },
  {
    id: 'pipeline',
    num: '5',
    label: 'Crude Oil Heat Sink Grid',
    pos: new THREE.Vector3(0.0, -2.4, 0.0),
    title: 'Multi-Utility Oil Heat Sink Pipeline',
    tag: 'Energy Infrastructure & ROI',
    desc: 'Lower crescent chamber crude oil pipeline. Flowing crude oil acts as a natural liquid heat sink, continuously absorbing waste heat from upper capacitor banks and coilgun coils to lower viscosity and co-fund project ROI.',
    specs: {
      'Pipeline Location': 'Lower Crescent Deck',
      'Cooling Method': 'Liquid Heat Sink (Oil)',
      'Oil Viscosity': 'Heat-Assisted Smooth Flow',
      'Revenue Grid': 'Cross-Country Transit'
    },
    camTarget: new THREE.Vector3(0.0, -2.4, 0.0),
    camPos: new THREE.Vector3(1.5, -3.5, 4.5)
  }
];

export class HotspotsManager {
  constructor(containerEl, drawerEl, sceneManager) {
    this.containerEl = containerEl;
    this.drawerEl = drawerEl;
    this.sceneManager = sceneManager;
    this.hotspotElements = [];
    this.activeId = null;

    this.createBadges();
    this.initDrawerClose();
  }

  createBadges() {
    this.containerEl.innerHTML = '';
    HOTSPOT_DATA.forEach(data => {
      const badge = document.createElement('div');
      badge.className = 'hotspot-badge interactive';
      badge.dataset.id = data.id;

      // Clean minimalist pin marker (Text removed from 3D canvas overlay)
      badge.innerHTML = `
        <div class="hotspot-pin">${data.num}</div>
      `;

      badge.addEventListener('click', () => {
        this.selectHotspot(data.id);
      });

      this.containerEl.appendChild(badge);
      this.hotspotElements.push({ data, el: badge });
    });
  }

  initDrawerClose() {
    const closeBtn = this.drawerEl.querySelector('.drawer-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeDrawer();
      });
    }
  }

  selectHotspot(id) {
    const item = HOTSPOT_DATA.find(d => d.id === id);
    if (!item) return;

    this.activeId = id;
    sfx.playHotspot();

    this.hotspotElements.forEach(({ data, el }) => {
      if (data.id === id) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    document.querySelectorAll('.part-item').forEach(el => {
      if (el.dataset.id === id) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    this.drawerEl.querySelector('.drawer-tag').textContent = item.tag;
    this.drawerEl.querySelector('.drawer-title').textContent = item.title;
    this.drawerEl.querySelector('.drawer-desc').textContent = item.desc;

    const specsGrid = this.drawerEl.querySelector('.specs-grid');
    specsGrid.innerHTML = '';
    Object.entries(item.specs).forEach(([k, v]) => {
      const specEl = document.createElement('div');
      specEl.className = 'spec-item';
      specEl.innerHTML = `
        <span class="spec-key">${k}</span>
        <span class="spec-val">${v}</span>
      `;
      specsGrid.appendChild(specEl);
    });

    this.drawerEl.classList.add('open');
    this.sceneManager.setCameraLookAt(item.camTarget, item.camPos);
  }

  closeDrawer() {
    this.drawerEl.classList.remove('open');
    this.activeId = null;
    document.querySelectorAll('.part-item').forEach(el => el.classList.remove('active'));
    this.hotspotElements.forEach(({ el }) => el.classList.remove('active'));
  }

  updatePositions(camera, renderer) {
    if (!camera || !renderer) return;

    const tempV = new THREE.Vector3();
    const width = renderer.domElement.clientWidth;
    const height = renderer.domElement.clientHeight;

    this.hotspotElements.forEach(({ data, el }) => {
      tempV.copy(data.pos);
      tempV.project(camera);

      if (tempV.z > 1) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        return;
      }

      const x = (tempV.x * 0.5 + 0.5) * width;
      const y = (-(tempV.y * 0.5) + 0.5) * height;

      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.opacity = '1';
      el.style.pointerEvents = 'auto';
    });
  }
}
