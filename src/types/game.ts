// ============================================================
// ESPAÑA EXPLORER — Core Type Definitions
// ============================================================

// --- Geometry & Spatial ---
export interface Vec2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CollisionBox extends Rect {
  solid: boolean;
}

// --- Direction & Animation ---
export type Direction = 'up' | 'down' | 'left' | 'right';
export type AnimationState = 'idle' | 'walking' | 'interacting';

// --- Player ---
export interface Player {
  id: string;
  name: string;
  level: number;
  experience: number;
  experienceToNext: number;
  position: Vec2;
  direction: Direction;
  animationState: AnimationState;
  animationFrame: number;
  currentCity: CityId;
  currentArea: string;
  unlockedCities: CityId[];
  health: number;
  maxHealth: number;
}

// --- Cities ---
export type CityId = 'madrid' | 'barcelona' | 'sevilla' | 'granada' | 'valencia' | 'toledo';

export interface City {
  id: CityId;
  name: string;
  description: string;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  unlockRequirements: string[];
  areas: AreaDefinition[];
  position: Vec2; // Position on world map
  completionPercentage: number;
}

// --- Areas / Levels ---
export interface AreaDefinition {
  id: string;
  cityId: CityId;
  name: string;
  description: string;
  width: number;
  height: number;
  backgroundColor: string;
  environmentObjects: EnvironmentObject[];
  npcs: NPCDefinition[];
  interactables: InteractableObject[];
  collisionBoxes: CollisionBox[];
  spawnPoint: Vec2;
  exits: AreaExit[];
  ambientEffects?: AmbientEffect[];
  music?: string;
}

export interface AreaExit {
  id: string;
  position: Rect;
  targetArea: string;
  targetCity?: CityId;
  targetSpawn: Vec2;
  requiresItem?: string;
  locked: boolean;
  label?: string;
}

// --- Environment Objects ---
export type EnvObjectType =
  | 'tree' | 'bush' | 'flower' | 'grass'
  | 'rock' | 'cliff' | 'path' | 'bridge'
  | 'building' | 'house' | 'shop' | 'library'
  | 'fountain' | 'well' | 'pond' | 'river'
  | 'bench' | 'lamp' | 'sign' | 'statue'
  | 'market_stall' | 'door' | 'window' | 'arch'
  | 'wall' | 'fence' | 'plaza_tile' | 'courtyard'
  | 'bookshelf' | 'desk' | 'drawer' | 'manuscript'
  | 'pillar' | 'vine' | 'pot' | 'barrel'
  | 'portal' | 'cauldron'
  | 'custom';

export interface EnvironmentObject {
  id: string;
  type: EnvObjectType;
  position: Vec2;
  width: number;
  height: number;
  zIndex: number;
  collision?: CollisionBox;
  variant?: number;
  animated?: boolean;
  layer: 'ground' | 'objects' | 'foreground';
  tint?: string;
  scale?: number;
  rotation?: number;
}

// --- NPCs ---
export interface NPCDefinition {
  id: string;
  name: string;
  title?: string;
  personality: string;
  position: Vec2;
  direction: Direction;
  portraitId: string;
  dialogueTree: DialogueNode[];
  questIds: string[];
  interactionRange: number;
  animationState: AnimationState;
  schedule?: NPCSchedule[];
  appearance: NPCAppearance;
}

export interface NPCAppearance {
  skinColor: string;
  hairColor: string;
  hairStyle: 'short' | 'long' | 'bun' | 'curly' | 'bald';
  outfitColor: string;
  outfitType: 'robe' | 'apron' | 'vest' | 'dress' | 'cloak' | 'shirt';
  accessory?: 'glasses' | 'hat' | 'scarf' | 'necklace' | 'none';
  height: 'short' | 'medium' | 'tall';
}

export interface NPCSchedule {
  time: string;
  position: Vec2;
  action: string;
}

// --- Dialogue ---
export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  choices?: DialogueChoice[];
  nextId?: string;
  condition?: DialogueCondition;
  effects?: DialogueEffect[];
  portraitEmotion?: 'neutral' | 'happy' | 'sad' | 'surprised' | 'angry' | 'thinking';
}

export interface DialogueChoice {
  text: string;
  nextId: string;
  condition?: DialogueCondition;
  effects?: DialogueEffect[];
}

export interface DialogueCondition {
  type: 'quest_status' | 'has_item' | 'level' | 'flag' | 'city_unlocked';
  questId?: string;
  itemId?: string;
  flagName?: string;
  status?: QuestStatus;
  value?: number | string | boolean;
  comparison?: 'eq' | 'gte' | 'lte' | 'neq';
}

export interface DialogueEffect {
  type: 'start_quest' | 'complete_quest' | 'give_item' | 'remove_item' | 'set_flag' | 'add_experience' | 'add_journal' | 'unlock_area' | 'add_message';
  questId?: string;
  itemId?: string;
  flagName?: string;
  flagValue?: boolean;
  experience?: number;
  journalEntry?: JournalEntry;
  message?: GameMessage;
  areaId?: string;
}

// --- Quests ---
export type QuestStatus = 'locked' | 'available' | 'active' | 'completed' | 'failed';
export type QuestType = 'exploration' | 'dialogue' | 'collection' | 'puzzle' | 'item_retrieval' | 'discovery' | 'mystery';

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  cityId: CityId;
  areaId?: string;
  prerequisites: string[];
  objectives: QuestObjective[];
  rewards: QuestReward[];
  status: QuestStatus;
  npcId?: string;
  isMainQuest: boolean;
  chapter?: number;
  completionDialogueId?: string;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'interact' | 'collect' | 'talk' | 'explore' | 'solve_puzzle' | 'use_item' | 'discover';
  target: string;
  current: number;
  required: number;
  completed: boolean;
  hidden: boolean;
}

export interface QuestReward {
  type: 'item' | 'experience' | 'unlock_city' | 'unlock_area' | 'achievement' | 'journal_entry';
  itemId?: string;
  experience?: number;
  cityId?: CityId;
  areaId?: string;
  achievementId?: string;
}

// --- Inventory & Items ---
export type ItemCategory = 'quest_item' | 'key' | 'artifact' | 'tool' | 'collectible';

export interface Item {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  icon: string;
  quantity: number;
  maxQuantity: number;
  usable: boolean;
  useTarget?: string;
  questId?: string;
  source?: string;
  unique: boolean;
}

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  icon: string;
  maxQuantity: number;
  usable: boolean;
  useTarget?: string;
  questId?: string;
  unique: boolean;
}

// --- Interactable Objects ---
export interface InteractableObject {
  id: string;
  name: string;
  type: 'item_pickup' | 'container' | 'mechanism' | 'sign' | 'door' | 'npc_trigger' | 'puzzle' | 'clue' | 'examine';
  position: Vec2;
  width: number;
  height: number;
  interactionRange: number;
  dialogue?: DialogueNode[];
  requiredItem?: string;
  givesItem?: string;
  triggersQuest?: string;
  completesObjective?: string;
  puzzleId?: string;
  state: 'available' | 'used' | 'locked' | 'hidden';
  animation?: string;
  persistentId: string; // for save state
  zIndex: number;
  visualType: EnvObjectType;
  sparkle?: boolean;
}

// --- Puzzles ---
export type PuzzleType = 'symbol_sequence' | 'mechanism' | 'riddle' | 'pattern' | 'combination';

export interface Puzzle {
  id: string;
  name: string;
  type: PuzzleType;
  description: string;
  areaId: string;
  solution: string[];
  currentInput: string[];
  attempts: number;
  maxHints: number;
  hintsUsed: number;
  hints: string[];
  solved: boolean;
  rewards: QuestReward[];
  objectiveId?: string;
}

// --- Journal ---
export interface JournalEntry {
  id: string;
  title: string;
  description: string;
  location: string;
  associatedQuest?: string;
  associatedItem?: string;
  associatedNPC?: string;
  discoveredAt: number;
  category: 'clue' | 'story' | 'npc_record' | 'atlas_page' | 'note';
  sequence: number;
  read: boolean;
}

// --- Messages ---
export interface GameMessage {
  id: string;
  title: string;
  content: string;
  from?: string;
  timestamp: number;
  read: boolean;
  type: 'quest_update' | 'discovery' | 'notification' | 'npc_message' | 'achievement';
  relatedQuestId?: string;
}

// --- Achievements ---
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  category: 'exploration' | 'quest' | 'puzzle' | 'collection' | 'story';
}

// --- Ambient Effects ---
export interface AmbientEffect {
  type: 'particle' | 'water_shimmer' | 'light_ray' | 'leaves' | 'sparkle';
  position: Vec2;
  width: number;
  height: number;
  intensity: number;
  color?: string;
}

// --- Game State ---
export interface GameState {
  player: Player;
  quests: Record<string, Quest>;
  inventory: Item[];
  journal: JournalEntry[];
  messages: GameMessage[];
  achievements: Achievement[];
  puzzles: Record<string, Puzzle>;
  flags: Record<string, boolean>;
  interactableStates: Record<string, string>;
  npcDialogueProgress: Record<string, string>;
  settings: GameSettings;
  statistics: GameStatistics;
  saveVersion: number;
  lastSaved: number;
  playTime: number;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  showTutorial: boolean;
  language: 'en' | 'es';
  controllerEnabled: boolean;
}

export interface GameStatistics {
  questsCompleted: number;
  itemsCollected: number;
  npcsSpokenTo: number;
  puzzlesSolved: number;
  citiesUnlocked: number;
  totalPlayTime: number;
  distanceWalked: number;
}

// --- Controller ---
export interface ControllerEvent {
  type: 'button' | 'joystick' | 'rfid' | 'gesture';
  name?: string;
  x?: number;
  y?: number;
  uid?: string;
}

export interface RFIDCardMapping {
  uid: string;
  name: string;
  itemId?: string;
  questTrigger?: string;
  effect: string;
}

// --- Camera ---
export interface Camera {
  x: number;
  y: number;
  width: number;
  height: number;
  targetX: number;
  targetY: number;
  smoothing: number;
  bounds?: Rect;
}

// --- Scene Management ---
export type SceneType = 'main_menu' | 'gameplay' | 'world_map' | 'inventory' | 'journal' | 'quest_log' | 'puzzle' | 'settings' | 'controller_setup';

export interface GameContext {
  state: GameState;
  currentScene: SceneType;
  activeDialogue: DialogueNode | null;
  activeNPC: string | null;
  isPaused: boolean;
  isTransitioning: boolean;
  showInventory: boolean;
  showJournal: boolean;
  showQuestLog: boolean;
  showMap: boolean;
  showSettings: boolean;
  showPuzzle: string | null;
  notification: string | null;
}

// --- Save System ---
export interface SaveData {
  version: number;
  timestamp: number;
  gameState: GameState;
  checksum: string;
}

// --- Rendering ---
export interface RenderLayer {
  name: string;
  zIndex: number;
  objects: RenderObject[];
}

export interface RenderObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  render: (ctx: CanvasRenderingContext2D, camera: Camera) => void;
}
