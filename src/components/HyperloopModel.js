import * as THREE from 'three';

export class HyperloopModel {
  constructor() {
    this.rootGroup = new THREE.Group();

    this.parts = {};
    this.materials = {};
    this.originalMaterials = new Map();
    this.xrayMaterials = new Map();

    this.explodeProgress = 0;
    this.isXRay = false;

    this.initMaterials();
    this.buildModel();
  }

  initMaterials() {
    // 1. Carbon Fiber Fuselage (Dark Carbon Matrix)
    this.materials.carbonFuselage = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2,
      name: 'carbonFuselage'
    });

    // 2. Translucent Inspection Glass Window for Tank Cells
    this.materials.tankInspectionGlass = new THREE.MeshPhysicalMaterial({
      color: 0x00f3ff,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.85,
      transparent: true,
      opacity: 0.6,
      ior: 1.5,
      name: 'tankInspectionGlass'
    });

    // 3. Oil Fluid & Internal Pressure Baffles
    this.materials.crudeOilFluid = new THREE.MeshBasicMaterial({
      color: 0xd97706,
      name: 'crudeOilFluid'
    });

    this.materials.amberGlow = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      name: 'amberGlow'
    });

    this.materials.cyanGlow = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      name: 'cyanGlow'
    });

    this.materials.purpleGlow = new THREE.MeshBasicMaterial({
      color: 0x9d4edd,
      name: 'purpleGlow'
    });

    // 4. Honeycomb Aluminum & Coilgun Track
    this.materials.honeycombAluminum = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.95,
      roughness: 0.15,
      name: 'honeycombAluminum'
    });

    this.materials.coilgunAluminum = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.35,
      name: 'coilgunAluminum'
    });

    // 5. TBM Concrete Outer Shell & Deck Divider
    this.materials.tbmConcrete = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.1,
      roughness: 0.9,
      name: 'tbmConcrete'
    });

    this.materials.structuralDeck = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.3,
      roughness: 0.7,
      name: 'structuralDeck'
    });

    // 6. Carbon Steel Oil Pipeline (Lower Crescent Chamber)
    this.materials.oilPipeline = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.9,
      roughness: 0.25,
      name: 'oilPipeline'
    });

    // 7. Vacuum Tunnel Acrylic Shell
    this.materials.acrylicTube = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      metalness: 0.05,
      roughness: 0.05,
      transmission: 0.9,
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
      name: 'acrylicTube'
    });
  }

  buildModel() {
    // ==========================================
    // 1. Carbon Fiber Tanker Fuselage (Aerospace Carbon Fiber Oil Tanker)
    // ==========================================
    const shellGroup = new THREE.Group();
    shellGroup.name = "Carbon Fiber Tanker Fuselage";

    // Main Outer Tanker Shell Body
    const bodyGeo = new THREE.CylinderGeometry(1.5, 1.3, 13, 32, 1, false, 0, Math.PI);
    bodyGeo.rotateZ(Math.PI / 2);
    const bodyMesh = new THREE.Mesh(bodyGeo, this.materials.carbonFuselage);
    shellGroup.add(bodyMesh);

    // Seamless Aerodynamic Teardrop Nose Cone
    const noseGeo = new THREE.ConeGeometry(1.5, 4.5, 32, 1, false, 0, Math.PI);
    noseGeo.rotateZ(-Math.PI / 2);
    noseGeo.translate(8.75, 0, 0);
    const noseMesh = new THREE.Mesh(noseGeo, this.materials.carbonFuselage);
    shellGroup.add(noseMesh);

    // Rear Tail Cone with Auto-Docking Fluid Valves
    const tailGeo = new THREE.ConeGeometry(1.3, 3.0, 32, 1, false, 0, Math.PI);
    tailGeo.rotateZ(Math.PI / 2);
    tailGeo.translate(-8.0, 0, 0);
    const tailMesh = new THREE.Mesh(tailGeo, this.materials.carbonFuselage);
    shellGroup.add(tailMesh);

    // High-Speed Automated Fluid Docking Port Couplers (Rear & Front Valves)
    const valveGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.8, 16);
    valveGeo.rotateZ(Math.PI / 2);
    
    const rearValve = new THREE.Mesh(valveGeo, this.materials.honeycombAluminum);
    rearValve.position.set(-9.2, 0, 0);

    const valveGlow = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 16, 32), this.materials.amberGlow);
    valveGlow.rotation.y = Math.PI / 2;
    valveGlow.position.set(-9.4, 0, 0);
    shellGroup.add(rearValve, valveGlow);

    // Tank Inspection Window
    const windowGeo = new THREE.CylinderGeometry(1.52, 1.52, 5.5, 32, 1, false, Math.PI * 0.15, Math.PI * 0.7);
    windowGeo.rotateZ(Math.PI / 2);
    windowGeo.translate(2.5, 0.2, 0);
    const windowMesh = new THREE.Mesh(windowGeo, this.materials.tankInspectionGlass);
    shellGroup.add(windowMesh);

    // Cyan & Amber Status Accent Lines
    const glowLineGeo = new THREE.BoxGeometry(12, 0.06, 0.06);
    const glowLeft = new THREE.Mesh(glowLineGeo, this.materials.amberGlow);
    glowLeft.position.set(1.5, 0.8, 1.48);
    const glowRight = new THREE.Mesh(glowLineGeo, this.materials.amberGlow);
    glowRight.position.set(1.5, 0.8, -1.48);
    shellGroup.add(glowLeft, glowRight);

    this.registerPart('shell', shellGroup, new THREE.Vector3(0, 4.5, 0));

    // ==========================================
    // 2. Internal High-Capacity Oil Tank Cells & Baffles (Passenger Seats Removed 100%)
    // ==========================================
    const tankGroup = new THREE.Group();
    tankGroup.name = "Internal Oil Tank Cells & Surge Baffles";

    // Tank Sub-Cell Cylinders (3 Main Fluid Chambers)
    const cellPositions = [4.0, 0.5, -3.0];
    cellPositions.forEach(xPos => {
      // Carbon Composite Tank Cell Shell
      const cellGeo = new THREE.CylinderGeometry(1.1, 1.1, 3.2, 24);
      cellGeo.rotateZ(Math.PI / 2);
      const cellMesh = new THREE.Mesh(cellGeo, this.materials.carbonFuselage);
      cellMesh.position.set(xPos, 0.2, 0);

      // Internal Crude Oil Fluid Payload Core
      const fluidGeo = new THREE.CylinderGeometry(0.95, 0.95, 3.1, 24);
      fluidGeo.rotateZ(Math.PI / 2);
      const fluidMesh = new THREE.Mesh(fluidGeo, this.materials.crudeOilFluid);
      fluidMesh.position.set(xPos, 0.2, 0);

      // Anti-Surge Baffle Ring Plates
      const baffleGeo = new THREE.TorusGeometry(1.05, 0.08, 16, 24);
      baffleGeo.rotateY(Math.PI / 2);
      const baffleLeft = new THREE.Mesh(baffleGeo, this.materials.honeycombAluminum);
      baffleLeft.position.set(xPos - 1.2, 0.2, 0);
      const baffleRight = new THREE.Mesh(baffleGeo, this.materials.honeycombAluminum);
      baffleRight.position.set(xPos + 1.2, 0.2, 0);

      tankGroup.add(cellMesh, fluidMesh, baffleLeft, baffleRight);
    });

    // High-Pressure Fuel Conduit Lines linking cells
    const conduitGeo = new THREE.CylinderGeometry(0.18, 0.18, 10, 16);
    conduitGeo.rotateZ(Math.PI / 2);
    const conduit = new THREE.Mesh(conduitGeo, this.materials.honeycombAluminum);
    conduit.position.set(0.5, -0.6, 0);
    tankGroup.add(conduit);

    this.registerPart('tank', tankGroup, new THREE.Vector3(0, 1.8, 0));

    // ==========================================
    // 3. Central Spine Rail & Honeycomb Inductrack
    // ==========================================
    const spineGroup = new THREE.Group();
    spineGroup.name = "Central Spine & Honeycomb Rail";

    const beamGeo = new THREE.BoxGeometry(24, 0.6, 0.7);
    const beamMesh = new THREE.Mesh(beamGeo, this.materials.structuralDeck);
    beamMesh.position.set(0, -1.0, 0);
    spineGroup.add(beamMesh);

    const honeycombLeftGeo = new THREE.BoxGeometry(24, 0.4, 0.1);
    const honeycombLeft = new THREE.Mesh(honeycombLeftGeo, this.materials.honeycombAluminum);
    honeycombLeft.position.set(0, -0.9, 0.4);

    const honeycombRight = new THREE.Mesh(honeycombLeftGeo, this.materials.honeycombAluminum);
    honeycombRight.position.set(0, -0.9, -0.4);
    spineGroup.add(honeycombLeft, honeycombRight);

    for (let x = -10; x <= 10; x += 1.2) {
      const coilLeft = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.2), this.materials.coilgunAluminum);
      coilLeft.position.set(x, -0.85, 0.55);

      const coilRight = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.2), this.materials.coilgunAluminum);
      coilRight.position.set(x, -0.85, -0.55);

      const heatSinkIndicator = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.06), this.materials.amberGlow);
      heatSinkIndicator.position.set(x, -1.05, 0);

      spineGroup.add(coilLeft, coilRight, heatSinkIndicator);
    }

    const halbachSled = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.18, 0.9), this.materials.purpleGlow);
    halbachSled.position.set(0.5, -0.65, 0);
    spineGroup.add(halbachSled);

    this.registerPart('spine', spineGroup, new THREE.Vector3(0, -2.8, 0));

    // ==========================================
    // 4. TBM Circular Tunnel & Oval Inner Partition
    // ==========================================
    const tunnelGroup = new THREE.Group();
    tunnelGroup.name = "TBM Outer Tunnel & Partition";

    const outerTbmGeo = new THREE.CylinderGeometry(3.6, 3.6, 24, 36, 1, true);
    outerTbmGeo.rotateZ(Math.PI / 2);
    const outerTbmMesh = new THREE.Mesh(outerTbmGeo, this.materials.tbmConcrete);
    tunnelGroup.add(outerTbmMesh);

    const deckGeo = new THREE.BoxGeometry(24, 0.3, 7.0);
    const deckMesh = new THREE.Mesh(deckGeo, this.materials.structuralDeck);
    deckMesh.position.set(0, -1.35, 0);
    tunnelGroup.add(deckMesh);

    const eggChamberGeo = new THREE.CylinderGeometry(2.7, 2.7, 24, 32, 1, true, -Math.PI * 0.4, Math.PI * 1.8);
    eggChamberGeo.rotateZ(Math.PI / 2);
    eggChamberGeo.translate(0, 0.4, 0);
    const eggChamberMesh = new THREE.Mesh(eggChamberGeo, this.materials.acrylicTube);
    tunnelGroup.add(eggChamberMesh);

    for (let x = -10; x <= 10; x += 5) {
      const ringGeo = new THREE.TorusGeometry(3.62, 0.12, 16, 32);
      ringGeo.rotateY(Math.PI / 2);
      const ringMesh = new THREE.Mesh(ringGeo, this.materials.coilgunAluminum);
      ringMesh.position.set(x, 0, 0);
      tunnelGroup.add(ringMesh);
    }

    this.registerPart('tunnel', tunnelGroup, new THREE.Vector3(0, -5.5, 0));

    // ==========================================
    // 5. Lower Crescent Pipeline (Crude Oil Heat Sink Grid)
    // ==========================================
    const pipelineGroup = new THREE.Group();
    pipelineGroup.name = "Multi-Utility Oil Heat Sink Pipeline";

    const pipeGeo = new THREE.CylinderGeometry(0.9, 0.9, 24, 24);
    pipeGeo.rotateZ(Math.PI / 2);
    const pipeMesh = new THREE.Mesh(pipeGeo, this.materials.oilPipeline);
    pipeMesh.position.set(0, -2.4, 0);

    const heatFlowGeo = new THREE.BoxGeometry(24, 0.1, 0.8);
    const heatFlowMesh = new THREE.Mesh(heatFlowGeo, this.materials.crudeOilFluid);
    heatFlowMesh.position.set(0, -2.4, 0.92);

    pipelineGroup.add(pipeMesh, heatFlowMesh);

    this.registerPart('pipeline', pipelineGroup, new THREE.Vector3(0, -7.5, 0));

    Object.values(this.parts).forEach(p => {
      this.rootGroup.add(p.group);
    });
  }

  registerPart(id, group, explodeVector) {
    this.parts[id] = {
      group,
      restPosition: group.position.clone(),
      explodeVector: explodeVector.clone()
    };

    group.traverse(child => {
      if (child.isMesh) {
        this.originalMaterials.set(child, child.material);
        
        const xrayMat = new THREE.MeshBasicMaterial({
          color: child.material.color ? child.material.color.clone() : new THREE.Color(0x00f3ff),
          wireframe: true,
          transparent: true,
          opacity: child.material.name === 'tankInspectionGlass' ? 0.1 : 0.35
        });
        this.xrayMaterials.set(child, xrayMat);
      }
    });
  }

  setExplodeProgress(progress) {
    this.explodeProgress = progress;
    Object.values(this.parts).forEach(part => {
      const targetPos = new THREE.Vector3().copy(part.restPosition)
        .addScaledVector(part.explodeVector, progress);
      part.group.position.lerp(targetPos, 0.2);
    });
  }

  setXRayMode(enabled) {
    this.isXRay = enabled;
    Object.values(this.parts).forEach(part => {
      part.group.traverse(child => {
        if (child.isMesh) {
          if (enabled) {
            child.material = this.xrayMaterials.get(child) || child.material;
          } else {
            child.material = this.originalMaterials.get(child) || child.material;
          }
        }
      });
    });
  }

  update(delta, elapsedTime, speedRatio = 0) {
    if (this.explodeProgress < 0.05) {
      const floatY = Math.sin(elapsedTime * 2.2) * 0.08;
      ['shell', 'tank', 'spine'].forEach(id => {
        if (this.parts[id]) {
          this.parts[id].group.position.y = this.parts[id].restPosition.y + floatY;
        }
      });
    }
  }
}
