// ============================================================
// ESPAÑA EXPLORER — Save/Load System
// Uses localStorage with versioning and validation
// ============================================================

import { GameState, SaveData, GameSettings } from '@/types/game';

const LEGACY_SAVE_KEY = 'espana_explorer_save';
const SAVE_VERSION = 1;

export function getSaveKey(playerId?: string): string {
  return playerId ? `espana_explorer_save_${playerId}` : 'espana_explorer_save_default';
}

function generateChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

export function saveGame(state: GameState, playerId?: string): boolean {
  try {
    const key = getSaveKey(playerId || state.player?.id);
    const stateToSave: GameState = {
      ...state,
      lastSaved: Date.now(),
      saveVersion: SAVE_VERSION,
    };
    
    const stateJson = JSON.stringify(stateToSave);
    const saveData: SaveData = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      gameState: stateToSave,
      checksum: generateChecksum(stateJson),
    };

    localStorage.setItem(key, JSON.stringify(saveData));
    localStorage.setItem(LEGACY_SAVE_KEY, JSON.stringify(saveData));
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
}

export function loadGame(playerId?: string): GameState | null {
  try {
    const key = getSaveKey(playerId);
    let raw = localStorage.getItem(key);
    if (!raw && (!playerId || playerId === 'default')) {
      raw = localStorage.getItem(LEGACY_SAVE_KEY);
    }
    if (!raw) return null;

    const saveData: SaveData = JSON.parse(raw);
    
    // Version check
    if (saveData.version !== SAVE_VERSION) {
      console.warn(`Save version mismatch: got ${saveData.version}, expected ${SAVE_VERSION}`);
      // For now, try to load anyway with potential migration
      return migrateState(saveData.gameState, saveData.version);
    }

    // Checksum validation
    const stateJson = JSON.stringify(saveData.gameState);
    const expectedChecksum = generateChecksum(stateJson);
    if (saveData.checksum !== expectedChecksum) {
      console.warn('Save checksum mismatch - data may be corrupted');
      // Still try to load, but warn
    }

    return validateState(saveData.gameState);
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
}

export function hasSaveData(playerId?: string): boolean {
  try {
    const key = getSaveKey(playerId);
    let raw = localStorage.getItem(key);
    if (!raw && (!playerId || playerId === 'default')) {
      raw = localStorage.getItem(LEGACY_SAVE_KEY);
    }
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed && parsed.gameState && parsed.gameState.player);
  } catch {
    return false;
  }
}

export function deleteSave(playerId?: string): void {
  const key = getSaveKey(playerId);
  localStorage.removeItem(key);
  if (!playerId || playerId === 'default') {
    localStorage.removeItem(LEGACY_SAVE_KEY);
  }
}

export function getLastSaveTime(playerId?: string): number | null {
  try {
    const key = getSaveKey(playerId);
    let raw = localStorage.getItem(key);
    if (!raw && (!playerId || playerId === 'default')) {
      raw = localStorage.getItem(LEGACY_SAVE_KEY);
    }
    if (!raw) return null;
    const saveData: SaveData = JSON.parse(raw);
    return saveData.timestamp;
  } catch {
    return null;
  }
}

function validateState(state: GameState): GameState {
  // Ensure all required fields exist with defaults
  const defaults: Partial<GameState> = {
    flags: {},
    interactableStates: {},
    npcDialogueProgress: {},
    statistics: {
      questsCompleted: 0,
      itemsCollected: 0,
      npcsSpokenTo: 0,
      puzzlesSolved: 0,
      citiesUnlocked: 1,
      totalPlayTime: 0,
      distanceWalked: 0,
    },
    settings: getDefaultSettings(),
    playTime: 0,
    journal: [],
    messages: [],
    achievements: [],
    inventory: [],
  };

  return { ...defaults, ...state } as GameState;
}

function migrateState(state: GameState, fromVersion: number): GameState {
  let migrated = { ...state };
  
  // Future migration logic
  if (fromVersion < 1) {
    // Migrate from pre-1.0
    migrated.saveVersion = SAVE_VERSION;
  }

  return validateState(migrated);
}

export function getDefaultSettings(): GameSettings {
  return {
    musicVolume: 0.5,
    sfxVolume: 0.7,
    muted: false,
    showTutorial: true,
    language: 'en',
    controllerEnabled: false,
  };
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem('espana_explorer_settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem('espana_explorer_settings');
    if (!raw) return getDefaultSettings();
    return { ...getDefaultSettings(), ...JSON.parse(raw) };
  } catch {
    return getDefaultSettings();
  }
}

// Auto-save manager
export class AutoSaveManager {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private getState: () => GameState;
  private onSave: (success: boolean) => void;
  private getPlayerId?: () => string | undefined;

  constructor(
    getState: () => GameState,
    onSave: (success: boolean) => void,
    getPlayerId?: () => string | undefined
  ) {
    this.getState = getState;
    this.onSave = onSave;
    this.getPlayerId = getPlayerId;
  }

  start(intervalMs: number = 60000) {
    this.stop();
    this.intervalId = setInterval(() => {
      const state = this.getState();
      const playerId = this.getPlayerId?.() || state.player?.id;
      const success = saveGame(state, playerId);
      this.onSave(success);
    }, intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  saveNow() {
    const state = this.getState();
    const playerId = this.getPlayerId?.() || state.player?.id;
    const success = saveGame(state, playerId);
    this.onSave(success);
    return success;
  }
}
