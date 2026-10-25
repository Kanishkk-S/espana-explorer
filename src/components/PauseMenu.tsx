// ============================================================
// ESPAÑA EXPLORER — Pause Menu Overlay
// Centered modal for game pause, save state tracking,
// settings, controller configuration, and new game confirmation
// ============================================================

import React, { useState, useEffect } from 'react';
import { THEME, primaryButtonStyle, secondaryButtonStyle } from './uiTheme';

export interface PauseMenuProps {
  onResume: () => void;
  onSave: () => void;
  onSettings: () => void;
  onController?: () => void;
  onNewGame: () => void;
  lastSaved?: number | null;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onSave,
  onSettings,
  onController,
  onNewGame,
  lastSaved,
}) => {
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  // Resume on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onResume();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onResume]);

  const handleSave = () => {
    onSave();
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  const formatLastSaved = (timestamp?: number | null) => {
    if (!timestamp) return 'Never saved this session';
    const elapsedSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (elapsedSeconds < 10) return 'Saved just now';
    if (elapsedSeconds < 60) return `Saved ${elapsedSeconds} seconds ago`;
    const minutes = Math.floor(elapsedSeconds / 60);
    return `Saved ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 150,
        backgroundColor: 'rgba(10, 8, 14, 0.82)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onResume}
    >
      {/* Centered Panel */}
      <div
        style={{
          width: '420px',
          maxWidth: '92vw',
          backgroundColor: '#261b12',
          backgroundImage: 'radial-gradient(circle at 50% 20%, #3a281a 0%, #1a1008 100%)',
          border: '3px solid #d4a840',
          borderRadius: THEME.borders.radiusLg,
          boxShadow: THEME.shadows.panelDeep,
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: THEME.fonts.title,
              color: THEME.colors.textGold,
              fontSize: '1.9rem',
              margin: '0 0 4px 0',
              letterSpacing: '0.06em',
              textShadow: '0 2px 6px rgba(0,0,0,0.8)',
            }}
          >
            Pausa
          </h2>
          <div style={{ height: '2px', width: '100px', margin: '0 auto', background: 'linear-gradient(90deg, transparent, #d4a840, transparent)' }} />
          <span style={{ fontSize: '0.8rem', color: THEME.colors.textMuted, marginTop: '4px', display: 'block' }}>
            {formatLastSaved(lastSaved)}
          </span>
        </div>

        {/* Action Buttons List */}
        {!showNewGameConfirm ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            {/* Continue */}
            <button
              onClick={onResume}
              style={{
                ...primaryButtonStyle,
                width: '100%',
                padding: '12px 0',
                fontSize: '1.05rem',
              }}
            >
              <span>▶ Continuar Aventura</span>
            </button>

            {/* Save Game */}
            <button
              onClick={handleSave}
              style={{
                ...secondaryButtonStyle,
                width: '100%',
                padding: '11px 0',
                backgroundColor: saveFeedback ? 'rgba(40, 90, 40, 0.9)' : 'rgba(48, 36, 26, 0.85)',
                borderColor: saveFeedback ? '#76c45e' : 'rgba(212, 168, 64, 0.45)',
                color: saveFeedback ? '#ffffff' : THEME.colors.textPrimary,
              }}
            >
              <span>{saveFeedback ? '✓ ¡Partida Guardada!' : '💾 Guardar Partida'}</span>
            </button>

            {/* Settings */}
            <button
              onClick={onSettings}
              style={{
                ...secondaryButtonStyle,
                width: '100%',
                padding: '11px 0',
              }}
            >
              <span>⚙️ Ajustes (Settings)</span>
            </button>

            {/* Controller Setup */}
            {onController && (
              <button
                onClick={onController}
                style={{
                  ...secondaryButtonStyle,
                  width: '100%',
                  padding: '11px 0',
                }}
              >
                <span>🎮 Configurar Mando</span>
              </button>
            )}

            {/* New Adventure */}
            <button
              onClick={() => setShowNewGameConfirm(true)}
              style={{
                ...secondaryButtonStyle,
                width: '100%',
                padding: '10px 0',
                borderColor: 'rgba(200, 64, 64, 0.4)',
                color: '#e8a0a0',
              }}
            >
              <span>⚔️ Nueva Aventura</span>
            </button>
          </div>
        ) : (
          /* Confirmation Sub-panel */
          <div
            style={{
              width: '100%',
              backgroundColor: 'rgba(38, 20, 16, 0.85)',
              border: '1.5px solid #c84040',
              borderRadius: '8px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontFamily: THEME.fonts.title, color: '#f2a0a0', fontSize: '1.1rem' }}>
              ¿Comenzar nueva aventura?
            </div>
            <p style={{ fontSize: '0.84rem', color: THEME.colors.textSecondary, margin: 0 }}>
              Se reiniciará tu viaje desde la Plaza Mayor de Madrid. El progreso no guardado se perderá.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                onClick={onNewGame}
                style={{
                  ...primaryButtonStyle,
                  flex: 1,
                  backgroundColor: '#9a2828',
                  backgroundImage: 'linear-gradient(180deg, #c83232 0%, #881c1c 100%)',
                  borderColor: '#f28a8a',
                  color: '#fff',
                }}
              >
                Sí, Reiniciar
              </button>
              <button
                onClick={() => setShowNewGameConfirm(false)}
                style={{
                  ...secondaryButtonStyle,
                  flex: 1,
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Footer Hint */}
        <span style={{ fontSize: '0.74rem', color: THEME.colors.textMuted }}>
          Presiona [ESC] para volver al juego
        </span>
      </div>
    </div>
  );
};

export default PauseMenu;
