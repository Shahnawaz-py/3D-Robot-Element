import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const LIGHTING_PRESETS = {
  studio: {
    ambientColor: 0xffffff,
    ambientIntensity: 0.8,
    keyColor: 0xffffff,
    keyIntensity: 1.5,
    fillColor: 0x93c5fd,
    fillIntensity: 0.8,
    rimColor: 0xa5b4fc,
    rimIntensity: 1.0,
  },
  cyber: {
    ambientColor: 0x0f172a,
    ambientIntensity: 1.0,
    keyColor: 0xec4899, // Cyber Pink
    keyIntensity: 2.5,
    fillColor: 0x06b6d4, // Neon Cyan
    fillIntensity: 2.0,
    rimColor: 0x8b5cf6, // Violet
    rimIntensity: 1.8,
  },
  sunset: {
    ambientColor: 0x2e1065,
    ambientIntensity: 0.9,
    keyColor: 0xf97316, // Orange
    keyIntensity: 2.2,
    fillColor: 0xfacc15, // Golden Yellow
    fillIntensity: 1.2,
    rimColor: 0xe11d48, // Crimson
    rimIntensity: 1.5,
  },
  minimal: {
    ambientColor: 0xffffff,
    ambientIntensity: 1.2,
    keyColor: 0xffffff,
    keyIntensity: 1.0,
    fillColor: 0xcccccc,
    fillIntensity: 0.5,
    rimColor: 0xffffff,
    rimIntensity: 0.5,
  },
};

const BACKGROUND_PRESETS = {
  dark: '#0a0c10',
  cyber: '#050814',
  studio: '#121620',
  slate: '#0f172a',
};

const ModelViewer = forwardRef(({
  modelUrl = '/3D_Models/Meshy_AI_Chatbot_Conversations_0925062731_texture.glb',
  autoRotate = true,
  isWireframe = false,
  showGrid = true,
  lightingPreset = 'studio',
  bgTheme = 'dark',
  onModelLoaded,
  onLoadProgress,
  onError,
}, ref) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const modelGroupRef = useRef(null);
  const gridHelperRef = useRef(null);

  const lightsRef = useRef({
    ambient: null,
    key: null,
    fill: null,
    rim: null,
  });

  const originalMaterialsRef = useRef(new Map());
  const [modelBounds, setModelBounds] = useState(null);

  // Expose control methods to parent via ref (e.g. view resets, snapshot capture)
  useImperativeHandle(ref, () => ({
    resetView: () => {
      if (controlsRef.current && cameraRef.current && modelBounds) {
        const { center, maxDim } = modelBounds;
        const dist = maxDim * 2.2;
        cameraRef.current.position.set(center.x + dist * 0.7, center.y + dist * 0.4, center.z + dist * 0.7);
        controlsRef.current.target.copy(center);
        controlsRef.current.update();
      }
    },
    setCameraView: (preset) => {
      if (!controlsRef.current || !cameraRef.current || !modelBounds) return;
      const { center, maxDim } = modelBounds;
      const dist = maxDim * 2.2;

      switch (preset) {
        case 'front':
          cameraRef.current.position.set(center.x, center.y, center.z + dist);
          break;
        case 'side':
          cameraRef.current.position.set(center.x + dist, center.y, center.z);
          break;
        case 'top':
          cameraRef.current.position.set(center.x, center.y + dist, center.z + 0.001);
          break;
        case 'iso':
        default:
          cameraRef.current.position.set(center.x + dist * 0.7, center.y + dist * 0.5, center.z + dist * 0.7);
          break;
      }
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    },
    takeSnapshot: () => {
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `3D_Model_Snapshot_${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }
    },
  }));

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BACKGROUND_PRESETS[bgTheme] || BACKGROUND_PRESETS.dark);
    scene.fog = new THREE.FogExp2(BACKGROUND_PRESETS[bgTheme] || BACKGROUND_PRESETS.dark, 0.03);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(5, 4, 6);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Allow slightly below horizon
    controls.minDistance = 0.5;
    controls.maxDistance = 100;
    controlsRef.current = controls;

    // 5. Lights setup
    const preset = LIGHTING_PRESETS[lightingPreset] || LIGHTING_PRESETS.studio;
    
    const ambientLight = new THREE.AmbientLight(preset.ambientColor, preset.ambientIntensity);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(preset.keyColor, preset.keyIntensity);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(preset.fillColor, preset.fillIntensity);
    fillLight.position.set(-5, 3, -4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(preset.rimColor, preset.rimIntensity);
    rimLight.position.set(0, 5, -8);
    scene.add(rimLight);

    lightsRef.current = { ambient: ambientLight, key: keyLight, fill: fillLight, rim: rimLight };

    // 6. Grid Helper
    const grid = new THREE.GridHelper(20, 20, 0x6366f1, 0x1e293b);
    grid.position.y = 0;
    grid.visible = showGrid;
    scene.add(grid);
    gridHelperRef.current = grid;

    // Model Group Container
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // Load 3D GLB Model
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;

        // Calculate geometry bounds
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // Center model at origin
        model.position.sub(center);
        
        // Adjust model ground level to sit cleanly on grid
        model.position.y += size.y / 2;

        let totalVertices = 0;
        let totalTriangles = 0;
        let meshCount = 0;

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            meshCount++;

            if (child.geometry) {
              const posAttr = child.geometry.attributes.position;
              if (posAttr) totalVertices += posAttr.count;
              if (child.geometry.index) {
                totalTriangles += child.geometry.index.count / 3;
              } else if (posAttr) {
                totalTriangles += posAttr.count / 3;
              }
            }

            // Save reference to original material
            if (child.material) {
              originalMaterialsRef.current.set(child.uuid, child.material);
            }
          }
        });

        modelGroup.add(model);

        // Position camera to frame model nicely
        const adjustedCenter = new THREE.Vector3(0, size.y / 2, 0);
        const dist = maxDim * 2.2;
        camera.position.set(dist * 0.7, size.y / 2 + dist * 0.4, dist * 0.7);
        controls.target.copy(adjustedCenter);
        controls.update();

        const boundsData = {
          center: adjustedCenter,
          size: { x: size.x.toFixed(2), y: size.y.toFixed(2), z: size.z.toFixed(2) },
          maxDim,
        };
        setModelBounds(boundsData);

        if (onModelLoaded) {
          onModelLoaded({
            vertices: totalVertices,
            triangles: Math.round(totalTriangles),
            meshes: meshCount,
            dimensions: `${size.x.toFixed(2)} × ${size.y.toFixed(2)} × ${size.z.toFixed(2)} m`,
            animations: gltf.animations ? gltf.animations.length : 0,
          });
        }
      },
      (xhr) => {
        if (xhr.lengthComputable && onLoadProgress) {
          const percentComplete = (xhr.loaded / xhr.total) * 100;
          onLoadProgress(Math.round(percentComplete));
        }
      },
      (err) => {
        console.error('Error loading 3D GLB model:', err);
        if (onError) onError(err);
      }
    );

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
    };
    animate();

    // Handle Window Resize
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
      }
      scene.clear();
    };
  }, [modelUrl]);

  // Handle Controls & Theme Prop Updates dynamically
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
      controlsRef.current.autoRotateSpeed = 1.8;
    }
  }, [autoRotate]);

  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid;
    }
  }, [showGrid]);

  useEffect(() => {
    if (sceneRef.current) {
      const colorHex = BACKGROUND_PRESETS[bgTheme] || BACKGROUND_PRESETS.dark;
      sceneRef.current.background = new THREE.Color(colorHex);
      if (sceneRef.current.fog) {
        sceneRef.current.fog.color = new THREE.Color(colorHex);
      }
    }
  }, [bgTheme]);

  useEffect(() => {
    const preset = LIGHTING_PRESETS[lightingPreset] || LIGHTING_PRESETS.studio;
    const lights = lightsRef.current;
    if (lights.ambient) {
      lights.ambient.color.setHex(preset.ambientColor);
      lights.ambient.intensity = preset.ambientIntensity;
    }
    if (lights.key) {
      lights.key.color.setHex(preset.keyColor);
      lights.key.intensity = preset.keyIntensity;
    }
    if (lights.fill) {
      lights.fill.color.setHex(preset.fillColor);
      lights.fill.intensity = preset.fillIntensity;
    }
    if (lights.rim) {
      lights.rim.color.setHex(preset.rimColor);
      lights.rim.intensity = preset.rimIntensity;
    }
  }, [lightingPreset]);

  // Wireframe toggle logic
  useEffect(() => {
    if (!modelGroupRef.current) return;
    modelGroupRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.wireframe = isWireframe);
        } else {
          child.material.wireframe = isWireframe;
        }
      }
    });
  }, [isWireframe]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'relative' }} />;
});

export default ModelViewer;
