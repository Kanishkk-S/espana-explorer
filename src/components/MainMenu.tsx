// ============================================================
// ESPAÑA EXPLORER — Main Menu Screen
// Atmosphere landing screen with floating ember particles,
// centered procedural title logo, and game start options
// ============================================================

import React, { useEffect, useRef } from 'react';
import { drawGameLogo } from '@/game/rendering/assetRenderer';
import { THEME, primaryButtonStyle, secondaryButtonStyle } from './uiTheme';

export interface MainMenuProps {
  hasSave: boolean;
  onContinue: () => void;
  onNewGame: () => void;
  onSettings: () => void;
  onController?: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  hasSave,
  onContinue,
  onNewGame,
  onSettings,
  onController,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    // Ambient floating embers
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.3 - Math.random() * 0.5,
      size: 1 + Math.random() * 2.5,
      alpha: 0.2 + Math.random() * 0.6,
    }));

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep celestial radial gradient
      const grad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height * 0.35,
        50,
        canvas.width / 2,
        canvas.height * 0.5,
        canvas.width * 0.75
      );
      grad.addColorStop(0, '#2e1c10');
      grad.addColorStop(0.5, '#1e1410');
      grad.addColorStop(1, '#0e0a0d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw floating embers
      ctx.fillStyle = '#f2cf6d';
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }

        ctx.globalAlpha = p.alpha * (0.6 + Math.sin(time * 0.03 + p.x) * 0.4);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Draw game logo centered on the upper third
      const logoScale = 1.35 + Math.sin(time * 0.02) * 0.015;
      drawGameLogo(ctx, canvas.width / 2, 130, logoScale);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 200,
        backgroundColor: '#120d14',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Background & Logo Canvas */}
      <canvas
        ref={canvasRef}
        width={1000}
        height={650}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none',
        }}
      />

      {/* Foreground Menu Options Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          width: '320px',
          marginTop: '130px',
        }}
      >
        {/* Continue Adventure Button (if save exists) */}
        {hasSave && (
          <button
            onClick={onContinue}
            style={{
              ...primaryButtonStyle,
              width: '100%',
              padding: '13px 0',
              fontSize: '1.12rem',
              borderRadius: '10px',
              boxShadow: '0 0 20px rgba(212, 168, 64, 0.4), 0 4px 12px rgba(0,0,0,0.6)',
            }}
          >
            <span>▶ Continuar Aventura</span>
          </button>
        )}

        {/* New Adventure Button */}
        <button
          onClick={onNewGame}
          style={{
            ...(hasSave ? secondaryButtonStyle : primaryButtonStyle),
            width: '100%',
            padding: hasSave ? '11px 0' : '13px 0',
            fontSize: hasSave ? '1rem' : '1.12rem',
            borderRadius: '10px',
            backgroundColor: hasSave ? 'rgba(44, 32, 22, 0.92)' : undefined,
            border: hasSave ? '1.5px solid rgba(212, 168, 64, 0.7)' : undefined,
          }}
        >
          <span>⚔️ Nueva Aventura</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onSettings}
          style={{
            ...secondaryButtonStyle,
            width: '100%',
            padding: '11px 0',
            fontSize: '0.98rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(38, 28, 20, 0.88)',
          }}
        >
          <span>⚙️ Ajustes (Settings)</span>
        </button>

        {/* Controller Setup Button */}
        {onController && (
          <button
            onClick={onController}
            style={{
              ...secondaryButtonStyle,
              width: '100%',
              padding: '11px 0',
              fontSize: '0.98rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(38, 28, 20, 0.88)',
            }}
          >
            <span>🎮 Configuración de Mando</span>
          </button>
        )}
      </div>

      {/* Subtitle / Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          textAlign: 'center',
          color: THEME.colors.textMuted,
          fontSize: '0.82rem',
          fontFamily: THEME.fonts.body,
          letterSpacing: '0.04em',
          zIndex: 10,
        }}
      >
        A 2D Illustrated Canvas RPG of the Kingdoms of Spain • v0.1.0
      </div>
    </div>
  );
};

export default MainMenu;
