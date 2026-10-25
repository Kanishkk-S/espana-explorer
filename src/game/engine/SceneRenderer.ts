// ============================================================
// ESPAÑA EXPLORER — Scene Renderer
// Canvas 2D scene renderer supporting layer ordering:
// Ground -> Static Environment -> Y-Sorted Entities -> Foreground -> Ambient Effects
// ============================================================

import {
  AreaDefinition,
  AreaExit,
  EnvironmentObject,
  InteractableObject,
  NPCDefinition,
  Player,
} from '@/types/game';
import { Camera } from './Camera';
import {
  drawBench,
  drawBookshelf,
  drawBuilding,
  drawBush,
  drawCollectible,
  drawEllipse,
  drawFlower,
  drawFountain,
  drawMarketStall,
  drawNPC,
  drawOutlinedShape,
  drawPath,
  drawPlayer,
  drawRock,
  drawRoundedRect,
  drawSignPost,
  drawStreetLamp,
  drawTree,
  drawWater,
  drawGlowingPortal,
  drawCauldron,
  drawStonePool,
  drawBridge,
  PALETTE,
} from '@/game/rendering/assetRenderer';

export class SceneRenderer {
  /**
   * Render ground layer: background color, ground textures, paths, water bodies, and exits.
   */
  public renderGround(
    ctx: CanvasRenderingContext2D,
    area: AreaDefinition,
    camera: Camera,
    time: number
  ): void {
    const screenWidth = camera.width;
    const screenHeight = camera.height;

    // 1. Fill visible viewport with area background color
    ctx.fillStyle = area.backgroundColor || PALETTE.grass;
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    // 2. Draw subtle grass / dirt texture grid if on grass background
    if (!area.backgroundColor || area.backgroundColor === PALETTE.grass) {
      this.renderGrassDetails(ctx, camera, area.width, area.height);
    }

    // 3. Draw ground-layer environment objects (paths, water, plaza tiles)
    for (const obj of area.environmentObjects) {
      if (obj.layer !== 'ground') continue;
      if (!camera.isVisible(obj.position.x, obj.position.y, obj.width, obj.height)) {
        continue;
      }

      const screenPos = camera.worldToScreen(obj.position.x, obj.position.y);
      this.renderGroundObject(ctx, obj, screenPos.x, screenPos.y, time);
    }

    // 4. Draw area exits / transitions on ground
    if (area.exits) {
      for (const exit of area.exits) {
        if (!camera.isVisible(exit.position.x, exit.position.y, exit.position.width, exit.position.height)) {
          continue;
        }
        const screenPos = camera.worldToScreen(exit.position.x, exit.position.y);
        this.renderExit(ctx, exit, screenPos.x, screenPos.y, time);
      }
    }
  }

  /**
   * Render static environment objects (ground or background elements)
   */
  public renderEnvironment(
    ctx: CanvasRenderingContext2D,
    area: AreaDefinition,
    camera: Camera,
    time: number
  ): void {
    // Render objects that are NOT y-sorted or ground-based
    for (const obj of area.environmentObjects) {
      if (obj.layer === 'ground' || obj.layer === 'objects' || obj.layer === 'foreground') {
        // 'ground' is in renderGround, 'objects' is y-sorted in renderEntities,
        // 'foreground' is in renderForeground
        continue;
      }

      if (!camera.isVisible(obj.position.x, obj.position.y, obj.width, obj.height)) {
        continue;
      }

      const screenPos = camera.worldToScreen(obj.position.x, obj.position.y);
      this.renderEnvironmentObject(ctx, obj, screenPos.x, screenPos.y, time);
    }
  }

  /**
   * Render all dynamic characters, interactables, and solid objects with Y-sorting.
   * Entities with lower base Y are drawn first (behind entities with higher base Y).
   */
  public renderEntities(
    ctx: CanvasRenderingContext2D,
    player: Player,
    npcs: NPCDefinition[],
    interactables: InteractableObject[],
    camera: Camera,
    time: number,
    closestTargetId?: string | null,
    environmentObjects?: EnvironmentObject[]
  ): void {
    interface Renderable {
      sortY: number;
      render: () => void;
    }

    const renderQueue: Renderable[] = [];

    // 1. Environment objects in the 'objects' layer (trees, buildings, rocks, lamps)
    if (environmentObjects) {
      for (const obj of environmentObjects) {
        if (obj.layer !== 'objects') continue;
        if (!camera.isVisible(obj.position.x, obj.position.y, obj.width, obj.height)) {
          continue;
        }

        const screenPos = camera.worldToScreen(obj.position.x, obj.position.y);
        // Base feet position is at bottom of object
        const sortY = obj.position.y + obj.height;

        renderQueue.push({
          sortY,
          render: () => {
            this.renderEnvironmentObject(ctx, obj, screenPos.x, screenPos.y, time);
          },
        });
      }
    }

    // 2. Interactables
    for (const obj of interactables) {
      if (obj.state === 'hidden') continue;
      if (!camera.isVisible(obj.position.x, obj.position.y, obj.width, obj.height)) {
        continue;
      }

      const screenPos = camera.worldToScreen(obj.position.x, obj.position.y);
      const isTarget = closestTargetId === obj.id;
      const sortY = obj.position.y + obj.height;

      renderQueue.push({
        sortY,
        render: () => {
          this.renderInteractable(ctx, obj, screenPos.x, screenPos.y, time, isTarget);
        },
      });
    }

    // 3. NPCs
    for (const npc of npcs) {
      // NPC bounding box is roughly 32x48
      if (!camera.isVisible(npc.position.x - 20, npc.position.y - 40, 40, 50)) {
        continue;
      }

      const screenPos = camera.worldToScreen(npc.position.x, npc.position.y);
      const isTarget = closestTargetId === npc.id;
      const hasQuest = Boolean(npc.questIds && npc.questIds.length > 0);
      const sortY = npc.position.y;

      renderQueue.push({
        sortY,
        render: () => {
          drawNPC(
            ctx,
            screenPos.x,
            screenPos.y,
            npc.appearance,
            npc.direction,
            time,
            hasQuest,
            isTarget
          );
        },
      });
    }

    // 4. Player
    if (camera.isVisible(player.position.x - 20, player.position.y - 40, 40, 50)) {
      const screenPos = camera.worldToScreen(player.position.x, player.position.y);
      const sortY = player.position.y;

      renderQueue.push({
        sortY,
        render: () => {
          drawPlayer(
            ctx,
            screenPos.x,
            screenPos.y,
            player.direction,
            player.animationState,
            player.animationFrame,
            time
          );
        },
      });
    }

    // 5. Sort by sortY ascending (feet position)
    renderQueue.sort((a, b) => a.sortY - b.sortY);

    // 6. Execute render in depth order
    for (const item of renderQueue) {
      item.render();
    }
  }

  /**
   * Render foreground objects (roofs, tree tops, arches) that always occlude characters
   */
  public renderForeground(
    ctx: CanvasRenderingContext2D,
    area: AreaDefinition,
    camera: Camera,
    time: number
  ): void {
    for (const obj of area.environmentObjects) {
      if (obj.layer !== 'foreground') continue;
      if (!camera.isVisible(obj.position.x, obj.position.y, obj.width, obj.height)) {
        continue;
      }

      const screenPos = camera.worldToScreen(obj.position.x, obj.position.y);
      this.renderEnvironmentObject(ctx, obj, screenPos.x, screenPos.y, time);
    }
  }

  /**
   * Render ambient atmospheric effects (particles, leaves, light rays, water shimmer)
   */
  public renderEffects(
    ctx: CanvasRenderingContext2D,
    area: AreaDefinition,
    camera: Camera,
    time: number
  ): void {
    // 1. Ambient particles from area definition
    if (area.ambientEffects) {
      for (const effect of area.ambientEffects) {
        if (!camera.isVisible(effect.position.x, effect.position.y, effect.width, effect.height)) {
          continue;
        }

        const screenPos = camera.worldToScreen(effect.position.x, effect.position.y);
        this.renderAmbientEffect(ctx, effect, screenPos.x, screenPos.y, time);
      }
    }

    // 2. Cinematic atmospheric vignette
    this.renderVignette(ctx, camera.width, camera.height);
  }

  /**
   * Full unified scene rendering pipeline
   */
  public renderScene(
    ctx: CanvasRenderingContext2D,
    area: AreaDefinition,
    player: Player,
    camera: Camera,
    time: number,
    closestTargetId?: string | null
  ): void {
    ctx.save();

    // 1. Ground Layer
    this.renderGround(ctx, area, camera, time);

    // 2. Static Environment (non-y-sorted)
    this.renderEnvironment(ctx, area, camera, time);

    // 3. Y-sorted Entities & Objects
    this.renderEntities(
      ctx,
      player,
      area.npcs,
      area.interactables,
      camera,
      time,
      closestTargetId,
      area.environmentObjects
    );

    // 4. Foreground
    this.renderForeground(ctx, area, camera, time);

    // 5. Ambient & Lighting Effects
    this.renderEffects(ctx, area, camera, time);

    ctx.restore();
  }

  // --- INTERNAL OBJECT DISPATCHERS ---

  private renderGroundObject(
    ctx: CanvasRenderingContext2D,
    obj: EnvironmentObject,
    sx: number,
    sy: number,
    time: number
  ): void {
    switch (obj.type) {
      case 'path':
      case 'plaza_tile':
      case 'courtyard': {
        const variant = obj.variant === 1 ? 'cobble' : obj.variant === 2 ? 'stone' : 'dirt';
        drawPath(ctx, sx, sy, obj.width, obj.height, variant);
        break;
      }

      case 'pond':
      case 'river': {
        drawWater(ctx, sx, sy, obj.width, obj.height, time);
        break;
      }

      case 'bridge': {
        this.drawBridge(ctx, sx, sy, obj.width, obj.height);
        break;
      }

      default:
        break;
    }
  }

  public renderEnvironmentObject(
    ctx: CanvasRenderingContext2D,
    obj: EnvironmentObject,
    sx: number,
    sy: number,
    time: number
  ): void {
    const scale = obj.scale ?? 1;
    const variant = obj.variant ?? 0;

    switch (obj.type) {
      case 'tree':
        drawTree(ctx, sx + obj.width / 2, sy + obj.height, scale, variant, time);
        break;

      case 'bush':
        drawBush(ctx, sx + obj.width / 2, sy + obj.height, scale, variant, time);
        break;

      case 'rock':
      case 'cliff':
        drawRock(ctx, sx + obj.width / 2, sy + obj.height, scale, variant);
        break;

      case 'flower':
        drawFlower(ctx, sx + obj.width / 2, sy + obj.height, scale, obj.tint || PALETTE.flowerRed, time);
        break;

      case 'grass':
        drawBush(ctx, sx + obj.width / 2, sy + obj.height, scale * 0.6, 0, time);
        break;

      case 'fountain':
        drawFountain(ctx, sx + obj.width / 2, sy + obj.height / 2, scale, time);
        break;

      case 'well':
        drawStonePool(ctx, sx + obj.width / 2, sy + obj.height / 2, scale, time);
        break;

      case 'portal':
        drawGlowingPortal(ctx, sx + obj.width / 2, sy + obj.height / 2, scale, time);
        break;

      case 'cauldron':
        drawCauldron(ctx, sx + obj.width / 2, sy + obj.height / 2, scale, time);
        break;

      case 'bridge':
        drawBridge(ctx, sx, sy, obj.width, obj.height);
        break;

      case 'building':
      case 'house':
      case 'shop':
      case 'library':
        drawBuilding(ctx, sx, sy + obj.height, obj.width, obj.height, {
          wallColor: obj.tint || PALETTE.adobeLight,
          roofColor: PALETTE.roofTile,
          sign: obj.id.replace(/_/g, ' ').toUpperCase(),
        });
        break;

      case 'lamp':
        drawStreetLamp(ctx, sx + obj.width / 2, sy + obj.height, scale, true, time);
        break;

      case 'bench':
        drawBench(ctx, sx + obj.width / 2, sy + obj.height, scale);
        break;

      case 'market_stall':
        drawMarketStall(ctx, sx + obj.width / 2, sy + obj.height, scale, obj.tint || PALETTE.cloakRed);
        break;

      case 'sign':
        drawSignPost(ctx, sx + obj.width / 2, sy + obj.height, obj.id.replace(/_/g, ' '), scale);
        break;

      case 'bookshelf':
        drawBookshelf(ctx, sx + obj.width / 2, sy + obj.height, scale);
        break;

      case 'pot':
        this.drawPot(ctx, sx + obj.width / 2, sy + obj.height, scale);
        break;

      case 'barrel':
        this.drawBarrel(ctx, sx + obj.width / 2, sy + obj.height, scale);
        break;

      case 'pillar':
        this.drawPillar(ctx, sx + obj.width / 2, sy + obj.height, scale, obj.height);
        break;

      case 'wall':
      case 'fence':
        this.drawWall(ctx, sx, sy, obj.width, obj.height);
        break;

      default:
        // Generic fallback box
        ctx.fillStyle = obj.tint || PALETTE.stoneDark;
        ctx.fillRect(sx, sy, obj.width, obj.height);
        break;
    }
  }

  private renderInteractable(
    ctx: CanvasRenderingContext2D,
    obj: InteractableObject,
    sx: number,
    sy: number,
    time: number,
    isTarget: boolean
  ): void {
    const cx = sx + obj.width / 2;
    const cy = sy + obj.height / 2;

    // Draw visual representation based on type / visualType
    if (obj.type === 'item_pickup') {
      const pickupType =
        obj.id.includes('key') ? 'key' :
        obj.id.includes('page') || obj.id.includes('atlas') ? 'atlas_page' :
        obj.id.includes('orb') ? 'orb' : 'artifact';

      drawCollectible(ctx, cx, cy, pickupType, time);
    } else {
      // Draw environment object visual
      const dummyEnv: EnvironmentObject = {
        id: obj.id,
        type: obj.visualType || 'market_stall',
        position: { x: 0, y: 0 },
        width: obj.width,
        height: obj.height,
        zIndex: obj.zIndex,
        layer: 'objects',
      };
      this.renderEnvironmentObject(ctx, dummyEnv, sx, sy, time);

      // Sparkle glow if flagged
      if (obj.sparkle && obj.state === 'available') {
        const pulse = 0.4 + Math.sin(time * 0.005) * 0.2;
        ctx.save();
        ctx.fillStyle = `rgba(212, 168, 64, ${pulse})`;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(obj.width, obj.height) * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Floating interaction prompt when player is closest
    if (isTarget && obj.state !== 'used') {
      const bob = Math.sin(time * 0.005) * 3;
      const promptY = sy - 14 + bob;

      ctx.save();
      ctx.fillStyle = 'rgba(26, 20, 16, 0.88)';
      ctx.strokeStyle = PALETTE.uiGold;
      ctx.lineWidth = 1.5;
      drawRoundedRect(ctx, cx - 14, promptY - 10, 28, 20, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = PALETTE.uiCream;
      ctx.font = 'bold 11px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('E', cx, promptY);
      ctx.restore();
    }
  }

  private renderExit(
    ctx: CanvasRenderingContext2D,
    exit: AreaExit,
    sx: number,
    sy: number,
    time: number
  ): void {
    const pulse = 0.3 + Math.sin(time * 0.004) * 0.15;

    ctx.save();
    // Portal / gateway border
    ctx.fillStyle = `rgba(212, 168, 64, ${pulse})`;
    ctx.strokeStyle = PALETTE.uiGold;
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, sx, sy, exit.position.width, exit.position.height, 6);
    ctx.fill();
    ctx.stroke();

    // Directional chevron or label
    if (exit.label) {
      ctx.fillStyle = PALETTE.uiCream;
      ctx.font = 'bold 10px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        exit.label,
        sx + exit.position.width / 2,
        sy + exit.position.height / 2
      );
    }
    ctx.restore();
  }

  private renderAmbientEffect(
    ctx: CanvasRenderingContext2D,
    effect: { type: string; intensity: number; width: number; height: number; color?: string },
    sx: number,
    sy: number,
    time: number
  ): void {
    ctx.save();

    if (effect.type === 'sparkle' || effect.type === 'particle') {
      const count = Math.floor(effect.intensity * 8);
      ctx.fillStyle = effect.color || PALETTE.uiGoldLight;

      for (let i = 0; i < count; i++) {
        const px = sx + ((Math.sin(time * 0.001 + i * 2.3) + 1) / 2) * effect.width;
        const py = sy + ((Math.cos(time * 0.0012 + i * 1.7) + 1) / 2) * effect.height;
        const alpha = 0.3 + Math.sin(time * 0.005 + i) * 0.3;

        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.beginPath();
        ctx.arc(px, py, 1.5 + (i % 2), 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (effect.type === 'leaves') {
      const count = Math.floor(effect.intensity * 5);
      const leafColors = [PALETTE.treeDark, PALETTE.treeMedium, PALETTE.leafYellow, PALETTE.leafOrange];

      for (let i = 0; i < count; i++) {
        const lx = sx + ((time * 0.03 + i * 80) % effect.width);
        const ly = sy + ((time * 0.02 + i * 60) % effect.height);
        const sway = Math.sin(time * 0.003 + i) * 8;

        ctx.fillStyle = leafColors[i % leafColors.length];
        ctx.beginPath();
        ctx.ellipse(lx + sway, ly, 4, 2, Math.sin(time * 0.002 + i), 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (effect.type === 'light_ray') {
      // Soft angled sunbeam
      const gradient = ctx.createLinearGradient(sx, sy, sx + effect.width, sy + effect.height);
      gradient.addColorStop(0, 'rgba(255, 240, 200, 0.15)');
      gradient.addColorStop(1, 'rgba(255, 240, 200, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + effect.width * 0.4, sy);
      ctx.lineTo(sx + effect.width, sy + effect.height);
      ctx.lineTo(sx + effect.width * 0.6, sy + effect.height);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  private renderGrassDetails(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    areaWidth: number,
    areaHeight: number
  ): void {
    ctx.save();
    ctx.fillStyle = PALETTE.grassDark;
    ctx.globalAlpha = 0.25;

    // Deterministic grass tufts in view
    const spacing = 120;
    const startCol = Math.max(0, Math.floor(camera.x / spacing));
    const endCol = Math.min(Math.ceil(areaWidth / spacing), Math.floor((camera.x + camera.width) / spacing) + 1);
    const startRow = Math.max(0, Math.floor(camera.y / spacing));
    const endRow = Math.min(Math.ceil(areaHeight / spacing), Math.floor((camera.y + camera.height) / spacing) + 1);

    for (let r = startRow; r < endRow; r++) {
      for (let c = startCol; c < endCol; c++) {
        const wx = c * spacing + ((r * 37) % 50);
        const wy = r * spacing + ((c * 43) % 40);
        const screenPos = camera.worldToScreen(wx, wy);

        // Draw small blade of grass
        ctx.beginPath();
        ctx.moveTo(screenPos.x, screenPos.y);
        ctx.lineTo(screenPos.x - 2, screenPos.y - 6);
        ctx.lineTo(screenPos.x + 2, screenPos.y - 7);
        ctx.lineTo(screenPos.x + 4, screenPos.y);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  private renderVignette(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.max(width, height) * 0.7;

    const grad = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(20, 15, 10, 0.35)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // --- ADDITIONAL PROCEDURAL ASSETS ---

  private drawBridge(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.save();
    ctx.fillStyle = PALETTE.woodDark;
    drawRoundedRect(ctx, x, y, w, h, 4);
    ctx.fill();

    // Wooden planks
    ctx.strokeStyle = PALETTE.woodMedium;
    ctx.lineWidth = 1.5;
    for (let px = x + 6; px < x + w - 4; px += 8) {
      ctx.beginPath();
      ctx.moveTo(px, y + 2);
      ctx.lineTo(px, y + h - 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawPot(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    drawEllipse(ctx, 0, 2, 7, 3);
    ctx.fill();

    drawOutlinedShape(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(-6, -14);
      ctx.quadraticCurveTo(-10, -8, -6, 0);
      ctx.lineTo(6, 0);
      ctx.quadraticCurveTo(10, -8, 6, -14);
      ctx.closePath();
    }, PALETTE.terracotta, PALETTE.outline, 1.5);

    // Rim
    drawOutlinedShape(ctx, () => {
      drawEllipse(ctx, 0, -14, 7, 2.5);
    }, PALETTE.terracottaLight, PALETTE.outline, 1.5);

    ctx.restore();
  }

  private drawBarrel(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    drawEllipse(ctx, 0, 2, 9, 3);
    ctx.fill();

    drawOutlinedShape(ctx, () => {
      ctx.beginPath();
      ctx.moveTo(-7, -18);
      ctx.quadraticCurveTo(-10, -9, -7, 0);
      ctx.lineTo(7, 0);
      ctx.quadraticCurveTo(10, -9, 7, -18);
      ctx.closePath();
    }, PALETTE.woodMedium, PALETTE.outline, 1.5);

    // Metal hoops
    ctx.strokeStyle = PALETTE.stoneDark;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-8.5, -13);
    ctx.lineTo(8.5, -13);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-8.5, -5);
    ctx.lineTo(8.5, -5);
    ctx.stroke();

    ctx.restore();
  }

  private drawPillar(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, height: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Base
    drawOutlinedShape(ctx, () => {
      ctx.beginPath();
      ctx.rect(-8, -6, 16, 6);
    }, PALETTE.stoneLight, PALETTE.outline, 1.5);

    // Column shaft
    drawOutlinedShape(ctx, () => {
      ctx.beginPath();
      ctx.rect(-6, -height + 6, 12, height - 12);
    }, PALETTE.stone, PALETTE.outline, 1.5);

    // Capital
    drawOutlinedShape(ctx, () => {
      ctx.beginPath();
      ctx.rect(-9, -height, 18, 6);
    }, PALETTE.stoneLight, PALETTE.outline, 1.5);

    ctx.restore();
  }

  private drawWall(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.save();
    drawOutlinedShape(ctx, () => {
      drawRoundedRect(ctx, x, y, w, h, 2);
    }, PALETTE.stone, PALETTE.outline, 2);

    // Brick mortar lines
    ctx.strokeStyle = PALETTE.stoneDark;
    ctx.lineWidth = 1;
    for (let rowY = y + 10; rowY < y + h; rowY += 10) {
      ctx.beginPath();
      ctx.moveTo(x + 2, rowY);
      ctx.lineTo(x + w - 2, rowY);
      ctx.stroke();
    }
    ctx.restore();
  }
}
