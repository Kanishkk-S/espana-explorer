// ============================================================
// ESPAÑA EXPLORER — UI Design System & Theme Tokens
// Hand-illustrated storybook adventure RPG aesthetic
// ============================================================

import React from 'react';

export const THEME = {
  colors: {
    // Backgrounds
    panelBg: 'rgba(28, 22, 16, 0.94)',
    panelBgTranslucent: 'rgba(28, 22, 16, 0.88)',
    panelBgDark: 'rgba(18, 14, 10, 0.96)',
    parchment: '#f4e8d0',
    parchmentLight: '#fbf5e8',
    parchmentDark: '#d8c6a0',
    overlayBackdrop: 'rgba(12, 10, 14, 0.78)',

    // Golds & Accents
    gold: '#d4a840',
    goldLight: '#f2cf6d',
    goldDark: '#997320',
    goldAccent: '#e8c040',
    goldBorder: 'rgba(212, 168, 64, 0.65)',
    goldBorderGlow: 'rgba(212, 168, 64, 0.35)',

    // Text
    textPrimary: '#f4ebd9', // Warm cream
    textSecondary: '#c8bcab',
    textMuted: '#9e917f',
    textDark: '#2c2214',
    textGold: '#f0c860',

    // Status & Utility
    success: '#5aa346',
    danger: '#c84040',
    warning: '#e69526',
    info: '#4a8abf',

    // Woods & Leathers
    woodDark: '#261b12',
    woodMedium: '#3e2c1c',
    woodLight: '#5c432d',
    leather: '#6e4423',
    leatherDark: '#442813',

    // Shadows
    shadowDark: 'rgba(0, 0, 0, 0.6)',
  },

  fonts: {
    title: '"MedievalSharp", Georgia, serif',
    body: '"Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  borders: {
    gold: '2px solid rgba(212, 168, 64, 0.65)',
    goldThick: '3px solid rgba(212, 168, 64, 0.85)',
    goldSubtle: '1px solid rgba(212, 168, 64, 0.35)',
    dark: '2px solid rgba(26, 18, 12, 0.8)',
    radiusSm: '6px',
    radiusMd: '12px',
    radiusLg: '16px',
    radiusPill: '9999px',
  },

  shadows: {
    panel: '0 12px 36px rgba(0, 0, 0, 0.65), inset 0 0 18px rgba(212, 168, 64, 0.08)',
    panelDeep: '0 20px 50px rgba(0, 0, 0, 0.85), inset 0 0 25px rgba(212, 168, 64, 0.12)',
    button: '0 4px 10px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
    buttonHover: '0 6px 16px rgba(212, 168, 64, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
    goldGlow: '0 0 15px rgba(212, 168, 64, 0.5)',
    innerCarve: 'inset 0 2px 4px rgba(0, 0, 0, 0.5)',
  },

  transitions: {
    default: 'all 0.25s ease',
    fast: 'all 0.15s ease',
    bounce: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};

export const commonPanelStyle: React.CSSProperties = {
  backgroundColor: THEME.colors.panelBg,
  border: THEME.borders.gold,
  borderRadius: THEME.borders.radiusLg,
  boxShadow: THEME.shadows.panel,
  color: THEME.colors.textPrimary,
  fontFamily: THEME.fonts.body,
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
};

export const commonHeaderStyle: React.CSSProperties = {
  fontFamily: THEME.fonts.title,
  color: THEME.colors.textGold,
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
  letterSpacing: '0.05em',
};

export const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: '#a37722',
  backgroundImage: 'linear-gradient(180deg, #d4a840 0%, #997320 100%)',
  color: '#241708',
  border: '1.5px solid #f2cf6d',
  borderRadius: THEME.borders.radiusSm,
  padding: '8px 18px',
  fontFamily: THEME.fonts.title,
  fontWeight: 'bold',
  fontSize: '0.95rem',
  cursor: 'pointer',
  boxShadow: THEME.shadows.button,
  transition: THEME.transitions.fast,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  textShadow: '0 1px 0 rgba(255, 255, 255, 0.25)',
};

export const secondaryButtonStyle: React.CSSProperties = {
  backgroundColor: 'rgba(48, 36, 26, 0.85)',
  color: THEME.colors.textPrimary,
  border: THEME.borders.goldSubtle,
  borderRadius: THEME.borders.radiusSm,
  padding: '8px 16px',
  fontFamily: THEME.fonts.body,
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
  boxShadow: THEME.shadows.button,
  transition: THEME.transitions.fast,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
};

export const closeButtonStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  border: '1.5px solid rgba(212, 168, 64, 0.7)',
  backgroundColor: 'rgba(36, 24, 16, 0.9)',
  color: THEME.colors.goldLight,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: THEME.transitions.fast,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
};
