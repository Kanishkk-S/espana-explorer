// ============================================================
// ESPAÑA EXPLORER — Core Game Engine
// Canvas 2D Adventure RPG Game Loop, State Coordination,
// Subsystem Delegation, and Interaction Management
// ============================================================

import {
  AreaDefinition,
  AreaExit,
  GameState,
  InteractableObject,
  NPCDefinition,
  Player,
  QuestStatus,
  Vec2,
} from '@/types/game';
import { Camera } from './Camera';
import { CollisionSystem } from './CollisionSystem';
import { InputManager } from './InputManager';
import { SceneRenderer } from './SceneRenderer';

export interface GameEngineCallbacks {
  onDialogueStart?: (npc: NPCDefinition) => void;
  onInteractNPC?: (npc: NPCDefinition) => void;
  onInteractableTrigger?: (obj: InteractableObject) => void;
  onInteractObject?: (obj: InteractableObject) => void;
  onAreaTransition?: (exit: AreaExit) => void;
  onQuestUpdate?: (questId: string, status: QuestStatus) => void;
  onNotification?: (message: string) => void;
  onPauseToggle?: (isPaused: boolean) => void;
  onPlayerPositionChange?: (pos: Vec2) => void;
  onPlayerUpdate?: (player: Player) => void;
  onClosestTargetChange?: (targetName: string | null) => void;
  onNearbyTargetChange?: (targetName: string | null) => void;
}

export interface GameEngineOptions {
  canvas: HTMLCanvasElement;
  getState: () => GameState;
  setState: (updater: GameState | ((prev: GameState) => GameState)) => void;
  callbacks?: GameEngineCallbacks;
  areas?: Record<string, AreaDefinition>;
  initialAreaId?: string;
}

const PLAYER_SPEED = 150; // pixels per second
const INTERACTION_RANGE = 50; // pixels
const PLAYER_COLLISION_WIDTH = 20;
const PLAYER_COLLISION_HEIGHT = 16;

function createDefaultGameState(): GameState {
  return {
    player: {
      id: 'player_main',
      name: 'Explorador',
      level: 1,
      experience: 0,
      experienceToNext: 1000,
      position: { x: 700, y: 560 },
      direction: 'down',
      animationState: 'idle',
      animationFrame: 0,
      currentCity: 'madrid',
      currentArea: 'Plaza Mayor',
      unlockedCities: ['madrid'],
      health: 100,
      maxHealth: 100,
    },
    quests: {},
    inventory: [],
    journal: [],
    messages: [],
    achievements: [],
    puzzles: {},
    flags: {},
    interactableStates: {},
    npcDialogueProgress: {},
    settings: {
      musicVolume: 0.5,
      sfxVolume: 0.7,
      muted: false,
      showTutorial: true,
      language: 'en',
      controllerEnabled: false,
    },
    statistics: {
      questsCompleted: 0,
      itemsCollected: 0,
      npcsSpokenTo: 0,
      puzzlesSolved: 0,
      citiesUnlocked: 1,
      totalPlayTime: 0,
      distanceWalked: 0,
    },
    saveVersion: 1,
    lastSaved: Date.now(),
    playTime: 0,
  };
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private getState: () => GameState;
  private setState: (updater: GameState | ((prev: GameState) => GameState)) => void;
  private callbacks: GameEngineCallbacks;

  // Subsystems
  public camera: Camera;
  public input: InputManager;
  public collision: CollisionSystem;
  public renderer: SceneRenderer;

  // Loop control
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private elapsedTime: number = 0;

  // Areas registry
  private areas: Map<string, AreaDefinition> = new Map();
  public currentArea!: AreaDefinition;

  // Interaction caching
  private closestTarget: {
    type: 'npc' | 'interactable';
    id: string;
    name: string;
  } | null = null;

  // Resize handling
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    canvasOrOptions: HTMLCanvasElement | GameEngineOptions,
    arg2?: GameEngineCallbacks | (() => GameState),
    arg3?: (updater: GameState | ((prev: GameState) => GameState)) => void,
    arg4?: GameEngineCallbacks
  ) {
    let initialAreaId: string | undefined;

    if (canvasOrOptions instanceof HTMLCanvasElement) {
      this.canvas = canvasOrOptions;
      if (typeof arg2 === 'function') {
        this.getState = arg2;
        this.setState = arg3!;
        this.callbacks = arg4 || {};
      } else {
        let internalState = createDefaultGameState();
        this.getState = () => internalState;
        this.setState = (updater) => {
          internalState = typeof updater === 'function' ? updater(internalState) : updater;
        };
        this.callbacks = (arg2 as GameEngineCallbacks) || {};
      }
    } else {
      this.canvas = canvasOrOptions.canvas;
      this.getState = canvasOrOptions.getState;
      this.setState = canvasOrOptions.setState;
      this.callbacks = canvasOrOptions.callbacks || {};
      initialAreaId = canvasOrOptions.initialAreaId;
      if (canvasOrOptions.areas) {
        for (const [id, area] of Object.entries(canvasOrOptions.areas)) {
          this.areas.set(id, area);
        }
      }
    }

    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Unable to acquire 2D rendering context from canvas');
    }
    this.ctx = context;

    // Initialize subsystems
    this.camera = new Camera(this.canvas.width || 800, this.canvas.height || 600);
    this.input = new InputManager();
    this.collision = new CollisionSystem();
    this.renderer = new SceneRenderer();

    // Ensure fallback default area exists
    this.initDefaultArea();

    // Load initial area
    const startAreaId = initialAreaId || this.getState().player.currentArea || 'madrid_plaza_mayor';
    this.loadArea(startAreaId);

    // Setup responsive canvas sizing
    this.setupResizeObserver();
    this.resize();
    this.start();
  }

  public get player(): Player {
    return this.getState().player;
  }

  public get npcs(): NPCDefinition[] {
    return this.currentArea?.npcs || [];
  }

  public get interactables(): InteractableObject[] {
    return this.currentArea?.interactables || [];
  }

  /**
   * Start the 60fps game loop
   */
  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  /**
   * Stop the game loop
   */
  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Toggle or set pause state
   */
  public setPaused(paused: boolean): void {
    this.isPaused = paused;
    if (this.callbacks.onPauseToggle) {
      this.callbacks.onPauseToggle(this.isPaused);
    }
  }

  public togglePause(): void {
    this.setPaused(!this.isPaused);
  }

  /**
   * Register a custom area definition into the engine
   */
  public registerArea(area: AreaDefinition): void {
    this.areas.set(area.id, area);
  }

  /**
   * Load an area by ID, updating collision, camera bounds, and entities
   */
  public loadArea(areaId: string, spawnPoint?: Vec2): void {
    let area = this.areas.get(areaId);
    if (!area) {
      // Try finding by default area or fallback
      area = this.areas.get('madrid_plaza_mayor');
      if (!area) {
        throw new Error(`Area '${areaId}' not found and default area missing`);
      }
    }

    this.currentArea = area;

    // Configure collision system
    this.collision.setCollisionBoxes(area.collisionBoxes || []);
    this.collision.setAreaBounds(area.width, area.height);
    this.collision.setInteractables(area.interactables || []);
    this.collision.setNPCs(area.npcs || []);

    // Configure camera bounds
    this.camera.setBoundsFromArea(area.width, area.height);

    // Position player
    const spawn = spawnPoint || area.spawnPoint || { x: area.width / 2, y: area.height / 2 };
    this.updatePlayerState(player => ({
      ...player,
      position: { ...spawn },
      currentArea: area.name || area.id,
      currentCity: area.cityId,
    }));

    // Snap camera directly to spawn position without smoothing lag
    this.camera.snapTo(spawn.x, spawn.y);

    if (this.callbacks.onNotification) {
      this.callbacks.onNotification(`Entering ${area.name}`);
    }
  }

  /**
   * Master requestAnimationFrame loop running at monitor refresh rate (~60fps)
   */
  private loop = (timestamp: number): void => {
    if (!this.isRunning) return;

    // Delta time in seconds, clamped to 100ms max to prevent spiral of death
    const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;
    this.elapsedTime += deltaTime;

    if (!this.isPaused) {
      this.update(deltaTime);
    }

    this.render();

    if (this.isRunning) {
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  };

  /**
   * Updates game world, physics, animation, and interaction states
   */
  public update(deltaTime: number): void {
    // 1. Handle Pause Key (Escape)
    if (this.input.isPausePressed()) {
      this.togglePause();
      return;
    }

    const state = this.getState();
    const player = state.player;

    // 2. Compute Movement Vector from Input
    const moveVec = this.input.getMovementVector();
    const isMoving = moveVec.x !== 0 || moveVec.y !== 0;

    let newX = player.position.x;
    let newY = player.position.y;
    let newDirection = player.direction;
    let newAnimState = player.animationState;
    let newAnimFrame = player.animationFrame;

    if (isMoving) {
      // Calculate desired target position
      const desiredX = player.position.x + moveVec.x * PLAYER_SPEED * deltaTime;
      const desiredY = player.position.y + moveVec.y * PLAYER_SPEED * deltaTime;

      // Player collision bounding box (centered on feet)
      const halfW = PLAYER_COLLISION_WIDTH / 2;
      const currentBoxX = player.position.x - halfW;
      const currentBoxY = player.position.y - PLAYER_COLLISION_HEIGHT;
      const desiredBoxX = desiredX - halfW;
      const desiredBoxY = desiredY - PLAYER_COLLISION_HEIGHT;

      // Query CollisionSystem for closest valid position (with wall sliding)
      const validBoxPos = this.collision.getValidPosition(
        currentBoxX,
        currentBoxY,
        desiredBoxX,
        desiredBoxY,
        PLAYER_COLLISION_WIDTH,
        PLAYER_COLLISION_HEIGHT
      );

      newX = validBoxPos.x + halfW;
      newY = validBoxPos.y + PLAYER_COLLISION_HEIGHT;

      // Direction calculation
      if (Math.abs(moveVec.x) > Math.abs(moveVec.y)) {
        newDirection = moveVec.x > 0 ? 'right' : 'left';
      } else {
        newDirection = moveVec.y > 0 ? 'down' : 'up';
      }

      newAnimState = 'walking';
      newAnimFrame += deltaTime * 8;
    } else {
      newAnimState = 'idle';
      newAnimFrame = 0;
    }

    // 3. Proximity & Interaction Detection
    const closest = this.collision.getClosestTarget(newX, newY, INTERACTION_RANGE);
    let currentClosestTarget: {
      type: 'npc' | 'interactable';
      id: string;
      name: string;
    } | null = null;

    if (closest) {
      currentClosestTarget = {
        type: closest.type,
        id: closest.target.id,
        name: closest.target.name,
      };
    }

    // Notify if target changed
    if (
      (!this.closestTarget && currentClosestTarget) ||
      (this.closestTarget && !currentClosestTarget) ||
      (this.closestTarget && currentClosestTarget && this.closestTarget.id !== currentClosestTarget.id)
    ) {
      this.closestTarget = currentClosestTarget;
      const targetName = currentClosestTarget ? currentClosestTarget.name : null;
      if (this.callbacks.onClosestTargetChange) {
        this.callbacks.onClosestTargetChange(targetName);
      }
      if (this.callbacks.onNearbyTargetChange) {
        this.callbacks.onNearbyTargetChange(targetName);
      }
    }

    // 4. Handle Interaction (E or Enter)
    if (this.input.isInteractPressed()) {
      this.handleInteraction(newX, newY);
    }

    // 5. Check Area Exits
    this.checkAreaExits(newX, newY);

    // 6. Update Camera Following Player with Lerp
    this.camera.update(newX, newY, deltaTime);

    // 7. Sync Player State
    const posChanged = newX !== player.position.x || newY !== player.position.y;
    if (
      posChanged ||
      newDirection !== player.direction ||
      newAnimState !== player.animationState
    ) {
      this.updatePlayerState(p => {
        const updated = {
          ...p,
          position: { x: newX, y: newY },
          direction: newDirection,
          animationState: newAnimState,
          animationFrame: newAnimFrame,
        };
        if (this.callbacks.onPlayerUpdate) {
          this.callbacks.onPlayerUpdate(updated);
        }
        return updated;
      });

      if (posChanged && this.callbacks.onPlayerPositionChange) {
        this.callbacks.onPlayerPositionChange({ x: newX, y: newY });
      }
    }
  }

  /**
   * Renders the complete scene with proper layer ordering
   */
  public render(): void {
    const { ctx, canvas } = this;
    const state = this.getState();

    // Clear whole canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render scene via SceneRenderer with Y-sorting
    this.renderer.renderScene(
      ctx,
      this.currentArea,
      state.player,
      this.camera,
      this.elapsedTime * 1000,
      this.closestTarget ? this.closestTarget.id : null
    );
  }

  /**
   * Trigger interaction with closest NPC or object
   */
  public triggerInteraction(): void {
    const pos = this.getState().player.position;
    this.handleInteraction(pos.x, pos.y);
  }

  private handleInteraction(x: number, y: number): void {
    // 1. Check nearby NPCs first (priority)
    const nearbyNPCs = this.collision.findNearbyNPCs(x, y, INTERACTION_RANGE);
    if (nearbyNPCs.length > 0) {
      const npc = nearbyNPCs[0];
      if (this.callbacks.onDialogueStart) {
        this.callbacks.onDialogueStart(npc);
      }
      if (this.callbacks.onInteractNPC) {
        this.callbacks.onInteractNPC(npc);
      }
      return;
    }

    // 2. Check nearby interactables
    const nearbyObjects = this.collision.findNearbyInteractables(x, y, INTERACTION_RANGE);
    if (nearbyObjects.length > 0) {
      const obj = nearbyObjects[0];
      if (this.callbacks.onInteractableTrigger) {
        this.callbacks.onInteractableTrigger(obj);
      }
      if (this.callbacks.onInteractObject) {
        this.callbacks.onInteractObject(obj);
      }
      return;
    }

    // 3. Clear feedback if player pressed interact but is not close enough to any entity
    if (this.callbacks.onNotification) {
      this.callbacks.onNotification('Acércate más para interactuar con personajes u objetos [E/SELECT]');
    }
  }

  /**
   * Check if player has stepped onto an area exit
   */
  private checkAreaExits(x: number, y: number): void {
    if (!this.currentArea.exits) return;

    for (const exit of this.currentArea.exits) {
      if (exit.locked) continue;

      const ex = exit.position.x;
      const ey = exit.position.y;
      const ew = exit.position.width;
      const eh = exit.position.height;

      if (x >= ex && x <= ex + ew && y >= ey && y <= ey + eh) {
        if (this.callbacks.onAreaTransition) {
          this.callbacks.onAreaTransition(exit);
        }
        this.loadArea(exit.targetArea, exit.targetSpawn);
        break;
      }
    }
  }

  /**
   * Resize canvas to match its container or screen dimensions
   */
  public resize(width?: number, height?: number): void {
    const parent = this.canvas.parentElement;
    const w = width ?? (parent ? parent.clientWidth : window.innerWidth);
    const h = height ?? (parent ? parent.clientHeight : window.innerHeight);

    if (w === 0 || h === 0) return;

    // Use device pixel ratio for sharp rendering on retina displays
    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);

    this.camera.resize(w, h);
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', () => this.resize());
      return;
    }

    const parent = this.canvas.parentElement;
    if (parent) {
      this.resizeObserver = new ResizeObserver(() => {
        this.resize();
      });
      this.resizeObserver.observe(parent);
    }
  }

  private updatePlayerState(updater: (prev: Player) => Player): void {
    this.setState(prevState => ({
      ...prevState,
      player: updater(prevState.player),
    }));
  }

  /**
   * Cleanup engine resources, event listeners, and animation frame
   */
  public destroy(): void {
    this.stop();
    this.input.destroy();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  // --- DEFAULT AREA DEFINITION ---

  private initDefaultArea(): void {
    const defaultArea: AreaDefinition = {
      id: 'madrid_plaza_mayor',
      cityId: 'madrid',
      name: 'Plaza Mayor',
      description: 'The historic cobblestone heart of Madrid, enclosed by grand terracotta-roofed porticoes and the Royal Fountain.',
      width: 1400,
      height: 900,
      backgroundColor: '#7ab648',
      spawnPoint: { x: 700, y: 560 },
      collisionBoxes: [
        // Fountain collision
        { x: 650, y: 390, width: 100, height: 70, solid: true },
        // Top buildings collision wall
        { x: 0, y: 0, width: 1400, height: 260, solid: true },
        // Left barrier
        { x: 0, y: 260, width: 40, height: 640, solid: true },
        // Right barrier
        { x: 1360, y: 260, width: 40, height: 640, solid: true },
        // Bottom barrier
        { x: 0, y: 860, width: 1400, height: 40, solid: true },
        // Market stall left
        { x: 270, y: 460, width: 80, height: 40, solid: true },
        // Market stall right
        { x: 1050, y: 460, width: 80, height: 40, solid: true },
      ],
      environmentObjects: [
        // Plaza ground cobblestones
        {
          id: 'plaza_pavement',
          type: 'path',
          position: { x: 80, y: 240 },
          width: 1240,
          height: 620,
          zIndex: 1,
          layer: 'ground',
          variant: 1, // cobble
        },
        // Royal Library building (left)
        {
          id: 'biblioteca_real',
          type: 'building',
          position: { x: 100, y: 260 },
          width: 220,
          height: 140,
          zIndex: 5,
          layer: 'objects',
          tint: '#e0c8a0',
        },
        // Grand Town Hall (center)
        {
          id: 'casa_de_la_villa',
          type: 'building',
          position: { x: 550, y: 240 },
          width: 300,
          height: 160,
          zIndex: 5,
          layer: 'objects',
          tint: '#ebd5b3',
        },
        // Archival Guild (right)
        {
          id: 'archivo_real',
          type: 'building',
          position: { x: 1080, y: 260 },
          width: 220,
          height: 140,
          zIndex: 5,
          layer: 'objects',
          tint: '#d6b888',
        },
        // Royal Fountain
        {
          id: 'fuente_central',
          type: 'fountain',
          position: { x: 650, y: 390 },
          width: 100,
          height: 70,
          zIndex: 10,
          layer: 'objects',
        },
        // Market stalls
        {
          id: 'stall_carmen',
          type: 'market_stall',
          position: { x: 270, y: 460 },
          width: 80,
          height: 40,
          zIndex: 8,
          layer: 'objects',
          tint: '#a83030',
        },
        {
          id: 'stall_merchandise',
          type: 'market_stall',
          position: { x: 1050, y: 460 },
          width: 80,
          height: 40,
          zIndex: 8,
          layer: 'objects',
          tint: '#308050',
        },
        // Street lamps
        {
          id: 'lamp_1',
          type: 'lamp',
          position: { x: 440, y: 360 },
          width: 20,
          height: 50,
          zIndex: 8,
          layer: 'objects',
        },
        {
          id: 'lamp_2',
          type: 'lamp',
          position: { x: 960, y: 360 },
          width: 20,
          height: 50,
          zIndex: 8,
          layer: 'objects',
        },
        {
          id: 'lamp_3',
          type: 'lamp',
          position: { x: 380, y: 680 },
          width: 20,
          height: 50,
          zIndex: 8,
          layer: 'objects',
        },
        {
          id: 'lamp_4',
          type: 'lamp',
          position: { x: 1020, y: 680 },
          width: 20,
          height: 50,
          zIndex: 8,
          layer: 'objects',
        },
        // Benches
        {
          id: 'bench_1',
          type: 'bench',
          position: { x: 480, y: 630 },
          width: 44,
          height: 18,
          zIndex: 6,
          layer: 'objects',
        },
        {
          id: 'bench_2',
          type: 'bench',
          position: { x: 920, y: 630 },
          width: 44,
          height: 18,
          zIndex: 6,
          layer: 'objects',
        },
        // Peripheral Trees
        {
          id: 'tree_nw',
          type: 'tree',
          position: { x: 70, y: 410 },
          width: 60,
          height: 70,
          zIndex: 7,
          layer: 'objects',
          variant: 0,
        },
        {
          id: 'tree_sw',
          type: 'tree',
          position: { x: 80, y: 610 },
          width: 60,
          height: 70,
          zIndex: 7,
          layer: 'objects',
          variant: 1,
        },
        {
          id: 'tree_ne',
          type: 'tree',
          position: { x: 1310, y: 410 },
          width: 60,
          height: 70,
          zIndex: 7,
          layer: 'objects',
          variant: 1,
        },
        {
          id: 'tree_se',
          type: 'tree',
          position: { x: 1300, y: 610 },
          width: 60,
          height: 70,
          zIndex: 7,
          layer: 'objects',
          variant: 0,
        },
      ],
      npcs: [
        {
          id: 'don_alfonso',
          name: 'Don Alfonso',
          title: 'Cronista de la Villa',
          personality: 'scholarly and observant',
          position: { x: 490, y: 470 },
          direction: 'down',
          portraitId: 'portrait_don_alfonso',
          interactionRange: 60,
          animationState: 'idle',
          questIds: ['historical_markers'],
          appearance: {
            skinColor: '#d8a878',
            hairColor: '#a8a8a8',
            hairStyle: 'short',
            outfitColor: '#5a3a20',
            outfitType: 'robe',
            accessory: 'glasses',
            height: 'medium',
          },
          dialogueTree: [
            {
              id: 'alfonso_greet',
              speaker: 'Don Alfonso',
              text: '¡Saludos, joven viajero! Every cobblestone in this royal plaza has witnessed centuries of Spanish history.',
            },
          ],
        },
        {
          id: 'mateo_bard',
          name: 'Mateo el Trovador',
          title: 'Wandering Bard',
          personality: 'poetic and cheerful',
          position: { x: 920, y: 510 },
          direction: 'left',
          portraitId: 'portrait_mateo',
          interactionRange: 60,
          animationState: 'idle',
          questIds: [],
          appearance: {
            skinColor: '#d8a878',
            hairColor: '#d4a840',
            hairStyle: 'curly',
            outfitColor: '#305aa0',
            outfitType: 'vest',
            accessory: 'hat',
            height: 'tall',
          },
          dialogueTree: [
            {
              id: 'mateo_greet',
              speaker: 'Mateo el Trovador',
              text: 'A traveler! Welcome to Madrid. Would you care for a ballad of Castile?',
            },
          ],
        },
      ],
      interactables: [
        {
          id: 'fountain_dial',
          name: 'Fuente Real',
          type: 'puzzle',
          position: { x: 670, y: 410 },
          width: 60,
          height: 40,
          interactionRange: 75,
          state: 'available',
          persistentId: 'interact_fountain',
          zIndex: 10,
          visualType: 'fountain',
          sparkle: true,
        },
        {
          id: 'market_stall_books',
          name: 'Librero de la Plaza',
          type: 'item_pickup',
          position: { x: 275, y: 470 },
          width: 70,
          height: 35,
          interactionRange: 65,
          state: 'available',
          persistentId: 'interact_book_stall',
          zIndex: 9,
          visualType: 'market_stall',
          sparkle: true,
        },
        {
          id: 'signpost_plaza',
          name: 'Plaza Mayor Signpost',
          type: 'sign',
          position: { x: 700, y: 720 },
          width: 30,
          height: 25,
          interactionRange: 55,
          state: 'available',
          persistentId: 'interact_sign_plaza',
          zIndex: 8,
          visualType: 'sign',
        },
      ],
      exits: [
        {
          id: 'exit_south_toledo',
          label: 'Toledo Gate ➔',
          position: { x: 620, y: 840, width: 160, height: 40 },
          targetArea: 'toledo_puerta_bisagra',
          targetCity: 'toledo',
          targetSpawn: { x: 400, y: 200 },
          locked: false,
        },
      ],
      ambientEffects: [
        {
          type: 'sparkle',
          position: { x: 600, y: 350 },
          width: 200,
          height: 150,
          intensity: 1.5,
        },
        {
          type: 'leaves',
          position: { x: 0, y: 200 },
          width: 1400,
          height: 700,
          intensity: 1,
        },
      ],
    };

    this.areas.set(defaultArea.id, defaultArea);
    this.areas.set('plaza_mayor', defaultArea);
  }
}
