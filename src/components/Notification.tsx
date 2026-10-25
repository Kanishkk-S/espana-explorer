// ============================================================
// ESPAÑA EXPLORER — Notification Popup
// Slides in from top-right with gold border, auto-dismiss timer,
// and custom icon badge for quests, items, achievements, and level-ups
// ============================================================

import React, { useEffect, useState } from 'react';
import { THEME } from './uiTheme';

export interface NotificationProps {
  message: string;
  type?: 'quest' | 'item' | 'achievement' | 'level' | 'info' | string;
  title?: string;
  onDismiss?: () => void;
  duration?: number;
}

export const Notification: React.FC<NotificationProps> = ({
  message,
  type = 'info',
  title,
  onDismiss,
  duration = 3200,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (elapsed >= duration) {
        clearInterval(interval);
        if (onDismiss) onDismiss();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [duration, onDismiss]);

  const getBadge = () => {
    switch (type) {
      case 'quest':
        return { icon: '⚔️', label: title || 'Misión Actualizada' };
      case 'item':
        return { icon: '🎒', label: title || 'Objeto Obtenido' };
      case 'achievement':
        return { icon: '🏆', label: title || '¡Logro Desbloqueado!' };
      case 'level':
        return { icon: '⭐', label: title || '¡Subida de Nivel!' };
      default:
        return { icon: '📜', label: title || 'Aviso' };
    }
  };

  const badge = getBadge();

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'absolute',
        top: '20px',
        right: '84px',
        zIndex: 120,
        minWidth: '280px',
        maxWidth: '380px',
        backgroundColor: 'rgba(28, 20, 14, 0.96)',
        border: '2px solid #d4a840',
        borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.75), 0 0 12px rgba(212, 168, 64, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        cursor: 'pointer',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>{badge.icon}</span>
          <span
            style={{
              fontFamily: THEME.fonts.title,
              color: THEME.colors.textGold,
              fontSize: '0.92rem',
              fontWeight: 'bold',
              letterSpacing: '0.03em',
            }}
          >
            {badge.label}
          </span>
        </div>

        <span style={{ color: THEME.colors.textMuted, fontSize: '0.74rem' }}>✕</span>
      </div>

      <div
        style={{
          fontFamily: THEME.fonts.body,
          fontSize: '0.86rem',
          lineHeight: 1.4,
          color: THEME.colors.textPrimary,
        }}
      >
        {message}
      </div>

      {/* Progress dismiss bar */}
      <div
        style={{
          height: '2px',
          backgroundColor: 'rgba(212, 168, 64, 0.25)',
          borderRadius: '1px',
          overflow: 'hidden',
          marginTop: '4px',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: '#f2cf6d',
            transition: 'width 0.05s linear',
          }}
        />
      </div>
    </div>
  );
};

export default Notification;
