// ============================================================
// ESPAÑA EXPLORER — Procedural Asset Renderer
// All game visuals drawn via Canvas 2D — no external images needed
// ============================================================
import { Direction, NPCAppearance, AnimationState } from '@/types/game';

// --- Color Palette ---
export const PALETTE = {
  // Environment
  grass: '#7ab648',
  grassDark: '#5a9030',
  grassLight: '#96d45c',
  dirt: '#c4a265',
  dirtDark: '#a88845',
  stone: '#9e9e8e',
  stoneDark: '#7a7a6e',
  stoneLight: '#bfbfb0',
  water: '#4aadcf',
  waterDark: '#2d8ab0',
  waterLight: '#7dcde8',
  waterShine: '#b8eaf8',
  sand: '#e8d5a8',
  sandDark: '#d4be8a',

  // Buildings
  terracotta: '#c4714a',
  terracottaDark: '#a85a38',
  terracottaLight: '#d88e6a',
  adobe: '#e8d0a8',
  adobeDark: '#d4b888',
  adobeLight: '#f0e0c0',
  roofTile: '#b84a2a',
  roofTileDark: '#8e3620',
  woodDark: '#5a3a20',
  woodMedium: '#7a5434',
  woodLight: '#a47a50',
  windowBlue: '#3a6a8a',
  doorBrown: '#6a4020',

  // Foliage
  treeDark: '#2a6a20',
  treeMedium: '#3a8a30',
  treeLight: '#5aaa48',
  treeHighlight: '#7acc60',
  leafYellow: '#c8b040',
  leafOrange: '#d88a30',
  flowerRed: '#d84040',
  flowerPink: '#e88aaa',
  flowerYellow: '#e8c840',
  flowerPurple: '#8a4aaa',
  flowerWhite: '#f0e8e0',

  // UI
  outline: '#2a2018',
  outlineSoft: '#4a3828',
  uiBg: 'rgba(30, 25, 20, 0.88)',
  uiBgSolid: '#2a2218',
  uiPanel: '#3a3028',
  uiGold: '#d4a840',
  uiGoldDark: '#aa8430',
  uiGoldLight: '#e8c860',
  uiCream: '#f0e8d8',
  uiCreamDark: '#d8d0c0',
  uiRed: '#c84040',
  uiGreen: '#4a8a40',
  uiBlue: '#4a7ab0',
  parchment: '#f4e8d0',
  parchmentDark: '#d8c8a8',
  
  // Character
  skinLight: '#f0c8a0',
  skinMedium: '#d8a878',
  skinDark: '#b08050',
  hairBrown: '#5a3a20',
  hairBlack: '#2a2020',
  hairBlonde: '#d4a840',
  hairRed: '#a84030',
  cloakRed: '#a83030',
  cloakBlue: '#305aa0',
  cloakGreen: '#308050',
  shirtWhite: '#e8e0d8',

  // Sky
  skyTop: '#6ab4e8',
  skyBottom: '#a8d8f0',
  skyEvening: '#e8a060',
  skyNight: '#1a1a3a',
};

// --- Helper Drawing Functions ---

function drawOutlinedShape(
  ctx: CanvasRenderingContext2D,
  drawFn: () => void,
  fillColor: string,
  outlineColor: string = PALETTE.outline,
  lineWidth: number = 2
) {
  ctx.save();
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = lineWidth;
  ctx.fillStyle = fillColor;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  drawFn();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawEllipse(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, rx: number, ry: number
) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.closePath();
}

// --- TREE DRAWING ---
export function drawTree(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number = 1,
  variant: number = 0,
  time: number = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const sway = Math.sin(time * 0.001 + x * 0.01) * 2;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  drawEllipse(ctx, 0, 0, 30, 10);
  ctx.fill();

  // Trunk
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(-8, -35);
    ctx.quadraticCurveTo(-4, -45, 0, -40);
    ctx.quadraticCurveTo(4, -45, 8, -35);
    ctx.lineTo(6, 0);
    ctx.closePath();
  }, PALETTE.woodMedium, PALETTE.outline, 2.5);

  // Trunk detail
  ctx.strokeStyle = PALETTE.woodDark;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-2, -5);
  ctx.lineTo(-3, -25);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(3, -8);
  ctx.lineTo(2, -20);
  ctx.stroke();

  // Canopy layers (bottom to top)
  const canopyColors = [PALETTE.treeDark, PALETTE.treeMedium, PALETTE.treeLight, PALETTE.treeHighlight];
  const canopyData = [
    { cx: 0, cy: -55, rx: 35, ry: 25 },
    { cx: -10 + sway * 0.3, cy: -65, rx: 28, ry: 20 },
    { cx: 10 + sway * 0.5, cy: -62, rx: 25, ry: 18 },
    { cx: sway * 0.7, cy: -72, rx: 18, ry: 14 },
  ];

  if (variant === 1) {
    // Rounder tree
    canopyData[0] = { cx: 0, cy: -50, rx: 38, ry: 30 };
    canopyData[1] = { cx: -5 + sway * 0.3, cy: -62, rx: 30, ry: 22 };
    canopyData[2] = { cx: 8 + sway * 0.5, cy: -58, rx: 26, ry: 20 };
    canopyData[3] = { cx: sway * 0.7, cy: -68, rx: 20, ry: 16 };
  }

  canopyData.forEach((c, i) => {
    drawOutlinedShape(ctx, () => {
      drawEllipse(ctx, c.cx, c.cy, c.rx, c.ry);
    }, canopyColors[i], PALETTE.outline, 2);
  });

  // Leaf highlights
  ctx.fillStyle = PALETTE.treeHighlight;
  for (let i = 0; i < 5; i++) {
    const lx = -15 + Math.sin(i * 2.3) * 20 + sway;
    const ly = -58 - Math.cos(i * 1.7) * 12;
    ctx.beginPath();
    ctx.arc(lx, ly, 3 + Math.sin(i) * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// --- BUSH DRAWING ---
export function drawBush(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number = 1,
  variant: number = 0,
  time: number = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const sway = Math.sin(time * 0.0012 + x * 0.02) * 1;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  drawEllipse(ctx, 0, 2, 22, 6);
  ctx.fill();

  // Bush body
  drawOutlinedShape(ctx, () => {
    drawEllipse(ctx, 0 + sway, -10, 20, 14);
  }, PALETTE.treeMedium, PALETTE.outline, 2);

  drawOutlinedShape(ctx, () => {
    drawEllipse(ctx, -8 + sway * 0.5, -8, 14, 11);
  }, PALETTE.treeLight, PALETTE.outline, 1.5);

  drawOutlinedShape(ctx, () => {
    drawEllipse(ctx, 8 + sway * 0.7, -6, 12, 10);
  }, PALETTE.treeLight, PALETTE.outline, 1.5);

  // Berry/flower accents based on variant
  if (variant === 1) {
    const berryPositions = [[-5, -14], [8, -12], [0, -8], [-10, -6]];
    berryPositions.forEach(([bx, by]) => {
      ctx.fillStyle = PALETTE.flowerRed;
      ctx.strokeStyle = PALETTE.outline;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(bx + sway, by, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  } else if (variant === 2) {
    const flowerPositions = [[-4, -16], [6, -14], [-8, -8]];
    flowerPositions.forEach(([fx, fy]) => {
      ctx.fillStyle = PALETTE.flowerYellow;
      ctx.strokeStyle = PALETTE.outline;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(fx + sway, fy, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  ctx.restore();
}

// --- ROCK DRAWING ---
export function drawRock(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number = 1,
  variant: number = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  drawEllipse(ctx, 0, 2, 18 * (variant === 1 ? 1.3 : 1), 6);
  ctx.fill();

  if (variant === 0) {
    // Single round rock
    drawOutlinedShape(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(-15, 0);
      ctx.quadraticCurveTo(-18, -12, -8, -18);
      ctx.quadraticCurveTo(0, -22, 10, -16);
      ctx.quadraticCurveTo(18, -10, 15, 0);
      ctx.closePath();
    }, PALETTE.stone, PALETTE.outline, 2);

    // Highlight
    ctx.fillStyle = PALETTE.stoneLight;
    ctx.beginPath();
    ctx.moveTo(-8, -6);
    ctx.quadraticCurveTo(-4, -14, 4, -12);
    ctx.quadraticCurveTo(0, -8, -8, -6);
    ctx.fill();
  } else {
    // Rock cluster
    drawOutlinedShape(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.quadraticCurveTo(-24, -8, -16, -14);
      ctx.quadraticCurveTo(-8, -18, -2, -12);
      ctx.quadraticCurveTo(2, -20, 12, -16);
      ctx.quadraticCurveTo(20, -10, 18, 0);
      ctx.closePath();
    }, PALETTE.stone, PALETTE.outline, 2);

    drawOutlinedShape(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(-10, 2);
      ctx.quadraticCurveTo(-14, -6, -6, -10);
      ctx.quadraticCurveTo(0, -14, 6, -8);
      ctx.quadraticCurveTo(10, -4, 8, 2);
      ctx.closePath();
    }, PALETTE.stoneLight, PALETTE.outline, 1.5);
  }

  ctx.restore();
}

// --- FLOWER DRAWING ---
export function drawFlower(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number = 1,
  color: string = PALETTE.flowerRed,
  time: number = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const sway = Math.sin(time * 0.002 + x * 0.05) * 2;

  // Stem
  ctx.strokeStyle = PALETTE.treeDark;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(sway, -6, sway * 0.5, -12);
  ctx.stroke();

  // Petals
  const petalCount = 5;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2 + time * 0.0005;
    const px = Math.cos(angle) * 4 + sway * 0.5;
    const py = Math.sin(angle) * 4 - 12;
    ctx.fillStyle = color;
    ctx.strokeStyle = PALETTE.outline;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Center
  ctx.fillStyle = PALETTE.flowerYellow;
  ctx.beginPath();
  ctx.arc(sway * 0.5, -12, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// --- FOUNTAIN DRAWING ---
export function drawFountain(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number = 1,
  time: number = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Base shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  drawEllipse(ctx, 0, 8, 45, 15);
  ctx.fill();

  // Water basin (outer)
  drawOutlinedShape(ctx, () => {
    drawEllipse(ctx, 0, 0, 40, 14);
  }, PALETTE.stoneLight, PALETTE.outline, 2.5);

  // Water surface
  const waterShimmer = Math.sin(time * 0.003) * 0.15 + 0.85;
  ctx.fillStyle = PALETTE.water;
  ctx.globalAlpha = waterShimmer;
  drawEllipse(ctx, 0, -1, 34, 10);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Water sparkles
  for (let i = 0; i < 4; i++) {
    const sx = Math.sin(time * 0.002 + i * 1.5) * 20;
    const sy = Math.cos(time * 0.003 + i * 2) * 5 - 1;
    ctx.fillStyle = PALETTE.waterShine;
    ctx.globalAlpha = 0.5 + Math.sin(time * 0.004 + i) * 0.3;
    ctx.beginPath();
    ctx.arc(sx, sy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Central pillar
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.rect(-6, -30, 12, 30);
  }, PALETTE.stone, PALETTE.outline, 2);

  // Top bowl
  drawOutlinedShape(ctx, () => {
    drawEllipse(ctx, 0, -30, 14, 6);
  }, PALETTE.stoneLight, PALETTE.outline, 2);

  // Water spray
  const sprayHeight = 8 + Math.sin(time * 0.005) * 3;
  ctx.strokeStyle = PALETTE.waterLight;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(0, -30);
  ctx.quadraticCurveTo(0, -30 - sprayHeight, -4, -30 + 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -30);
  ctx.quadraticCurveTo(0, -30 - sprayHeight, 4, -30 + 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Basin rim detail
  ctx.strokeStyle = PALETTE.stoneDark;
  ctx.lineWidth = 1;
  drawEllipse(ctx, 0, 4, 40, 14);
  ctx.stroke();

  ctx.restore();
}

// --- BUILDING DRAWING ---
export function drawBuilding(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number = 120,
  height: number = 100,
  config: {
    wallColor?: string;
    roofColor?: string;
    doorColor?: string;
    hasBalcony?: boolean;
    windowCount?: number;
    roofStyle?: 'flat' | 'tiled' | 'dome';
    sign?: string;
  } = {}
) {
  ctx.save();
  ctx.translate(x, y);

  const {
    wallColor = PALETTE.adobeLight,
    roofColor = PALETTE.roofTile,
    doorColor = PALETTE.doorBrown,
    hasBalcony = false,
    windowCount = 2,
    roofStyle = 'tiled',
    sign
  } = config;

  // Building shadow
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(width + 10, 0);
  ctx.lineTo(width + 15, -height * 0.3);
  ctx.lineTo(15, -height * 0.3);
  ctx.closePath();
  ctx.fill();

  // Main wall
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.rect(0, -height, width, height);
  }, wallColor, PALETTE.outline, 2.5);

  // Wall texture lines
  ctx.strokeStyle = PALETTE.adobeDark;
  ctx.globalAlpha = 0.2;
  ctx.lineWidth = 0.5;
  for (let i = 0; i < height; i += 12) {
    ctx.beginPath();
    ctx.moveTo(2, -i);
    ctx.lineTo(width - 2, -i);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Roof
  if (roofStyle === 'tiled') {
    drawOutlinedShape(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(-8, -height);
      ctx.lineTo(width / 2, -height - 25);
      ctx.lineTo(width + 8, -height);
      ctx.closePath();
    }, roofColor, PALETTE.outline, 2.5);

    // Roof tile lines
    ctx.strokeStyle = PALETTE.roofTileDark;
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const ry = -height - 5 - i * 5;
      const leftX = -8 + (width / 2 + 8) * (1 - (ry + height) / -25);
      const rightX = width + 8 - (width / 2 + 8) * (1 - (ry + height) / -25);
      ctx.beginPath();
      ctx.moveTo(Math.max(-8, leftX - 20), ry);
      ctx.lineTo(Math.min(width + 8, rightX + 20), ry);
      ctx.stroke();
    }
  } else if (roofStyle === 'dome') {
    drawOutlinedShape(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(-4, -height);
      ctx.quadraticCurveTo(width / 2, -height - 40, width + 4, -height);
      ctx.closePath();
    }, roofColor, PALETTE.outline, 2.5);
  }

  // Door
  const doorW = width * 0.22;
  const doorH = height * 0.35;
  const doorX = (width - doorW) / 2;
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(doorX, 0);
    ctx.lineTo(doorX, -doorH);
    ctx.quadraticCurveTo(doorX + doorW / 2, -doorH - 8, doorX + doorW, -doorH);
    ctx.lineTo(doorX + doorW, 0);
    ctx.closePath();
  }, doorColor, PALETTE.outline, 2);

  // Door knob
  ctx.fillStyle = PALETTE.uiGold;
  ctx.strokeStyle = PALETTE.outline;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(doorX + doorW * 0.75, -doorH * 0.4, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Windows
  const winW = 18;
  const winH = 22;
  const winY = -height * 0.6;
  const winSpacing = width / (windowCount + 1);
  for (let i = 0; i < windowCount; i++) {
    const winX = winSpacing * (i + 1) - winW / 2;

    // Window frame
    drawOutlinedShape(ctx, () => {
      ctx.beginPath();
      ctx.rect(winX, winY, winW, winH);
    }, PALETTE.windowBlue, PALETTE.outline, 2);

    // Window cross
    ctx.strokeStyle = PALETTE.adobeDark;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(winX + winW / 2, winY);
    ctx.lineTo(winX + winW / 2, winY + winH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(winX, winY + winH / 2);
    ctx.lineTo(winX + winW, winY + winH / 2);
    ctx.stroke();

    // Window shine
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(winX + 2, winY + 2, winW / 2 - 3, winH / 2 - 3);

    // Balcony
    if (hasBalcony) {
      drawOutlinedShape(ctx, () => {
        ctx.beginPath();
        ctx.rect(winX - 4, winY + winH, winW + 8, 4);
      }, PALETTE.stone, PALETTE.outline, 1.5);

      // Railing
      ctx.strokeStyle = PALETTE.woodDark;
      ctx.lineWidth = 1.5;
      for (let j = 0; j < 4; j++) {
        const rx = winX - 2 + j * (winW + 4) / 3;
        ctx.beginPath();
        ctx.moveTo(rx, winY + winH + 4);
        ctx.lineTo(rx, winY + winH + 12);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(winX - 4, winY + winH + 12);
      ctx.lineTo(winX + winW + 4, winY + winH + 12);
      ctx.stroke();
    }
  }

  // Sign
  if (sign) {
    const signW = Math.min(width * 0.6, sign.length * 8 + 16);
    const signX = (width - signW) / 2;
    const signY = -height + 15;

    drawOutlinedShape(ctx, () => {
      drawRoundedRect(ctx, signX, signY, signW, 16, 3);
    }, PALETTE.woodLight, PALETTE.outline, 1.5);

    ctx.fillStyle = PALETTE.uiCream;
    ctx.font = 'bold 8px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sign, width / 2, signY + 8);
  }

  ctx.restore();
}

// --- STREET LAMP ---
export function drawStreetLamp(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number = 1,
  lit: boolean = true,
  time: number = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  drawEllipse(ctx, 0, 2, 8, 3);
  ctx.fill();

  // Pole
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.rect(-2.5, -50, 5, 50);
  }, PALETTE.woodDark, PALETTE.outline, 1.5);

  // Arm
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(0, -48);
    ctx.quadraticCurveTo(12, -52, 14, -44);
    ctx.lineTo(12, -44);
    ctx.quadraticCurveTo(10, -49, 0, -46);
    ctx.closePath();
  }, PALETTE.woodDark, PALETTE.outline, 1.5);

  // Lantern
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.rect(9, -44, 10, 12);
  }, lit ? PALETTE.flowerYellow : PALETTE.stoneDark, PALETTE.outline, 1.5);

  // Glow
  if (lit) {
    const glowIntensity = 0.15 + Math.sin(time * 0.003) * 0.05;
    const gradient = ctx.createRadialGradient(14, -38, 2, 14, -38, 40);
    gradient.addColorStop(0, `rgba(255, 220, 100, ${glowIntensity})`);
    gradient.addColorStop(1, 'rgba(255, 220, 100, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(14, -38, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// --- BENCH ---
export function drawBench(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number = 1
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  drawEllipse(ctx, 0, 2, 22, 5);
  ctx.fill();

  // Legs
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.rect(-18, -4, 4, 10);
  }, PALETTE.woodDark, PALETTE.outline, 1.5);
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.rect(14, -4, 4, 10);
  }, PALETTE.woodDark, PALETTE.outline, 1.5);

  // Seat
  drawOutlinedShape(ctx, () => {
    drawRoundedRect(ctx, -20, -8, 40, 6, 2);
  }, PALETTE.woodMedium, PALETTE.outline, 2);

  // Back
  drawOutlinedShape(ctx, () => {
    drawRoundedRect(ctx, -18, -18, 36, 4, 1.5);
  }, PALETTE.woodLight, PALETTE.outline, 1.5);

  ctx.restore();
}

// --- MARKET STALL ---
export function drawMarketStall(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number = 1,
  color: string = PALETTE.cloakRed
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  drawEllipse(ctx, 0, 4, 35, 8);
  ctx.fill();

  // Counter
  drawOutlinedShape(ctx, () => {
    drawRoundedRect(ctx, -30, -15, 60, 18, 2);
  }, PALETTE.woodMedium, PALETTE.outline, 2);

  // Awning poles
  ctx.strokeStyle = PALETTE.outline;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-28, -15);
  ctx.lineTo(-28, -45);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(28, -15);
  ctx.lineTo(28, -45);
  ctx.stroke();

  // Awning
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(-32, -45);
    ctx.lineTo(32, -45);
    ctx.lineTo(34, -35);
    ctx.lineTo(-34, -35);
    ctx.closePath();
  }, color, PALETTE.outline, 2);

  // Scalloped edge
  for (let i = 0; i < 8; i++) {
    const sx = -30 + i * 8.5;
    ctx.fillStyle = color;
    ctx.strokeStyle = PALETTE.outline;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sx + 4, -34, 4.5, 0, Math.PI);
    ctx.fill();
    ctx.stroke();
  }

  // Items on counter
  const itemColors = [PALETTE.flowerRed, PALETTE.flowerYellow, PALETTE.treeLight, PALETTE.leafOrange];
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = itemColors[i];
    ctx.strokeStyle = PALETTE.outline;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(-18 + i * 13, -20, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

// --- PATH TILES ---
export function drawPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number,
  height: number,
  variant: 'dirt' | 'stone' | 'cobble' = 'dirt'
) {
  ctx.save();
  ctx.translate(x, y);

  if (variant === 'dirt') {
    ctx.fillStyle = PALETTE.dirt;
    drawRoundedRect(ctx, 0, 0, width, height, 4);
    ctx.fill();

    ctx.strokeStyle = PALETTE.dirtDark;
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, 0, 0, width, height, 4);
    ctx.stroke();

    // Dirt texture
    ctx.fillStyle = PALETTE.dirtDark;
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 8; i++) {
      const dx = Math.random() * width;
      const dy = Math.random() * height;
      ctx.beginPath();
      ctx.arc(dx, dy, 1 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (variant === 'cobble') {
    ctx.fillStyle = PALETTE.stone;
    ctx.fillRect(0, 0, width, height);

    // Cobblestone pattern
    const stoneSize = 12;
    for (let row = 0; row < height / stoneSize; row++) {
      const offset = row % 2 === 0 ? 0 : stoneSize / 2;
      for (let col = -1; col < width / stoneSize + 1; col++) {
        const sx = col * stoneSize + offset;
        const sy = row * stoneSize;
        ctx.strokeStyle = PALETTE.stoneDark;
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, sx + 1, sy + 1, stoneSize - 2, stoneSize - 2, 2);
        ctx.stroke();
      }
    }
  } else {
    ctx.fillStyle = PALETTE.stoneLight;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = PALETTE.stoneDark;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
  }

  ctx.restore();
}

// --- WATER BODY ---
export function drawWater(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number,
  height: number,
  time: number = 0
) {
  ctx.save();
  ctx.translate(x, y);

  // Water base
  ctx.fillStyle = PALETTE.water;
  drawRoundedRect(ctx, 0, 0, width, height, 8);
  ctx.fill();

  // Animated waves
  ctx.strokeStyle = PALETTE.waterDark;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 3; i++) {
    const waveY = height * 0.3 + i * height * 0.2;
    ctx.beginPath();
    for (let wx = 0; wx < width; wx += 2) {
      const wy = waveY + Math.sin((wx + time * 0.05 + i * 30) * 0.08) * 3;
      if (wx === 0) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.stroke();
  }

  // Sparkles
  ctx.fillStyle = PALETTE.waterShine;
  ctx.globalAlpha = 0.6;
  for (let i = 0; i < 5; i++) {
    const sx = width * 0.2 + Math.sin(time * 0.002 + i * 1.8) * width * 0.3;
    const sy = height * 0.3 + Math.cos(time * 0.003 + i * 2.2) * height * 0.2;
    const sparkleSize = 1.5 + Math.sin(time * 0.005 + i) * 0.8;
    ctx.beginPath();
    ctx.arc(sx, sy, sparkleSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Border
  ctx.strokeStyle = PALETTE.outline;
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 0, 0, width, height, 8);
  ctx.stroke();

  ctx.restore();
}

// --- PLAYER CHARACTER ---
export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  direction: Direction,
  animationState: AnimationState,
  frame: number,
  time: number
) {
  ctx.save();
  ctx.translate(x, y);

  const walkBob = animationState === 'walking' ? Math.sin(frame * 0.8) * 2 : 0;
  const breathe = Math.sin(time * 0.003) * 0.5;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  drawEllipse(ctx, 0, 2, 10, 4);
  ctx.fill();

  // Legs
  const legSpread = animationState === 'walking' ? Math.sin(frame * 0.8) * 4 : 0;
  
  // Left leg
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.rect(-5 - legSpread * 0.5, -4, 4, 8);
  }, '#5a4a3a', PALETTE.outline, 1.5);
  
  // Right leg
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.rect(1 + legSpread * 0.5, -4, 4, 8);
  }, '#5a4a3a', PALETTE.outline, 1.5);

  // Boots
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.rect(-6 - legSpread * 0.5, 2, 5, 3);
  }, PALETTE.woodDark, PALETTE.outline, 1);
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.rect(1 + legSpread * 0.5, 2, 5, 3);
  }, PALETTE.woodDark, PALETTE.outline, 1);

  // Body
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(-7, -4 + walkBob);
    ctx.lineTo(-8, -18 + walkBob + breathe);
    ctx.quadraticCurveTo(0, -20 + walkBob + breathe, 8, -18 + walkBob + breathe);
    ctx.lineTo(7, -4 + walkBob);
    ctx.closePath();
  }, '#c84030', PALETTE.outline, 2); // Red vest

  // Shirt
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.rect(-5, -16 + walkBob + breathe, 10, 8);
  }, PALETTE.shirtWhite, PALETTE.outline, 1);

  // Belt
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(-7, -6 + walkBob, 14, 3);
  ctx.strokeStyle = PALETTE.outline;
  ctx.lineWidth = 1;
  ctx.strokeRect(-7, -6 + walkBob, 14, 3);

  // Belt buckle
  ctx.fillStyle = PALETTE.uiGold;
  ctx.fillRect(-2, -6 + walkBob, 4, 3);

  // Arms
  const armSwing = animationState === 'walking' ? Math.sin(frame * 0.8) * 8 : 0;
  
  // Left arm
  ctx.save();
  ctx.translate(-8, -14 + walkBob + breathe);
  ctx.rotate((-15 + armSwing) * Math.PI / 180);
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.rect(-2, 0, 4, 12);
  }, '#c84030', PALETTE.outline, 1.5);
  // Hand
  ctx.fillStyle = PALETTE.skinLight;
  ctx.strokeStyle = PALETTE.outline;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 12, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Right arm
  ctx.save();
  ctx.translate(8, -14 + walkBob + breathe);
  ctx.rotate((15 - armSwing) * Math.PI / 180);
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.rect(-2, 0, 4, 12);
  }, '#c84030', PALETTE.outline, 1.5);
  ctx.fillStyle = PALETTE.skinLight;
  ctx.strokeStyle = PALETTE.outline;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 12, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Head
  const headY = -24 + walkBob + breathe;
  drawOutlinedShape(ctx, () => {
    drawEllipse(ctx, 0, headY, 8, 9);
  }, PALETTE.skinLight, PALETTE.outline, 2);

  // Hair
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(-8, headY - 2);
    ctx.quadraticCurveTo(-9, headY - 10, -2, headY - 11);
    ctx.quadraticCurveTo(0, headY - 12, 2, headY - 11);
    ctx.quadraticCurveTo(9, headY - 10, 8, headY - 2);
    ctx.quadraticCurveTo(6, headY - 5, 0, headY - 4);
    ctx.quadraticCurveTo(-6, headY - 5, -8, headY - 2);
    ctx.closePath();
  }, PALETTE.hairBrown, PALETTE.outline, 1.5);

  // Face based on direction
  if (direction === 'down' || direction === 'left' || direction === 'right') {
    const faceOffsetX = direction === 'left' ? -2 : direction === 'right' ? 2 : 0;
    
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(-3 + faceOffsetX, headY - 1, 2.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(3 + faceOffsetX, headY - 1, 2.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    const blinkOffset = Math.sin(time * 0.001) > 0.98 ? 1.5 : 0;
    ctx.fillStyle = '#2a2020';
    ctx.beginPath();
    ctx.arc(-3 + faceOffsetX * 0.5, headY - 1 + blinkOffset, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3 + faceOffsetX * 0.5, headY - 1 + blinkOffset, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = PALETTE.outline;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(faceOffsetX, headY + 3, 2, 0, Math.PI);
    ctx.stroke();
  } else {
    // Back of head - just hair
    drawOutlinedShape(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(-8, headY + 2);
      ctx.quadraticCurveTo(-9, headY - 10, 0, headY - 12);
      ctx.quadraticCurveTo(9, headY - 10, 8, headY + 2);
      ctx.closePath();
    }, PALETTE.hairBrown, PALETTE.outline, 1.5);
  }

  // Backpack (always visible from side/back)
  if (direction === 'up' || direction === 'left' || direction === 'right') {
    const bpX = direction === 'left' ? 4 : direction === 'right' ? -4 : 0;
    drawOutlinedShape(ctx, () => {
      drawRoundedRect(ctx, bpX - 5, -16 + walkBob + breathe, 10, 12, 2);
    }, PALETTE.woodMedium, PALETTE.outline, 1.5);
    
    // Buckle
    ctx.fillStyle = PALETTE.uiGold;
    ctx.fillRect(bpX - 2, -14 + walkBob + breathe, 4, 2);
  }

  ctx.restore();
}

// --- NPC CHARACTER ---
export function drawNPC(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  appearance: NPCAppearance,
  direction: Direction,
  time: number,
  hasQuest: boolean = false,
  interactionIndicator: boolean = false
) {
  ctx.save();
  ctx.translate(x, y);

  const breathe = Math.sin(time * 0.003 + x * 0.01) * 0.5;
  const heightMod = appearance.height === 'short' ? 0.85 : appearance.height === 'tall' ? 1.15 : 1;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  drawEllipse(ctx, 0, 2, 10, 4);
  ctx.fill();

  // Body (scaled by height)
  ctx.save();
  ctx.scale(1, heightMod);

  // Outfit
  const outfitY = -18 + breathe;
  drawOutlinedShape(ctx, () => {
    if (appearance.outfitType === 'robe') {
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.lineTo(-10, outfitY);
      ctx.quadraticCurveTo(0, outfitY - 3, 10, outfitY);
      ctx.lineTo(9, 0);
      ctx.closePath();
    } else if (appearance.outfitType === 'dress') {
      ctx.beginPath();
      ctx.moveTo(-12, 4);
      ctx.lineTo(-8, outfitY);
      ctx.quadraticCurveTo(0, outfitY - 3, 8, outfitY);
      ctx.lineTo(12, 4);
      ctx.closePath();
    } else {
      ctx.beginPath();
      ctx.moveTo(-7, -2);
      ctx.lineTo(-8, outfitY);
      ctx.quadraticCurveTo(0, outfitY - 2, 8, outfitY);
      ctx.lineTo(7, -2);
      ctx.closePath();
    }
  }, appearance.outfitColor, PALETTE.outline, 2);

  // Head
  const headY = -24 + breathe;
  drawOutlinedShape(ctx, () => {
    drawEllipse(ctx, 0, headY, 8, 9);
  }, appearance.skinColor, PALETTE.outline, 2);

  // Hair
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    if (appearance.hairStyle === 'long') {
      ctx.moveTo(-9, headY + 4);
      ctx.quadraticCurveTo(-10, headY - 10, 0, headY - 12);
      ctx.quadraticCurveTo(10, headY - 10, 9, headY + 4);
      ctx.lineTo(8, headY + 8);
      ctx.quadraticCurveTo(0, headY + 6, -8, headY + 8);
    } else if (appearance.hairStyle === 'bun') {
      ctx.moveTo(-8, headY - 2);
      ctx.quadraticCurveTo(-9, headY - 10, 0, headY - 11);
      ctx.quadraticCurveTo(9, headY - 10, 8, headY - 2);
      ctx.quadraticCurveTo(6, headY - 5, 0, headY - 4);
      ctx.quadraticCurveTo(-6, headY - 5, -8, headY - 2);
      // Bun
      ctx.moveTo(3, headY - 12);
      ctx.arc(0, headY - 14, 4, 0, Math.PI * 2);
    } else if (appearance.hairStyle === 'curly') {
      ctx.moveTo(-9, headY);
      for (let i = 0; i < 8; i++) {
        const angle = -Math.PI / 2 + (Math.PI / 7) * i;
        const r = 10 + Math.sin(i * 1.5) * 2;
        ctx.lineTo(Math.cos(angle) * r, headY - 3 + Math.sin(angle) * r);
      }
    } else if (appearance.hairStyle === 'bald') {
      // No hair
      ctx.moveTo(0, headY - 9);
    } else {
      // Short
      ctx.moveTo(-8, headY - 2);
      ctx.quadraticCurveTo(-9, headY - 10, 0, headY - 11);
      ctx.quadraticCurveTo(9, headY - 10, 8, headY - 2);
      ctx.quadraticCurveTo(6, headY - 5, 0, headY - 4);
      ctx.quadraticCurveTo(-6, headY - 5, -8, headY - 2);
    }
    ctx.closePath();
  }, appearance.hairColor, PALETTE.outline, 1.5);

  // Face
  if (direction !== 'up') {
    const faceX = direction === 'left' ? -2 : direction === 'right' ? 2 : 0;
    
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(-3 + faceX, headY - 1, 2.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(3 + faceX, headY - 1, 2.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2a2020';
    ctx.beginPath();
    ctx.arc(-3 + faceX * 0.3, headY - 1, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3 + faceX * 0.3, headY - 1, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = PALETTE.outline;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(faceX * 0.5, headY + 3, 2, 0.1, Math.PI - 0.1);
    ctx.stroke();

    // Accessory
    if (appearance.accessory === 'glasses') {
      ctx.strokeStyle = PALETTE.woodDark;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(-3 + faceX, headY - 1, 3.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(3 + faceX, headY - 1, 3.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0.5 + faceX, headY - 1);
      ctx.lineTo(-0.5 + faceX, headY - 1);
      ctx.stroke();
    } else if (appearance.accessory === 'hat') {
      drawOutlinedShape(ctx, () => {
        ctx.beginPath();
        ctx.ellipse(0, headY - 10, 12, 3, 0, 0, Math.PI * 2);
        ctx.rect(-7, headY - 18, 14, 8);
      }, appearance.hairColor === PALETTE.hairBrown ? '#8a6a40' : '#4a4a5a', PALETTE.outline, 1.5);
    }
  }

  ctx.restore(); // height scale

  // Quest indicator
  if (hasQuest) {
    const bobY = Math.sin(time * 0.005) * 3;
    ctx.fillStyle = PALETTE.uiGold;
    ctx.strokeStyle = PALETTE.outline;
    ctx.lineWidth = 2;
    ctx.font = 'bold 14px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Exclamation bg
    ctx.beginPath();
    ctx.arc(0, -40 * heightMod + bobY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = PALETTE.outline;
    ctx.fillText('!', 0, -40 * heightMod + bobY);
  }

  // Interaction indicator (E key)
  if (interactionIndicator) {
    const bobY = Math.sin(time * 0.004) * 2;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    drawRoundedRect(ctx, -10, -50 * heightMod + bobY, 20, 16, 4);
    ctx.fill();
    ctx.fillStyle = PALETTE.uiCream;
    ctx.font = 'bold 10px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('E', 0, -42 * heightMod + bobY);
  }

  ctx.restore();
}

// --- PORTRAIT DRAWING ---
export function drawPortrait(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number,
  appearance: NPCAppearance | null,
  isPlayer: boolean = false,
  emotion: string = 'neutral'
) {
  ctx.save();
  ctx.translate(x, y);

  // Frame
  const gradient = ctx.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, PALETTE.uiGold);
  gradient.addColorStop(1, PALETTE.uiGoldDark);
  
  ctx.fillStyle = gradient;
  drawRoundedRect(ctx, 0, 0, size, size, 8);
  ctx.fill();

  // Inner bg
  ctx.fillStyle = '#2a3040';
  drawRoundedRect(ctx, 3, 3, size - 6, size - 6, 6);
  ctx.fill();

  // Character face
  ctx.save();
  ctx.beginPath();
  drawRoundedRect(ctx, 3, 3, size - 6, size - 6, 6);
  ctx.clip();

  const cx = size / 2;
  const cy = size * 0.55;
  const faceScale = size / 60;

  ctx.translate(cx, cy);
  ctx.scale(faceScale, faceScale);

  const skinColor = isPlayer ? PALETTE.skinLight : (appearance?.skinColor || PALETTE.skinMedium);
  const hairColor = isPlayer ? PALETTE.hairBrown : (appearance?.hairColor || PALETTE.hairBlack);

  // Neck/shoulders
  ctx.fillStyle = isPlayer ? '#c84030' : (appearance?.outfitColor || '#4a6a8a');
  ctx.strokeStyle = PALETTE.outline;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-20, 15);
  ctx.quadraticCurveTo(-15, 5, -5, 8);
  ctx.lineTo(5, 8);
  ctx.quadraticCurveTo(15, 5, 20, 15);
  ctx.lineTo(20, 25);
  ctx.lineTo(-20, 25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Head
  drawOutlinedShape(ctx, () => {
    drawEllipse(ctx, 0, -5, 14, 16);
  }, skinColor, PALETTE.outline, 2);

  // Hair
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(-14, -8);
    ctx.quadraticCurveTo(-15, -22, 0, -23);
    ctx.quadraticCurveTo(15, -22, 14, -8);
    ctx.quadraticCurveTo(10, -12, 0, -11);
    ctx.quadraticCurveTo(-10, -12, -14, -8);
    ctx.closePath();
  }, hairColor, PALETTE.outline, 1.5);

  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(-5, -6, 4, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(5, -6, 4, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = '#2a2020';
  ctx.beginPath();
  ctx.arc(-4, -6, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(6, -6, 2, 0, Math.PI * 2);
  ctx.fill();

  // Eye shine
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-4.5, -7, 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(5.5, -7, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows
  ctx.strokeStyle = hairColor;
  ctx.lineWidth = 1.5;
  if (emotion === 'surprised') {
    ctx.beginPath();
    ctx.arc(-5, -11, 4, Math.PI + 0.3, -0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(5, -11, 4, Math.PI + 0.3, -0.3);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-8, -10);
    ctx.lineTo(-2, -11);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2, -11);
    ctx.lineTo(8, -10);
    ctx.stroke();
  }

  // Mouth
  ctx.strokeStyle = PALETTE.outline;
  ctx.lineWidth = 1.2;
  if (emotion === 'happy') {
    ctx.beginPath();
    ctx.arc(0, 2, 4, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else if (emotion === 'sad') {
    ctx.beginPath();
    ctx.arc(0, 6, 4, Math.PI + 0.3, -0.3);
    ctx.stroke();
  } else if (emotion === 'surprised') {
    ctx.beginPath();
    ctx.ellipse(0, 3, 3, 4, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-3, 2);
    ctx.quadraticCurveTo(0, 4, 3, 2);
    ctx.stroke();
  }

  // Accessory
  if (appearance?.accessory === 'glasses') {
    ctx.strokeStyle = '#4a4a5a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(-5, -6, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(5, -6, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(0, -6);
    ctx.stroke();
  }

  ctx.restore(); // clip

  // Outer frame border
  ctx.strokeStyle = PALETTE.outline;
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 0, 0, size, size, 8);
  ctx.stroke();

  ctx.restore();
}

// --- COLLECTIBLE / SPARKLE ---
export function drawCollectible(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  type: 'atlas_page' | 'artifact' | 'key' | 'orb',
  time: number
) {
  ctx.save();
  ctx.translate(x, y);

  const bob = Math.sin(time * 0.004) * 3;
  const glow = 0.3 + Math.sin(time * 0.006) * 0.15;

  // Glow effect
  const gradient = ctx.createRadialGradient(0, bob, 2, 0, bob, 20);
  gradient.addColorStop(0, `rgba(232, 200, 64, ${glow})`);
  gradient.addColorStop(1, 'rgba(232, 200, 64, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, bob, 20, 0, Math.PI * 2);
  ctx.fill();

  // Sparkle particles
  for (let i = 0; i < 4; i++) {
    const angle = time * 0.002 + i * Math.PI / 2;
    const dist = 10 + Math.sin(time * 0.005 + i) * 3;
    const sx = Math.cos(angle) * dist;
    const sy = Math.sin(angle) * dist + bob;
    const sparkleAlpha = 0.5 + Math.sin(time * 0.008 + i * 2) * 0.3;
    ctx.fillStyle = `rgba(255, 230, 120, ${sparkleAlpha})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  if (type === 'atlas_page') {
    // Scroll/page
    drawOutlinedShape(ctx, () => {
      ctx.beginPath();
      ctx.rect(-8, -10 + bob, 16, 20);
    }, PALETTE.parchment, PALETTE.outline, 1.5);
    // Lines on page
    ctx.strokeStyle = PALETTE.parchmentDark;
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-5, -5 + i * 5 + bob);
      ctx.lineTo(5, -5 + i * 5 + bob);
      ctx.stroke();
    }
    // Wax seal
    ctx.fillStyle = PALETTE.flowerRed;
    ctx.beginPath();
    ctx.arc(0, 8 + bob, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'key') {
    drawOutlinedShape(ctx, () => {
      ctx.beginPath();
      ctx.arc(0, -5 + bob, 5, 0, Math.PI * 2);
      ctx.rect(-1.5, 0 + bob, 3, 12);
      ctx.rect(-4, 8 + bob, 3, 3);
      ctx.rect(1, 6 + bob, 3, 3);
    }, PALETTE.uiGold, PALETTE.outline, 1.5);
  } else if (type === 'orb') {
    drawOutlinedShape(ctx, () => {
      ctx.beginPath();
      ctx.arc(0, bob, 8, 0, Math.PI * 2);
    }, PALETTE.uiBlue, PALETTE.outline, 2);
    // Inner glow
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(-2, -3 + bob, 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Generic artifact
    drawOutlinedShape(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(0, -10 + bob);
      ctx.lineTo(8, -2 + bob);
      ctx.lineTo(5, 8 + bob);
      ctx.lineTo(-5, 8 + bob);
      ctx.lineTo(-8, -2 + bob);
      ctx.closePath();
    }, PALETTE.uiGold, PALETTE.outline, 2);
    // Gem
    ctx.fillStyle = PALETTE.flowerRed;
    ctx.beginPath();
    ctx.arc(0, 0 + bob, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// --- SIGN POST ---
export function drawSignPost(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  text: string,
  scale: number = 1
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Post shadow
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  drawEllipse(ctx, 0, 2, 6, 3);
  ctx.fill();

  // Post
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.rect(-3, -35, 6, 38);
  }, PALETTE.woodMedium, PALETTE.outline, 1.5);

  // Sign board
  const signW = Math.max(50, text.length * 7 + 20);
  drawOutlinedShape(ctx, () => {
    drawRoundedRect(ctx, -signW / 2, -40, signW, 18, 3);
  }, PALETTE.woodLight, PALETTE.outline, 2);

  // Text
  ctx.fillStyle = PALETTE.outline;
  ctx.font = 'bold 9px Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, -31);

  ctx.restore();
}

// --- BOOKSHELF ---
export function drawBookshelf(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number = 1
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Main shelf
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.rect(-25, -60, 50, 60);
  }, PALETTE.woodMedium, PALETTE.outline, 2);

  // Shelves
  for (let i = 0; i < 3; i++) {
    const shelfY = -15 - i * 18;
    ctx.fillStyle = PALETTE.woodDark;
    ctx.fillRect(-24, shelfY, 48, 3);

    // Books
    const bookColors = [
      PALETTE.cloakRed, PALETTE.cloakBlue, PALETTE.cloakGreen,
      PALETTE.uiGold, '#8a4a6a', '#4a6a4a', '#6a4a2a'
    ];
    let bx = -22;
    while (bx < 20) {
      const bw = 4 + Math.random() * 4;
      const bh = 12 + Math.random() * 4;
      const color = bookColors[Math.floor(Math.random() * bookColors.length)];
      ctx.fillStyle = color;
      ctx.strokeStyle = PALETTE.outline;
      ctx.lineWidth = 0.8;
      ctx.fillRect(bx, shelfY - bh, bw, bh);
      ctx.strokeRect(bx, shelfY - bh, bw, bh);
      bx += bw + 1;
    }
  }

  // Top trim
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.rect(-27, -63, 54, 5);
  }, PALETTE.woodDark, PALETTE.outline, 1.5);

  ctx.restore();
}

// --- CHUNKY 3D ILLUSTRATED GAME LOGO (Lost Legends Style) ---
export function drawGameLogo(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number = 1
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 1. ESPAÑA (Chunky 3D Gold with Dark Outline)
  ctx.font = '900 32px "Nunito", "MedievalSharp", cursive, sans-serif';

  // 3D Extrusion Shadow (black/dark brown offset layers)
  for (let offset = 6; offset >= 1; offset--) {
    ctx.strokeStyle = '#1a1006';
    ctx.lineWidth = 8;
    ctx.strokeText('ESPAÑA', 0, -10 + offset);
    ctx.fillStyle = '#7a3e0b';
    ctx.fillText('ESPAÑA', 0, -10 + offset);
  }

  // Heavy Outer Dark Outline
  ctx.strokeStyle = '#180e04';
  ctx.lineWidth = 7;
  ctx.lineJoin = 'round';
  ctx.strokeText('ESPAÑA', 0, -10);

  // Gradient Face (Bright Golden Yellow)
  const gradTop = ctx.createLinearGradient(0, -26, 0, 4);
  gradTop.addColorStop(0, '#fff382');
  gradTop.addColorStop(0.3, '#f5b722');
  gradTop.addColorStop(0.8, '#d97706');
  gradTop.addColorStop(1, '#b45309');
  ctx.fillStyle = gradTop;
  ctx.fillText('ESPAÑA', 0, -10);

  // Top specular highlight line
  ctx.fillStyle = '#fffdf0';
  ctx.font = '900 30px "Nunito", "MedievalSharp", cursive, sans-serif';
  ctx.fillText('ESPAÑA', 0, -12);
  ctx.fillStyle = gradTop;
  ctx.fillText('ESPAÑA', 0, -10);

  // 2. EXPLORER (Chunky White / Cream with 3D Depth)
  ctx.font = '900 24px "Nunito", "MedievalSharp", cursive, sans-serif';

  // 3D Extrusion Shadow for EXPLORER
  for (let offset = 5; offset >= 1; offset--) {
    ctx.strokeStyle = '#140c06';
    ctx.lineWidth = 7;
    ctx.strokeText('EXPLORER', 0, 18 + offset);
    ctx.fillStyle = '#3a2e38';
    ctx.fillText('EXPLORER', 0, 18 + offset);
  }

  // Heavy Outer Dark Outline
  ctx.strokeStyle = '#140c06';
  ctx.lineWidth = 6;
  ctx.lineJoin = 'round';
  ctx.strokeText('EXPLORER', 0, 18);

  // Crisp White / Cream Face
  const gradBot = ctx.createLinearGradient(0, 8, 0, 28);
  gradBot.addColorStop(0, '#ffffff');
  gradBot.addColorStop(0.6, '#f3f4f6');
  gradBot.addColorStop(1, '#d1d5db');
  ctx.fillStyle = gradBot;
  ctx.fillText('EXPLORER', 0, 18);

  ctx.restore();
}

// --- GLOWING PORTAL IN ROCKY CAVE (From Reference Screenshot) ---
export function drawGlowingPortal(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number = 1,
  time: number = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Surrounding rock formation
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(-50, 20);
    ctx.lineTo(-45, -30);
    ctx.quadraticCurveTo(-40, -60, -10, -65);
    ctx.quadraticCurveTo(10, -70, 35, -55);
    ctx.lineTo(50, -25);
    ctx.lineTo(55, 20);
    ctx.closePath();
  }, '#7a8276', '#222820', 3);

  // Secondary rock facets
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(-35, 15);
    ctx.lineTo(-30, -25);
    ctx.lineTo(-10, -50);
    ctx.lineTo(-5, 10);
    ctx.closePath();
  }, '#929c8e', '#222820', 2);

  // Cave opening (dark interior)
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(-22, 18);
    ctx.lineTo(-20, -20);
    ctx.quadraticCurveTo(0, -42, 20, -20);
    ctx.lineTo(22, 18);
    ctx.closePath();
  }, '#1c1426', '#222820', 2.5);

  // Glowing energy vortex
  const pulse = Math.sin(time * 0.004) * 0.15 + 0.85;
  const grad = ctx.createRadialGradient(0, -10, 2, 0, -10, 26);
  grad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * pulse})`);
  grad.addColorStop(0.35, `rgba(224, 120, 255, ${0.8 * pulse})`);
  grad.addColorStop(0.7, `rgba(147, 51, 234, ${0.6 * pulse})`);
  grad.addColorStop(1, 'rgba(88, 28, 135, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, -10, 18, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  // Floating portal sparkles
  for (let i = 0; i < 5; i++) {
    const angle = time * 0.003 + (i * Math.PI) / 2.5;
    const dist = 8 + Math.sin(time * 0.005 + i) * 6;
    const sx = Math.cos(angle) * dist * 0.7;
    const sy = -10 + Math.sin(angle) * dist;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Stone steps leading up to portal
  const steps = [
    { x: -14, y: 14, w: 28, h: 6 },
    { x: -18, y: 20, w: 36, h: 7 },
    { x: -22, y: 27, w: 44, h: 8 },
  ];
  steps.forEach((s) => {
    drawOutlinedShape(ctx, () => {
      drawRoundedRect(ctx, s.x, s.y, s.w, s.h, 2);
    }, '#9ea399', '#222820', 2);
  });

  ctx.restore();
}

// --- BUBBLING CAULDRON (From Reference Screenshot & Asset Sheet) ---
export function drawCauldron(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number = 1,
  time: number = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Cast iron cauldron shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  drawEllipse(ctx, 0, 16, 22, 6);
  ctx.fill();

  // Iron legs
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.rect(-16, 8, 4, 10);
    ctx.rect(12, 8, 4, 10);
    ctx.rect(-2, 10, 4, 8);
  }, '#2a2a2e', '#141416', 2);

  // Cauldron belly
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI);
    ctx.closePath();
  }, '#3f3f46', '#141416', 2.5);

  // Cauldron rim
  drawOutlinedShape(ctx, () => {
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 6, 0, 0, Math.PI * 2);
  }, '#52525b', '#141416', 2.5);

  // Glowing magical liquid surface
  const brewPulse = Math.sin(time * 0.005) * 0.2 + 0.8;
  const brewGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 18);
  brewGrad.addColorStop(0, '#bef264');
  brewGrad.addColorStop(0.6, '#65a30d');
  brewGrad.addColorStop(1, '#365314');
  ctx.fillStyle = brewGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 17, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Floating green bubbles
  for (let i = 0; i < 4; i++) {
    const bx = Math.sin(time * 0.004 + i * 2) * 12;
    const by = -6 - ((time * 0.03 + i * 8) % 24);
    const bSize = 2.5 + Math.sin(i) * 1;
    ctx.fillStyle = `rgba(190, 242, 100, ${brewPulse * 0.8})`;
    ctx.strokeStyle = '#141416';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(bx, by, bSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

// --- NATURAL STONE SPRING POOL (From Reference Screenshot) ---
export function drawStonePool(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number = 1,
  time: number = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  drawEllipse(ctx, 0, 6, 42, 22);
  ctx.fill();

  // Surrounding stone ring (irregular rocks)
  const rockCoords = [
    { x: -32, y: 0, r: 12 },
    { x: -24, y: -14, r: 13 },
    { x: 0, y: -18, r: 14 },
    { x: 24, y: -13, r: 13 },
    { x: 32, y: 2, r: 12 },
    { x: 22, y: 14, r: 13 },
    { x: 0, y: 16, r: 14 },
    { x: -22, y: 12, r: 13 },
  ];
  rockCoords.forEach((r) => {
    drawOutlinedShape(ctx, () => {
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
    }, '#a8a29e', '#292524', 2);
  });

  // Inner water basin
  const waterGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 24);
  waterGrad.addColorStop(0, '#7dd3fc');
  waterGrad.addColorStop(0.7, '#0284c7');
  waterGrad.addColorStop(1, '#0369a1');
  ctx.fillStyle = waterGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Bright cross-sparkle highlight (like in reference!)
  const sparklePhase = (time * 0.003) % (Math.PI * 2);
  const sparkleScale = Math.sin(sparklePhase) * 0.4 + 0.8;
  ctx.save();
  ctx.translate(-8, -2);
  ctx.scale(sparkleScale, sparkleScale);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  // 4-point star glint
  ctx.moveTo(0, -9);
  ctx.quadraticCurveTo(0, 0, 9, 0);
  ctx.quadraticCurveTo(0, 0, 0, 9);
  ctx.quadraticCurveTo(0, 0, -9, 0);
  ctx.quadraticCurveTo(0, 0, 0, -9);
  ctx.fill();
  ctx.restore();

  // Little white daisy flower on edge (like in reference!)
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 5; i++) {
    const fa = (i * Math.PI * 2) / 5;
    ctx.beginPath();
    ctx.arc(28 + Math.cos(fa) * 3, 8 + Math.sin(fa) * 3, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(28, 8, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// --- WOODEN BRIDGE WITH ROPE (From Reference Screenshot) ---
export function drawBridge(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  width: number = 80,
  height: number = 36
) {
  ctx.save();
  ctx.translate(x, y);

  // Planks
  const plankCount = 6;
  const plankW = width / plankCount;
  for (let i = 0; i < plankCount; i++) {
    const px = i * plankW;
    drawOutlinedShape(ctx, () => {
      ctx.beginPath();
      ctx.rect(px + 1, 0, plankW - 2, height);
    }, i % 2 === 0 ? '#78350f' : '#92400e', '#1c1917', 2);
  }

  // Wooden posts on ends with rope ties
  const posts = [
    { x: 4, y: -6 },
    { x: width - 4, y: -6 },
    { x: 4, y: height + 6 },
    { x: width - 4, y: height + 6 },
  ];
  posts.forEach((p) => {
    drawOutlinedShape(ctx, () => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    }, '#d97706', '#1c1917', 2);
  });

  // Top and bottom guide ropes
  ctx.strokeStyle = '#fef3c7';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(4, -4);
  ctx.quadraticCurveTo(width / 2, 0, width - 4, -4);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(4, height + 4);
  ctx.quadraticCurveTo(width / 2, height, width - 4, height + 4);
  ctx.stroke();

  ctx.restore();
}

export { drawRoundedRect, drawEllipse, drawOutlinedShape };

