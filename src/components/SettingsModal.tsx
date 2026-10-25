// ============================================================
// ESPAÑA EXPLORER — Settings Modal
// Audio volume, mute toggle, tutorial toggle, and save management
// ============================================================

import React from 'react';
import { GameSettings } from '@/types/game';
import { THEME, closeButtonStyle, secondaryButtonStyle } from './uiTheme';
import { sound } from '@/systems/audio/SoundSystem';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetSave: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetSave,
  onClose,
}) => {
  const handleMusicChange = (val: number) => {
    const updated = { ...settings, musicVolume: val };
    onUpdateSettings(updated);
    sound.setVolumes(updated.sfxVolume, val);
  };

  const handleSfxChange = (val: number) => {
    const updated = { ...settings, sfxVolume: val };
    onUpdateSettings(updated);
    sound.setVolumes(val, updated.musicVolume);
    sound.playClick();
  };

  const handleMuteToggle = () => {
    const updated = { ...settings, muted: !settings.muted };
    onUpdateSettings(updated);
    sound.setMuted(updated.muted);
    if (!updated.muted) sound.playClick();
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 130,
        backgroundColor: THEME.colors.overlayBackdrop,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '560px',
          maxWidth: '92vw',
          backgroundColor: '#261b12',
          backgroundImage: 'radial-gradient(circle at 50% 20%, #3a281a 0%, #1a1008 100%)',
          border: '3px solid #d4a840',
          borderRadius: THEME.borders.radiusLg,
          boxShadow: THEME.shadows.panelDeep,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            backgroundColor: 'rgba(20, 14, 10, 0.9)',
            borderBottom: '2px solid rgba(212, 168, 64, 0.45)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>⚙️</span>
            <h2
              style={{
                fontFamily: THEME.fonts.title,
                color: THEME.colors.textGold,
                fontSize: '1.35rem',
                margin: 0,
                letterSpacing: '0.04em',
              }}
            >
              Ajustes del Juego
            </h2>
          </div>

          <button onClick={onClose} style={closeButtonStyle}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Mute Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(30, 20, 14, 0.7)',
              padding: '12px 18px',
              borderRadius: '8px',
              border: '1px solid rgba(212, 168, 64, 0.25)',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: THEME.colors.textPrimary, fontSize: '0.9rem' }}>
                Silenciar Sonido
              </div>
              <div style={{ fontSize: '0.76rem', color: THEME.colors.textMuted }}>
                Desactiva todos los efectos sonoros
              </div>
            </div>

            <button
              onClick={handleMuteToggle}
              style={{
                ...secondaryButtonStyle,
                padding: '6px 16px',
                fontSize: '0.82rem',
                backgroundColor: settings.muted ? 'rgba(180, 40, 40, 0.6)' : undefined,
                color: settings.muted ? '#ff9999' : undefined,
              }}
            >
              {settings.muted ? '🔇 Silenciado' : '🔊 Activado'}
            </button>
          </div>

          {/* SFX Volume */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: THEME.colors.textPrimary, fontWeight: 700 }}>Efectos de Sonido (SFX)</span>
              <span style={{ color: THEME.colors.goldLight, fontFamily: 'monospace' }}>
                {Math.round(settings.sfxVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => handleSfxChange(parseFloat(e.target.value))}
              style={{
                accentColor: '#d4a840',
                cursor: 'pointer',
              }}
            />
          </div>

          {/* Music Volume */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: THEME.colors.textPrimary, fontWeight: 700 }}>Música Ambiental</span>
              <span style={{ color: THEME.colors.goldLight, fontFamily: 'monospace' }}>
                {Math.round(settings.musicVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) => handleMusicChange(parseFloat(e.target.value))}
              style={{
                accentColor: '#d4a840',
                cursor: 'pointer',
              }}
            />
          </div>

          {/* Language / Idioma */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(30, 20, 14, 0.7)',
              padding: '12px 18px',
              borderRadius: '8px',
              border: '1px solid rgba(212, 168, 64, 0.25)',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: THEME.colors.textPrimary, fontSize: '0.9rem' }}>
                Idioma / Language
              </div>
              <div style={{ fontSize: '0.76rem', color: THEME.colors.textMuted }}>
                Textos del juego y descripciones
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onUpdateSettings({ ...settings, language: 'es' })}
                style={{
                  ...secondaryButtonStyle,
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  backgroundColor: settings.language === 'es' ? '#d4a840' : undefined,
                  color: settings.language === 'es' ? '#1a1004' : undefined,
                  fontWeight: settings.language === 'es' ? 800 : 500,
                }}
              >
                Español
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, language: 'en' })}
                style={{
                  ...secondaryButtonStyle,
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  backgroundColor: settings.language === 'en' ? '#d4a840' : undefined,
                  color: settings.language === 'en' ? '#1a1004' : undefined,
                  fontWeight: settings.language === 'en' ? 800 : 500,
                }}
              >
                English
              </button>
            </div>
          </div>

          {/* Danger Zone: Clear Save */}
          <div
            style={{
              marginTop: '10px',
              borderTop: '1px solid rgba(212, 168, 64, 0.2)',
              paddingTop: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: '#e74c3c', fontSize: '0.85rem' }}>
                Borrar Partida Guardada
              </div>
              <div style={{ fontSize: '0.74rem', color: THEME.colors.textMuted }}>
                Reinicia todo el progreso a su estado inicial
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de que deseas borrar tu progreso guardado?')) {
                  onResetSave();
                }
              }}
              style={{
                ...secondaryButtonStyle,
                padding: '6px 14px',
                fontSize: '0.8rem',
                borderColor: '#e74c3c',
                color: '#e74c3c',
              }}
            >
              Reiniciar Progreso
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
