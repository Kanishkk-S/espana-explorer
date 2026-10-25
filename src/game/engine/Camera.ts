// ============================================================
// ESPAÑA EXPLORER — Camera System
// Smooth player-following camera with area bounds clamping
// and world/screen coordinate transformations
// ============================================================

import { Camera as ICamera, Rect, Vec2 } from '@/types/game';

export class Camera implements ICamera {
  public x: number = 0;
  public y: number = 0;
  public width: number;
  public height: number;
  public targetX: number = 0;
  public targetY: number = 0;
  public smoothing: number = 0.08;
  public bounds?: Rect;

  constructor(width: number = 800, height: number = 600, smoothing: number = 0.08) {
    this.width = width;
    this.height = height;
    this.smoothing = smoothing;
  }

  /**
   * Resize the camera viewport (e.g. on window or canvas resize)
   */
  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.clamp();
  }

  /**
   * Set world bounding rectangle for the camera.
   */
  public setBounds(bounds?: Rect | null): void {
    this.bounds = bounds || undefined;
    this.clamp();
  }

  /**
   * Set camera bounds directly from area dimensions.
   */
  public setBoundsFromArea(width: number, height: number): void {
    this.bounds = {
      x: 0,
      y: 0,
      width,
      height,
    };
    this.clamp();
  }

  /**
   * Sets the camera's target center in world coordinates.
   */
  public setTarget(targetX: number, targetY: number): void {
    this.targetX = targetX;
    this.targetY = targetY;
  }

  /**
   * Immediately snap the camera to center on a world position without smoothing.
   */
  public snapTo(worldX: number, worldY: number): void {
    this.targetX = worldX - this.width / 2;
    this.targetY = worldY - this.height / 2;
    this.x = this.targetX;
    this.y = this.targetY;
    this.clamp();
  }

  /**
   * Update camera position following player with smooth lerp and bounds clamping.
   * Uses frame-rate independent exponential decay.
   */
  public update(playerX: number, playerY: number, deltaTime: number): void {
    // Target position centers the player on screen
    this.targetX = playerX - this.width / 2;
    this.targetY = playerY - this.height / 2;

    // Delta-time independent lerp factor (at 60fps smoothing is ~0.08)
    const factor = 1 - Math.exp(-this.smoothing * 60 * Math.max(0.001, deltaTime));
    this.x += (this.targetX - this.x) * factor;
    this.y += (this.targetY - this.y) * factor;

    this.clamp();
  }

  /**
   * Clamps current camera position within bounds.
   */
  public clamp(): void {
    if (!this.bounds) return;

    if (this.bounds.width <= this.width) {
      // If the area is smaller than the screen, center it
      this.x = this.bounds.x + (this.bounds.width - this.width) / 2;
    } else {
      const minX = this.bounds.x;
      const maxX = this.bounds.x + this.bounds.width - this.width;
      this.x = Math.max(minX, Math.min(maxX, this.x));
    }

    if (this.bounds.height <= this.height) {
      // If the area is smaller than the screen, center it
      this.y = this.bounds.y + (this.bounds.height - this.height) / 2;
    } else {
      const minY = this.bounds.y;
      const maxY = this.bounds.y + this.bounds.height - this.height;
      this.y = Math.max(minY, Math.min(maxY, this.y));
    }
  }

  /**
   * Convert world coordinates to screen/viewport coordinates.
   */
  public worldToScreen(worldX: number, worldY: number): Vec2 {
    return {
      x: worldX - this.x,
      y: worldY - this.y,
    };
  }

  /**
   * Convert screen/viewport coordinates to world coordinates.
   */
  public screenToWorld(screenX: number, screenY: number): Vec2 {
    return {
      x: screenX + this.x,
      y: screenY + this.y,
    };
  }

  /**
   * Check if a bounding rectangle in world space is visible within the camera viewport.
   */
  public isVisible(x: number, y: number, w: number, h: number): boolean {
    return (
      x + w >= this.x &&
      x <= this.x + this.width &&
      y + h >= this.y &&
      y <= this.y + this.height
    );
  }
}
