// ============================================================
// ESPAÑA EXPLORER — Collision & Interaction System
// Handles AABB collision detection, wall sliding,
// and proximity queries for NPCs and interactable items
// ============================================================

import {
  CollisionBox,
  InteractableObject,
  NPCDefinition,
  Rect,
  Vec2,
} from '@/types/game';

export class CollisionSystem {
  private collisionBoxes: CollisionBox[] = [];
  private interactables: InteractableObject[] = [];
  private npcs: NPCDefinition[] = [];
  private areaBounds?: Rect;

  constructor(
    collisionBoxes: CollisionBox[] = [],
    areaBounds?: Rect
  ) {
    this.collisionBoxes = collisionBoxes;
    this.areaBounds = areaBounds;
  }

  /**
   * Set the active solid collision boxes (e.g. on area load)
   */
  public setCollisionBoxes(boxes: CollisionBox[]): void {
    this.collisionBoxes = boxes.filter(box => box.solid !== false);
  }

  /**
   * Add a single collision box
   */
  public addCollisionBox(box: CollisionBox): void {
    if (box.solid !== false) {
      this.collisionBoxes.push(box);
    }
  }

  /**
   * Set area boundary boundaries [0, 0, width, height]
   */
  public setAreaBounds(width: number, height: number): void {
    this.areaBounds = {
      x: 0,
      y: 0,
      width,
      height,
    };
  }

  /**
   * Set active interactables for distance queries
   */
  public setInteractables(interactables: InteractableObject[]): void {
    this.interactables = interactables;
  }

  /**
   * Set active NPCs for distance queries
   */
  public setNPCs(npcs: NPCDefinition[]): void {
    this.npcs = npcs;
  }

  /**
   * Checks if an axis-aligned bounding box (x, y, width, height)
   * collides with any solid collision box or area boundary.
   */
  public checkCollision(
    x: number,
    y: number,
    width: number,
    height: number
  ): boolean {
    // 1. Check area boundaries if configured
    if (this.areaBounds) {
      if (
        x < this.areaBounds.x ||
        y < this.areaBounds.y ||
        x + width > this.areaBounds.x + this.areaBounds.width ||
        y + height > this.areaBounds.y + this.areaBounds.height
      ) {
        return true;
      }
    }

    // 2. Check collision boxes
    for (let i = 0; i < this.collisionBoxes.length; i++) {
      const box = this.collisionBoxes[i];
      if (box.solid === false) continue;

      if (
        x < box.x + box.width &&
        x + width > box.x &&
        y < box.y + box.height &&
        y + height > box.y
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculates the closest valid position for an entity trying to move from
   * (currentX, currentY) to (desiredX, desiredY), allowing smooth sliding along walls.
   */
  public getValidPosition(
    currentX: number,
    currentY: number,
    desiredX: number,
    desiredY: number,
    playerWidth: number,
    playerHeight: number
  ): Vec2 {
    // 1. If desired position is completely collision-free, proceed immediately
    if (!this.checkCollision(desiredX, desiredY, playerWidth, playerHeight)) {
      return { x: desiredX, y: desiredY };
    }

    // 2. Attempt horizontal slide (move X, keep Y)
    const canMoveX = !this.checkCollision(desiredX, currentY, playerWidth, playerHeight);

    // 3. Attempt vertical slide (keep X, move Y)
    const canMoveY = !this.checkCollision(currentX, desiredY, playerWidth, playerHeight);

    if (canMoveX && !canMoveY) {
      return { x: desiredX, y: currentY };
    }

    if (!canMoveX && canMoveY) {
      return { x: currentX, y: desiredY };
    }

    if (canMoveX && canMoveY) {
      // Both individual axes are valid, but diagonal corner collided.
      // Favor the axis with the greater displacement.
      const diffX = Math.abs(desiredX - currentX);
      const diffY = Math.abs(desiredY - currentY);
      return diffX >= diffY ? { x: desiredX, y: currentY } : { x: currentX, y: desiredY };
    }

    // Completely blocked on both axes
    return { x: currentX, y: currentY };
  }

  /**
   * Find all nearby interactable objects within range, sorted by distance (closest first).
   */
  public findNearbyInteractables(
    x: number,
    y: number,
    range: number = 50
  ): InteractableObject[] {
    const nearby: Array<{ obj: InteractableObject; dist: number }> = [];

    for (const obj of this.interactables) {
      if (obj.state === 'hidden') continue;

      // Calculate center of the object
      const objCenterX = obj.position.x + (obj.width || 0) / 2;
      const objCenterY = obj.position.y + (obj.height || 0) / 2;

      const dist = Math.hypot(x - objCenterX, y - objCenterY);
      const maxRange = obj.interactionRange || range;

      if (dist <= maxRange) {
        nearby.push({ obj, dist });
      }
    }

    nearby.sort((a, b) => a.dist - b.dist);
    return nearby.map(item => item.obj);
  }

  /**
   * Find all nearby NPCs within range, sorted by distance (closest first).
   */
  public findNearbyNPCs(
    x: number,
    y: number,
    range: number = 50
  ): NPCDefinition[] {
    const nearby: Array<{ npc: NPCDefinition; dist: number }> = [];

    for (const npc of this.npcs) {
      const dist = Math.hypot(x - npc.position.x, y - npc.position.y);
      const maxRange = npc.interactionRange || range;

      if (dist <= maxRange) {
        nearby.push({ npc, dist });
      }
    }

    nearby.sort((a, b) => a.dist - b.dist);
    return nearby.map(item => item.npc);
  }

  /**
   * Finds the single closest target (NPC or Interactable) within range
   */
  public getClosestTarget(
    x: number,
    y: number,
    range: number = 50
  ): {
    type: 'npc' | 'interactable';
    target: NPCDefinition | InteractableObject;
    distance: number;
  } | null {
    let closestTarget: {
      type: 'npc' | 'interactable';
      target: NPCDefinition | InteractableObject;
      distance: number;
    } | null = null;
    let minDistance = Infinity;

    // Check NPCs
    for (const npc of this.npcs) {
      const dist = Math.hypot(x - npc.position.x, y - npc.position.y);
      const effectiveRange = npc.interactionRange || range;
      if (dist <= effectiveRange && dist < minDistance) {
        minDistance = dist;
        closestTarget = {
          type: 'npc',
          target: npc,
          distance: dist,
        };
      }
    }

    // Check Interactables
    for (const obj of this.interactables) {
      if (obj.state === 'hidden') continue;
      const objCenterX = obj.position.x + (obj.width || 0) / 2;
      const objCenterY = obj.position.y + (obj.height || 0) / 2;
      const dist = Math.hypot(x - objCenterX, y - objCenterY);
      const effectiveRange = obj.interactionRange || range;
      if (dist <= effectiveRange && dist < minDistance) {
        minDistance = dist;
        closestTarget = {
          type: 'interactable',
          target: obj,
          distance: dist,
        };
      }
    }

    return closestTarget;
  }
}
