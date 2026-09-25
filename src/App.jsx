import React, { useState, useRef } from 'react';
import ModelViewer from './components/ModelViewer';
import {
  RotateCw,
  Box,
  Grid,
  Sun,
  Camera,
  RotateCcw,
  Eye,
  Layers,
  Sparkles,
  Zap,
  Info,
  Maximize2,
  CheckCircle2,
  FileCode,
  ShieldAlert
} from 'lucide-react';

const App = () => {
  const viewerRef = useRef(null);

  // Model & Environment States
  const [autoRotate, setAutoRotate] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [lightingPreset, setLightingPreset] = useState('studio');
  const [bgTheme, setBgTheme] = useState('dark');
  const [activeCamPreset, setActiveCamPreset] = useState('iso');

  // Loading & Model Stats State
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [modelStats, setModelStats] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleModelLoaded = (stats) => {
    setIsLoading(false);
    setModelStats(stats);
  };

  const handleLoadProgress = (progress) => {
    setLoadProgress(progress);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleResetView = () => {
    if (viewerRef.current) {
      viewerRef.current.resetView();
      setActiveCamPreset('iso');
      showToast('Camera view reset to default perspective');
    }
  };

  const handleCamPresetChange = (preset) => {
    setActiveCamPreset(preset);
    if (viewerRef.current) {
      viewerRef.current.setCameraView(preset);
    }
  };

  const handleSnapshot = () => {
    if (viewerRef.current) {
      viewerRef.current.takeSnapshot();
      showToast('📸 High-resolution PNG snapshot captured!');
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0c10' }}>
      
      {/* 1. Header Navigation Bar */}
      <header
        className="glass-panel"
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          zIndex: 30,
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 14,
        }}
      >
        {/* Brand & Model Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Box size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                ROTO 3D <span style={{ color: 'var(--primary-glow)', fontWeight: 400 }}>// Lab</span>
              </h1>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '3px 9px',
                  borderRadius: 20,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#10b981',
                }}
              >
                <span className="live-dot" />
                GLB MODEL LIVE
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Interactive 3D Asset Showcase • Meshy Roto Avatar
            </p>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="glass-button" onClick={handleResetView} title="Reset Camera View">
            <RotateCcw size={15} />
            <span>Reset View</span>
          </button>
          <button className="glass-button active" onClick={handleSnapshot} title="Capture Image">
            <Camera size={15} />
            <span>Snapshot</span>
          </button>
        </div>
      </header>

      {/* 2. Main Three.js Viewport */}
      <div style={{ width: '100%', height: '100%' }}>
        <ModelViewer
          ref={viewerRef}
          modelUrl="/3D_Models/Meshy_AI_Chatbot_Conversations_0925062731_texture.glb"
          autoRotate={autoRotate}
          isWireframe={isWireframe}
          showGrid={showGrid}
          lightingPreset={lightingPreset}
          bgTheme={bgTheme}
          onModelLoaded={handleModelLoaded}
          onLoadProgress={handleLoadProgress}
          onError={handleError}
        />
      </div>

      {/* 3. Loading Overlay */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 40,
            background: 'rgba(10, 12, 16, 0.92)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
          }}
        >
          <div style={{ position: 'relative', width: 60, height: 60 }}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '3px solid rgba(99, 102, 241, 0.15)',
                borderTopColor: 'var(--primary-accent)',
                animation: 'spin 1s linear infinite',
              }}
            />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={24} color="var(--primary-glow)" />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Loading 3D Roto Asset...</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Parsing geometry & PBR textures ({loadProgress}%)
            </p>
          </div>
        </div>
      )}

      {/* 4. Error Overlay */}
      {hasError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 40,
            background: 'rgba(10, 12, 16, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <ShieldAlert size={40} color="#ef4444" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Failed to Load 3D Asset</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Please ensure model file exists at `public/3D_Models/Meshy_AI_Chatbot_Conversations_0925062731_texture.glb`
          </p>
        </div>
      )}

      {/* 5. Left Floating Control Panel Deck */}
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          top: 86,
          left: 16,
          zIndex: 20,
          width: 280,
          maxHeight: 'calc(100vh - 150px)',
          overflowY: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {/* Section 1: Display Toggles */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <Zap size={14} color="var(--primary-glow)" />
            Viewer Modes
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className={`glass-button ${autoRotate ? 'active' : ''}`}
              style={{ justifyContent: 'space-between', width: '100%' }}
              onClick={() => {
                setAutoRotate(!autoRotate);
                showToast(autoRotate ? 'Auto-rotation paused' : 'Auto-rotation enabled');
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RotateCw size={15} /> Auto Rotation
              </span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{autoRotate ? 'ON' : 'OFF'}</span>
            </button>

            <button
              className={`glass-button ${isWireframe ? 'active' : ''}`}
              style={{ justifyContent: 'space-between', width: '100%' }}
              onClick={() => {
                setIsWireframe(!isWireframe);
                showToast(isWireframe ? 'Solid shading enabled' : 'Wireframe mode enabled');
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={15} /> Wireframe Topology
              </span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{isWireframe ? 'ON' : 'OFF'}</span>
            </button>

            <button
              className={`glass-button ${showGrid ? 'active' : ''}`}
              style={{ justifyContent: 'space-between', width: '100%' }}
              onClick={() => {
                setShowGrid(!showGrid);
                showToast(showGrid ? 'Grid floor hidden' : 'Grid floor visible');
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Grid size={15} /> Ground Grid
              </span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{showGrid ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Section 2: Camera View Presets */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <Eye size={14} color="var(--primary-glow)" />
            Camera Angles
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              { id: 'iso', label: 'Isometric' },
              { id: 'front', label: 'Front' },
              { id: 'side', label: 'Side' },
              { id: 'top', label: 'Top-down' },
            ].map((preset) => (
              <button
                key={preset.id}
                className={`glass-button ${activeCamPreset === preset.id ? 'active' : ''}`}
                style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '7px 10px' }}
                onClick={() => handleCamPresetChange(preset.id)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Lighting Environment */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <Sun size={14} color="var(--primary-glow)" />
            Studio Lighting
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              { id: 'studio', label: 'Studio' },
              { id: 'cyber', label: 'Cyberpunk' },
              { id: 'sunset', label: 'Sunset' },
              { id: 'minimal', label: 'Clean White' },
            ].map((light) => (
              <button
                key={light.id}
                className={`glass-button ${lightingPreset === light.id ? 'active' : ''}`}
                style={{ justifyContent: 'center', fontSize: '0.8rem', padding: '7px 10px' }}
                onClick={() => {
                  setLightingPreset(light.id);
                  showToast(`Lighting set to ${light.label}`);
                }}
              >
                {light.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: Backdrop Theme */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <Maximize2 size={14} color="var(--primary-glow)" />
            Backdrop Theme
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { id: 'dark', color: '#0a0c10', label: 'Dark' },
              { id: 'cyber', color: '#050814', label: 'Cyber' },
              { id: 'studio', color: '#121620', label: 'Studio' },
              { id: 'slate', color: '#0f172a', label: 'Slate' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setBgTheme(t.id)}
                title={t.label}
                style={{
                  flex: 1,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: t.color,
                  border: bgTheme === t.id ? '2px solid var(--primary-accent)' : '1px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: bgTheme === t.id ? '0 0 10px var(--primary-glow)' : 'none',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 6. Right Model Mesh Inspector Card */}
      {modelStats && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: 86,
            right: 16,
            zIndex: 20,
            width: 240,
            padding: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, color: 'var(--primary-glow)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <FileCode size={15} />
            Asset Inspector
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: 6 }}>
              <span style={{ color: 'var(--text-muted)' }}>Triangles</span>
              <span className="code-font" style={{ fontWeight: 600 }}>{modelStats.triangles.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: 6 }}>
              <span style={{ color: 'var(--text-muted)' }}>Vertices</span>
              <span className="code-font" style={{ fontWeight: 600 }}>{modelStats.vertices.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: 6 }}>
              <span style={{ color: 'var(--text-muted)' }}>Sub-Meshes</span>
              <span className="code-font" style={{ fontWeight: 600 }}>{modelStats.meshes}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: 6 }}>
              <span style={{ color: 'var(--text-muted)' }}>Bounding Size</span>
              <span className="code-font" style={{ fontWeight: 500, fontSize: '0.75rem', color: '#e5e7eb' }}>{modelStats.dimensions}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 2 }}>
              <span style={{ color: 'var(--text-muted)' }}>Format</span>
              <span className="code-font" style={{ color: '#10b981', fontWeight: 600 }}>GLB (Binary)</span>
            </div>
          </div>
        </div>
      )}

      {/* 7. Bottom Interaction Hint */}
      <div
        className="glass-panel"
        style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          padding: '8px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          borderRadius: 30,
        }}
      >
        <span>🖱️ <b>Rotate:</b> Drag Left Click</span>
        <span style={{ opacity: 0.3 }}>|</span>
        <span>📜 <b>Zoom:</b> Scroll Wheel</span>
        <span style={{ opacity: 0.3 }}>|</span>
        <span>🖐️ <b>Pan:</b> Drag Right Click</span>
      </div>

      {/* 8. Toast Feedback Popup */}
      {toastMessage && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            bottom: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            padding: '10px 20px',
            background: 'rgba(99, 102, 241, 0.9)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.85rem',
            borderRadius: 30,
            boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default App;
