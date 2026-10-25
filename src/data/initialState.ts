// ============================================================
// ESPAÑA EXPLORER — Initial Game State Factory
// ============================================================

import { Achievement, GameSettings, GameState, GameStatistics, Player } from '@/types/game';
import { QUESTS } from './quests';
import { PUZZLES } from './puzzles';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    name: 'Primeros Pasos en Madrid',
    description: 'Comienza tu viaje en la Plaza de la Llegada.',
    icon: 'compass',
    unlocked: false,
    category: 'exploration',
  },
  {
    id: 'madrid_historian',
    name: 'Cronista de la Villa',
    description: 'Documenta todos los marcadores históricos de la plaza para Don Alfonso.',
    icon: 'badge',
    unlocked: false,
    category: 'quest',
  },
  {
    id: 'puzzle_master_library',
    name: 'El Secreto de los Astros',
    description: 'Alinea los símbolos celestes del cajón de la biblioteca.',
    icon: 'puzzle',
    unlocked: false,
    category: 'puzzle',
  },
  {
    id: 'first_atlas_secret',
    name: 'Luz en el Patio',
    description: 'Revela la inscripción solar mediante la Lente de Revelación.',
    icon: 'lens',
    unlocked: false,
    category: 'puzzle',
  },
  {
    id: 'atlas_seeker_1',
    name: 'El Despertar del Atlas',
    description: 'Recupera el primer folio de El Atlas Olvidado en Madrid.',
    icon: 'atlas_page',
    unlocked: false,
    category: 'story',
  },
  {
    id: 'toledo_bound',
    name: 'Rumbo al Tajo',
    description: 'Desbloquea el camino imperial hacia la ciudad de Toledo.',
    icon: 'gate',
    unlocked: false,
    category: 'exploration',
  },
];

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.7,
  sfxVolume: 0.8,
  muted: false,
  showTutorial: true,
  language: 'es',
  controllerEnabled: true,
};

export const INITIAL_STATISTICS: GameStatistics = {
  questsCompleted: 0,
  itemsCollected: 0,
  npcsSpokenTo: 0,
  puzzlesSolved: 0,
  citiesUnlocked: 1,
  totalPlayTime: 0,
  distanceWalked: 0,
};

export function createInitialPlayer(): Player {
  return {
    id: 'player_hero',
    name: 'Aventurero',
    level: 1,
    experience: 0,
    experienceToNext: 100,
    position: { x: 400, y: 520 },
    direction: 'up',
    animationState: 'idle',
    animationFrame: 0,
    currentCity: 'madrid',
    currentArea: 'madrid_plaza',
    unlockedCities: ['madrid'],
    health: 100,
    maxHealth: 100,
  };
}

export function createInitialGameState(): GameState {
  // Deep clone quests to guarantee fresh progress state
  const questsCopy = JSON.parse(JSON.stringify(QUESTS));
  // Deep clone puzzles
  const puzzlesCopy = JSON.parse(JSON.stringify(PUZZLES));
  // Deep clone achievements
  const achievementsCopy = JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS));

  return {
    player: createInitialPlayer(),
    quests: questsCopy,
    inventory: [],
    journal: [],
    messages: [
      {
        id: 'msg_welcome',
        title: '¡Bienvenido a España Explorer!',
        content: 'Has llegado a Madrid, el corazón de Castilla. Se rumorea que la antigua Biblioteca custodia los primeros indicios de "El Atlas Olvidado". Explora la plaza, conversa con los lugareños y comienza tu aventura.',
        timestamp: Date.now(),
        read: false,
        type: 'notification',
      },
    ],
    achievements: achievementsCopy,
    puzzles: puzzlesCopy,
    flags: {
      has_started_game: true,
      knows_key_origin: false,
      patio_revealed: false,
      first_page_unlocked: false,
    },
    interactableStates: {},
    npcDialogueProgress: {},
    settings: { ...DEFAULT_SETTINGS },
    statistics: { ...INITIAL_STATISTICS },
    saveVersion: 1,
    lastSaved: Date.now(),
    playTime: 0,
  };
}
