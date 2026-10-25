// ============================================================
// ESPAÑA EXPLORER — Player HUD (Lost Legends Style)
// Top-left profile banner with illustrated adventurer portrait,
// carved orange wood nameplate, attached Lv. badge, and XP bar
// ============================================================

import React, { useEffect, useRef } from 'react';
import { Player } from '@/types/game';

export interface PlayerHUDProps {
  player: Player;
}

export const PlayerHUD: React.FC<PlayerHUDProps> = ({ player }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate XP ratio
  const currentXp = player.experience || 0;
  const nextXp = player.experienceToNext || 100;
  const xpPercent = Math.min(100, Math.max(0, Math.round((currentXp / nextXp) * 100)));

  // Render white-haired hero portrait (matching reference screenshot!)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Background circle (orange/gold gradient)
    const bgGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 32);
    bgGrad.addColorStop(0, '#fef08a');
    bgGrad.addColorStop(0.7, '#f59e0b');
    bgGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Body (dark jacket with red shirt)
    ctx.fillStyle = '#1e1b4b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - 24, canvas.height - 4);
    ctx.quadraticCurveTo(cx - 15, cy + 12, cx, cy + 14);
    ctx.quadraticCurveTo(cx + 15, cy + 12, cx + 24, canvas.height - 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red inner shirt collar
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy + 14);
    ctx.lineTo(cx, cy + 22);
    ctx.lineTo(cx + 8, cy + 14);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.fillStyle = '#fde68a';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 16, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Spiky White / Silver Hair (Exact match to reference character!)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy + 2);
    ctx.quadraticCurveTo(cx - 24, cy - 14, cx - 14, cy - 18);
    ctx.quadraticCurveTo(cx - 16, cy - 26, cx - 4, cy - 26);
    ctx.quadraticCurveTo(cx, cy - 30, cx + 8, cy - 25);
    ctx.quadraticCurveTo(cx + 18, cy - 28, cx + 18, cy - 14);
    ctx.quadraticCurveTo(cx + 22, cy - 2, cx + 16, cy + 6);
    ctx.quadraticCurveTo(cx + 12, cy - 4, cx + 6, cy - 6);
    ctx.quadraticCurveTo(cx, cy - 8, cx - 10, cy - 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eyes (cute cartoon eyes)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(cx - 5, cy + 3, 2.5, 0, Math.PI * 2);
    ctx.arc(cx + 5, cy + 3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Eye shines
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 6, cy + 2, 1, 0, Math.PI * 2);
    ctx.arc(cx + 4, cy + 2, 1, 0, Math.PI * 2);
    ctx.fill();

    // Cheeks
    ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.beginPath();
    ctx.arc(cx - 9, cy + 7, 3, 0, Math.PI * 2);
    ctx.arc(cx + 9, cy + 7, 3, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(cx, cy + 7, 3.5, 0.1, Math.PI - 0.1);
    ctx.stroke();
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top: '18px',
        left: '20px',
        zIndex: 25,
        display: 'flex',
        alignItems: 'center',
        userSelect: 'none',
        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.65))',
      }}
    >
      {/* 1. White-haired Adventurer Portrait in Carved Orange Rim */}
      <div
        style={{
          position: 'relative',
          width: '68px',
          height: '68px',
          zIndex: 3,
        }}
      >
        <canvas ref={canvasRef} width={68} height={68} style={{ display: 'block' }} />
      </div>

      {/* 2. Carved Orange Wood Plaque with Name & Progress */}
      <div
        style={{
          marginLeft: '-14px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 2,
        }}
      >
        {/* Name Plate (Carved Orange Wood) */}
        <div
          style={{
            background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 60%, #b45309 100%)',
            border: '2.5px solid #451a03',
            borderRadius: '8px',
            padding: '3px 20px 3px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 3px 6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4)',
          }}
        >
          <span
            style={{
              fontFamily: '"Nunito", "MedievalSharp", cursive, sans-serif',
              fontWeight: 900,
              color: '#ffffff',
              fontSize: '1.05rem',
              letterSpacing: '0.04em',
              textShadow: '0 2px 4px #2b1103, 0 1px 0 #180800',
            }}
          >
            {player.name || 'Explorador'}
          </span>
        </div>

        {/* Level & XP Bar Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '3px',
            marginLeft: '14px',
          }}
        >
          {/* Level Badge: "Lv. 01" */}
          <div
            style={{
              background: 'linear-gradient(180deg, #f59e0b 0%, #b45309 100%)',
              border: '2px solid #451a03',
              borderRadius: '6px',
              padding: '1px 8px',
              fontFamily: '"Nunito", sans-serif',
              fontWeight: 900,
              fontSize: '0.72rem',
              color: '#ffffff',
              textShadow: '0 1px 2px #2b1103',
              boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
            }}
          >
            Lv. {player.level < 10 ? `0${player.level}` : player.level}
          </div>

          {/* XP Progress Bar (Dark Slate Frame with Golden-Orange Fill) */}
          <div
            style={{
              width: '85px',
              height: '11px',
              backgroundColor: '#1e293b',
              border: '2px solid #451a03',
              borderRadius: '6px',
              overflow: 'hidden',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6)',
              position: 'relative',
            }}
            title={`Experience: ${currentXp} / ${nextXp} XP (${xpPercent}%)`}
          >
            <div
              style={{
                width: `${xpPercent}%`,
                height: '100%',
                background: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)',
                boxShadow: '0 0 4px #fbbf24',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerHUD;
