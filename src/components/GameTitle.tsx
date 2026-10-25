// ============================================================
// ESPAÑA EXPLORER — Game Title Overlay
// Top-center logo display rendered via Canvas with subtle glow
// ============================================================

import React, { useEffect, useRef } from 'react';
import { drawGameLogo } from '@/game/rendering/assetRenderer';

export const GameTitle: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw the procedural 3D chunky logo centered in the canvas
    drawGameLogo(ctx, canvas.width / 2, 38, 0.92);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 15,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.85))',
      }}
    >
      <canvas
        ref={canvasRef}
        width={320}
        height={90}
        style={{
          display: 'block',
        }}
      />
    </div>
  );
};

export default GameTitle;
