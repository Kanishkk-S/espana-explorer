// ============================================================
// ESPAÑA EXPLORER — Main Game Screen
// Primary container managing canvas viewport (~88-90% space),
// GameEngine lifecycle, state persistence, keyboard & controller shortcuts,
// procedural audio, and all storybook UI overlays
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameState,
  Item,
  Puzzle,
  CityId,
  DialogueNode,
  DialogueChoice,
  DialogueCondition,
  DialogueEffect,
  NPCDefinition,
  InteractableObject,
  AreaExit,
  AreaDefinition,
  GameSettings,
  PlayerProfile,
} from '@/types/game';

import { GameEngine } from '@/game/engine/GameEngine';
import { saveGame, loadGame, hasSaveData, deleteSave } from '@/systems/persistence/SaveSystem';
import { CITIES, MADRID_AREAS, createInitialGameState, ITEM_DEFINITIONS, createItem, PUZZLES } from '@/data';
import { ControllerManager } from '@/systems/controller/ControllerManager';
import { sound } from '@/systems/audio/SoundSystem';

// UI Overlay Components
import PlayerHUD from './PlayerHUD';
import GameTitle from './GameTitle';
import QuickAccessPanel from './QuickAccessPanel';
import DialoguePanel from './DialoguePanel';
import InventoryPanel from './InventoryPanel';
import JournalPanel from './JournalPanel';
import QuestLogPanel from './QuestLogPanel';
import WorldMap from './WorldMap';
import PauseMenu from './PauseMenu';
import MainMenu from './MainMenu';
import Notification from './Notification';
import PuzzlePanel from './PuzzlePanel';
import ControllerModal from './ControllerModal';
import SettingsModal from './SettingsModal';
import RfidLoginScreen from './RfidLoginScreen';
import { THEME } from './uiTheme';

// Build indexed areas map from Madrid areas
const AREAS_MAP: Record<string, AreaDefinition> = {};
MADRID_AREAS.forEach((area) => {
  AREAS_MAP[area.id] = area;
});

export const GameScreen: React.FC = () => {
  // Canvas and Container Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const controllerRef = useRef<ControllerManager>(new ControllerManager());

  // Player Profile & Scene States
  const [activePlayer, setActivePlayer] = useState<PlayerProfile | null>(null);
  const activePlayerRef = useRef<PlayerProfile | null>(null);
  activePlayerRef.current = activePlayer;

  const [scene, setScene] = useState<'rfid_login' | 'main_menu' | 'gameplay'>('rfid_login');
  const [hasSave, setHasSave] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showInventory, setShowInventory] = useState<boolean>(false);
  const [showJournal, setShowJournal] = useState<boolean>(false);
  const [showQuestLog, setShowQuestLog] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [showControllerModal, setShowControllerModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);

  // Dialogue State
  const [activeDialogue, setActiveDialogue] = useState<DialogueNode | null>(null);
  const [activeNPC, setActiveNPC] = useState<NPCDefinition | null>(null);

  // Interaction & Notifications
  const [nearbyTarget, setNearbyTarget] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type?: string;
    title?: string;
  } | null>(null);
  const [trackedQuestId, setTrackedQuestId] = useState<string>('the_forgotten_atlas');

  // Master Game State
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = loadGame();
    return saved ? saved : createInitialGameState();
  });
  const gameStateRef = useRef<GameState>(gameState);
  gameStateRef.current = gameState;

  // Check saved game presence on mount
  useEffect(() => {
    setHasSave(hasSaveData());
    if (gameState.settings) {
      sound.setVolumes(gameState.settings.sfxVolume, gameState.settings.musicVolume);
      sound.setMuted(gameState.settings.muted);
    }
  }, [gameState.settings]);

  // Show notification helper
  const triggerNotification = useCallback((message: string, type: string = 'info', title?: string) => {
    setNotification({ message, type, title });
    if (type === 'item') sound.playItemPickup();
    else if (type === 'achievement' || type === 'quest') sound.playQuestComplete();
  }, []);

  // Cleanup Controller only on component unmount
  useEffect(() => {
    const controller = controllerRef.current;
    return () => {
      controller.destroy();
    };
  }, []);

  // Periodic Auto-Save during active gameplay
  useEffect(() => {
    if (scene !== 'gameplay') return;
    const interval = setInterval(() => {
      if (activePlayerRef.current) {
        saveGame(gameStateRef.current, activePlayerRef.current.playerId);
      }
    }, 45000); // Auto-save every 45s
    return () => clearInterval(interval);
  }, [scene]);

  // Handle Controller Events (Buttons, Joystick, RFID)
  useEffect(() => {
    const controller = controllerRef.current;
    const unsub = controller.onEvent((event) => {
      // Forward to game engine input
      if (engineRef.current) {
        engineRef.current.input.injectControllerEvent(event);
      }

      // Handle UI buttons from controller
      if (event.type === 'button') {
        if (event.name === 'SELECT') {
          sound.playClick();
          if (activeDialogue) {
            window.dispatchEvent(new CustomEvent('dialogue_select'));
          } else {
            engineRef.current?.triggerInteraction();
          }
        } else if (event.name === 'MAP') {
          sound.playClick();
          setShowMap((prev) => !prev);
          setShowInventory(false);
          setShowJournal(false);
          setShowQuestLog(false);
        } else if (event.name === 'JOURNAL') {
          sound.playClick();
          setShowJournal((prev) => !prev);
          setShowInventory(false);
          setShowQuestLog(false);
          setShowMap(false);
        } else if (event.name === 'BACK') {
          sound.playClick();
          if (activeDialogue) setActiveDialogue(null);
          else if (activePuzzle) setActivePuzzle(null);
          else if (showInventory) setShowInventory(false);
          else if (showJournal) setShowJournal(false);
          else if (showQuestLog) setShowQuestLog(false);
          else if (showMap) setShowMap(false);
          else if (showControllerModal) setShowControllerModal(false);
          else if (showSettingsModal) setShowSettingsModal(false);
          else if (isPaused) setIsPaused(false);
        } else if (event.name === 'JOY_BTN' || event.name === 'JOY_SW') {
          sound.playClick();
          setIsPaused((prev) => !prev);
        }
      } else if (event.type === 'joystick' && activeDialogue) {
        if (typeof event.y === 'number') {
          if (event.y < 1200) {
            window.dispatchEvent(new CustomEvent('dialogue_navigate', { detail: -1 }));
          } else if (event.y > 2800) {
            window.dispatchEvent(new CustomEvent('dialogue_navigate', { detail: 1 }));
          }
        }
      } else if (event.type === 'rfid' && event.uid) {
        // In login mode, RFID authentication is managed by RfidLoginScreen
        if (controller.getMode() === 'login') {
          return;
        }

        // In gameplay mode, ignore card if still in login cooldown
        if (controller.isInLoginCooldown()) {
          return;
        }

        const mapping = controller.lookupRfidCard(event.uid);
        if (mapping && mapping.itemId) {
          sound.playItemPickup();
          const itemDef = ITEM_DEFINITIONS[mapping.itemId];
          if (itemDef) {
            const newItem = createItem(mapping.itemId, 1);
            setGameState((prev) => {
              const alreadyHas = prev.inventory.some((i) => i.id === newItem.id);
              if (alreadyHas) {
                triggerNotification(`Ya posees la reliquia: ${itemDef.name}`, 'info', 'Tarjeta RFID');
                return prev;
              }
              const next = {
                ...prev,
                inventory: [...prev.inventory, newItem],
              };
              if (activePlayerRef.current) {
                saveGame(next, activePlayerRef.current.playerId);
              }
              return next;
            });
            triggerNotification(`¡Reliquia Descubierta: ${itemDef.name}!`, 'item', 'Tarjeta Mágica RFID');
            controller.displayText('ITEM DESCUBIERTO', itemDef.name.substring(0, 16));
            controller.buzz(100, 1600);
          }
        } else if (mapping && mapping.questTrigger) {
          sound.playQuestComplete();
          const qId = mapping.questTrigger;
          setGameState((prev) => {
            const q = prev.quests[qId];
            if (q && q.status === 'available') {
              const next: GameState = {
                ...prev,
                quests: { ...prev.quests, [qId]: { ...q, status: 'active' as const } },
              };
              if (activePlayerRef.current) {
                saveGame(next, activePlayerRef.current.playerId);
              }
              return next;
            }
            return prev;
          });
          triggerNotification(`Misión activada por tarjeta: ${mapping.name}`, 'quest', 'Misterio Revelado');
          controller.displayText('NUEVA MISION', mapping.name.substring(0, 16));
          controller.buzz(120, 1400);
        } else {
          triggerNotification(`Tarjeta detectada: [${event.uid}]`, 'info', 'Lector RFID');
        }
      }
    });

    return () => {
      unsub();
    };
  }, [
    triggerNotification,
    activeDialogue,
    activePuzzle,
    showInventory,
    showJournal,
    showQuestLog,
    showMap,
    showControllerModal,
    showSettingsModal,
    isPaused,
  ]);

  // Initialize GameEngine when entering gameplay scene
  useEffect(() => {
    if (scene !== 'gameplay') {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const currentAreaId = gameStateRef.current.player.currentArea || 'madrid_plaza';

    const engine = new GameEngine({
      canvas,
      getState: () => gameStateRef.current,
      setState: (updater) => {
        setGameState((prev) => {
          const next = typeof updater === 'function' ? updater(prev) : updater;
          gameStateRef.current = next;
          return next;
        });
      },
      areas: AREAS_MAP,
      initialAreaId: currentAreaId,
      callbacks: {
        onDialogueStart: (npc: NPCDefinition) => {
          sound.playDialogueChirp();
          setActiveNPC(npc);
          if (npc.dialogueTree && npc.dialogueTree.length > 0) {
            // Find appropriate dialogue node based on quest progress and conditions
            let initialNode = npc.dialogueTree[0];
            for (const node of npc.dialogueTree) {
              if (node.condition && checkDialogueCondition(node.condition)) {
                initialNode = node;
                break;
              }
            }
            setActiveDialogue(initialNode);
            if (initialNode.effects) {
              applyDialogueEffects(initialNode.effects);
            }
          }
        },
        onInteractableTrigger: (obj: InteractableObject) => {
          sound.playClick();

          // Puzzle interaction
          if (obj.type === 'puzzle' || obj.puzzleId) {
            const puzzleId = obj.puzzleId || 'symbol_sequence';
            const puzzle = gameStateRef.current.puzzles[puzzleId] || PUZZLES[puzzleId];
            if (puzzle) {
              if (puzzle.solved) {
                triggerNotification(`${puzzle.name} ya ha sido resuelto y activado.`, 'info');
              } else {
                setActivePuzzle(puzzle);
              }
            }
            return;
          }

          // Item pickup
          if (obj.type === 'item_pickup' || obj.givesItem) {
            const itemId = obj.givesItem;
            if (itemId && ITEM_DEFINITIONS[itemId]) {
              const item = createItem(itemId, 1);
              sound.playItemPickup();
              setGameState((prev) => {
                const alreadyHas = prev.inventory.some((i) => i.id === item.id);
                if (alreadyHas) return prev;
                return {
                  ...prev,
                  inventory: [...prev.inventory, item],
                  interactableStates: {
                    ...prev.interactableStates,
                    [obj.id]: 'collected',
                  },
                };
              });
              triggerNotification(`Has recogido: ${item.name}`, 'item', '¡Objeto Hallado!');

              // Progress quest objective if applicable
              if (obj.completesObjective) {
                progressObjective(obj.completesObjective);
              }
            }
            return;
          }

          // Sign, examine, or dialogue object
          if (obj.dialogue && obj.dialogue.length > 0) {
            sound.playDialogueChirp();
            setActiveNPC({
              id: obj.id,
              name: obj.name,
              personality: 'Objeto Inanimado',
              position: obj.position,
              direction: 'down',
              portraitId: 'object',
              dialogueTree: obj.dialogue,
              questIds: [],
              interactionRange: obj.interactionRange,
              animationState: 'idle',
              appearance: {
                skinColor: '#d4a840',
                hairColor: '#5a3a20',
                hairStyle: 'short',
                outfitColor: '#4a6a8a',
                outfitType: 'vest',
                height: 'medium',
              },
            });
            setActiveDialogue(obj.dialogue[0]);

            if (obj.completesObjective) {
              progressObjective(obj.completesObjective);
            }
          }
        },
        onAreaTransition: (exit: AreaExit) => {
          if (exit.targetArea === 'world_map') {
            sound.playClick();
            setShowMap(true);
            return;
          }

          // Check locked condition
          if (exit.locked) {
            if (exit.requiresItem) {
              const hasItem = gameStateRef.current.inventory.some((i) => i.id === exit.requiresItem);
              if (!hasItem) {
                const itemDef = ITEM_DEFINITIONS[exit.requiresItem];
                triggerNotification(
                  `La puerta está cerrada. Necesitas: ${itemDef ? itemDef.name : exit.requiresItem}`,
                  'warning',
                  'Paso Bloqueado'
                );
                return;
              }
            }
          }

          // Perform smooth transition
          sound.playTransition();
          if (engineRef.current && AREAS_MAP[exit.targetArea]) {
            engineRef.current.loadArea(exit.targetArea, exit.targetSpawn);
            const targetAreaDef = AREAS_MAP[exit.targetArea];
            setGameState((prev) => ({
              ...prev,
              player: {
                ...prev.player,
                currentArea: exit.targetArea,
                position: exit.targetSpawn || prev.player.position,
              },
            }));
            triggerNotification(`Entrando a: ${targetAreaDef.name}`, 'info');
          }
        },
        onClosestTargetChange: (target: string | null) => {
          setNearbyTarget(target);
        },
        onNotification: (msg: string) => {
          triggerNotification(msg, 'info');
        },
      },
    });

    engine.start();
    engineRef.current = engine;

    const handleResize = () => {
      if (engineRef.current) {
        engineRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, [scene, triggerNotification]);

  // Objective progress helper
  const progressObjective = (objId: string) => {
    setGameState((prev) => {
      const updatedQuests = { ...prev.quests };
      let changed = false;

      for (const quest of Object.values(updatedQuests)) {
        if (quest.status !== 'active') continue;
        for (const obj of quest.objectives) {
          if (obj.id === objId && !obj.completed) {
            obj.current = obj.required;
            obj.completed = true;
            changed = true;
            triggerNotification(`Objetivo completado: ${obj.description}`, 'quest', '¡Progreso de Misión!');

            // Check if all objectives complete
            if (quest.objectives.every((o) => o.completed)) {
              quest.status = 'completed';
              sound.playQuestComplete();
              triggerNotification(`¡Misión Completada: ${quest.name}!`, 'achievement', '¡Enhorabuena!');
            }
          }
        }
      }

      return changed ? { ...prev, quests: updatedQuests } : prev;
    });
  };

  // Pause engine when overlays or pause menu are open
  useEffect(() => {
    const isAnyOverlayOpen =
      isPaused ||
      showInventory ||
      showJournal ||
      showQuestLog ||
      showMap ||
      showControllerModal ||
      showSettingsModal ||
      activePuzzle !== null ||
      activeDialogue !== null;

    if (engineRef.current) {
      engineRef.current.setPaused(isAnyOverlayOpen);
    }
  }, [
    isPaused,
    showInventory,
    showJournal,
    showQuestLog,
    showMap,
    showControllerModal,
    showSettingsModal,
    activePuzzle,
    activeDialogue,
  ]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    if (scene !== 'gameplay') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      const key = e.key.toLowerCase();

      // Escape: hierarchy to close top overlay or toggle pause
      if (key === 'escape') {
        sound.playClick();
        if (activeDialogue) {
          setActiveDialogue(null);
          return;
        }
        if (activePuzzle) {
          setActivePuzzle(null);
          return;
        }
        if (showInventory) {
          setShowInventory(false);
          return;
        }
        if (showJournal) {
          setShowJournal(false);
          return;
        }
        if (showQuestLog) {
          setShowQuestLog(false);
          return;
        }
        if (showMap) {
          setShowMap(false);
          return;
        }
        if (showControllerModal) {
          setShowControllerModal(false);
          return;
        }
        if (showSettingsModal) {
          setShowSettingsModal(false);
          return;
        }
        setIsPaused((prev) => !prev);
        return;
      }

      // Quick Access Shortcuts
      if (!isPaused && !activeDialogue && !activePuzzle) {
        if (key === 'e' || key === 'enter') {
          engineRef.current?.triggerInteraction();
        } else if (key === 'i') {
          sound.playClick();
          setShowInventory((prev) => !prev);
          setShowJournal(false);
          setShowQuestLog(false);
          setShowMap(false);
        } else if (key === 'j') {
          sound.playClick();
          setShowJournal((prev) => !prev);
          setShowInventory(false);
          setShowQuestLog(false);
          setShowMap(false);
        } else if (key === 'q') {
          sound.playClick();
          setShowQuestLog((prev) => !prev);
          setShowInventory(false);
          setShowJournal(false);
          setShowMap(false);
        } else if (key === 'm') {
          sound.playClick();
          setShowMap((prev) => !prev);
          setShowInventory(false);
          setShowJournal(false);
          setShowQuestLog(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    scene,
    isPaused,
    activeDialogue,
    activePuzzle,
    showInventory,
    showJournal,
    showQuestLog,
    showMap,
    showControllerModal,
    showSettingsModal,
  ]);

  // Sync live companion state (location, quest, objective, clue) to physical ESP32 ST7735 TFT
  useEffect(() => {
    if (scene !== 'gameplay') return;
    const controller = controllerRef.current;
    if (!controller.getStatus().connected) return;

    const activeQ = gameState.quests[trackedQuestId] || Object.values(gameState.quests).find((q) => q.status === 'active');
    const activeObj = activeQ?.objectives.find((o) => !o.completed);

    controller.sendCompanionData({
      loc: gameState.player.currentArea || 'Plaza Llegada',
      quest: activeQ ? activeQ.name : 'Exploracion Libre',
      obj: activeObj ? activeObj.description : 'Habla con vecinos',
      clue: nearbyTarget ? `Cerca: ${nearbyTarget}` : (activeDialogue ? 'En conversacion' : 'SEL: Interactuar'),
    });
  }, [
    scene,
    gameState.player.currentArea,
    trackedQuestId,
    gameState.quests,
    nearbyTarget,
    activeDialogue,
  ]);

  // RFID Login & Session Handlers
  const handleLoginSuccess = (player: PlayerProfile) => {
    setActivePlayer(player);
    const saved = loadGame(player.playerId);
    if (saved) {
      setGameState(saved);
      triggerNotification(`¡Bienvenido de vuelta, ${player.displayName}!`, 'achievement', 'Sesión Iniciada');
    } else {
      const fresh = createInitialGameState();
      fresh.player.id = player.playerId;
      fresh.player.name = player.displayName;
      setGameState(fresh);
      saveGame(fresh, player.playerId);
      triggerNotification(`¡Comienza tu aventura, ${player.displayName}!`, 'achievement', 'Nuevo Explorador');
    }
    setHasSave(true);
    controllerRef.current.setMode('gameplay');
    setScene('gameplay');
  };

  const handleLogout = () => {
    sound.playClick();
    if (activePlayerRef.current) {
      saveGame(gameStateRef.current, activePlayerRef.current.playerId);
    }
    setIsPaused(false);
    setActivePlayer(null);
    controllerRef.current.setMode('login');
    setScene('rfid_login');
    triggerNotification('Sesión cerrada. Escanea una tarjeta para continuar.', 'info', 'Hasta Pronto');
  };

  // Main Menu Handlers
  const handleStartContinue = () => {
    sound.playClick();
    const playerId = activePlayerRef.current?.playerId;
    const saved = loadGame(playerId);
    if (saved) {
      setGameState(saved);
      triggerNotification('Partida cargada exitosamente.', 'info', 'Bienvenido de Vuelta');
    }
    setScene('gameplay');
  };

  const handleStartNewGame = () => {
    sound.playClick();
    const playerId = activePlayerRef.current?.playerId;
    const playerName = activePlayerRef.current?.displayName || 'Explorador';
    const fresh = createInitialGameState();
    if (playerId) {
      fresh.player.id = playerId;
      fresh.player.name = playerName;
    }
    setGameState(fresh);
    saveGame(fresh, playerId);
    setHasSave(true);
    setScene('gameplay');
    triggerNotification('¡Comienza tu viaje en la Plaza de la Llegada!', 'quest', 'Nueva Aventura');
  };

  const handleSaveGame = () => {
    sound.playClick();
    const playerId = activePlayerRef.current?.playerId;
    const success = saveGame(gameState, playerId);
    if (success) {
      setGameState((prev) => ({ ...prev, lastSaved: Date.now() }));
      setHasSave(true);
      triggerNotification('Tu progreso ha sido guardado.', 'info', 'Partida Guardada');
    }
  };

  const handleResetSave = () => {
    const playerId = activePlayerRef.current?.playerId;
    deleteSave(playerId);
    const fresh = createInitialGameState();
    if (playerId) {
      fresh.player.id = playerId;
      fresh.player.name = activePlayerRef.current?.displayName || 'Explorador';
    }
    setGameState(fresh);
    setHasSave(false);
    setShowSettingsModal(false);
    triggerNotification('Progreso reiniciado por completo.', 'info', 'Partida Reiniciada');
  };

  // Dialogue Condition Evaluator
  const checkDialogueCondition = useCallback((cond?: DialogueCondition): boolean => {
    if (!cond) return true;
    const gs = gameStateRef.current;
    switch (cond.type) {
      case 'quest_status':
        if (!cond.questId || !cond.status) return true;
        return gs.quests[cond.questId]?.status === cond.status;
      case 'has_item':
        if (!cond.itemId) return true;
        return gs.inventory.some((i) => i.id === cond.itemId && i.quantity > 0);
      case 'flag':
        if (!cond.flagName) return true;
        return Boolean(gs.flags[cond.flagName]) === Boolean(cond.value ?? true);
      case 'level':
        if (typeof cond.value !== 'number') return true;
        return gs.player.level >= cond.value;
      case 'city_unlocked':
        if (!cond.value) return true;
        return gs.player.unlockedCities.includes(cond.value as CityId);
      default:
        return true;
    }
  }, []);

  // Dialogue Effects Executor (starts quests, completes objectives, gives items, updates journal)
  const applyDialogueEffects = useCallback((effects?: DialogueEffect[]) => {
    if (!effects || effects.length === 0) return;
    setGameState((prev) => {
      let next = { ...prev };
      for (const eff of effects) {
        if (eff.type === 'start_quest' && eff.questId) {
          const q = next.quests[eff.questId];
          if (q) {
            next = {
              ...next,
              quests: {
                ...next.quests,
                [eff.questId]: { ...q, status: 'active' as const },
              },
            };
            triggerNotification(`Nueva Misión: ${q.name || eff.questId}`, 'quest', 'Misión Aceptada');
            sound.playQuestComplete();
          }
        } else if (eff.type === 'complete_quest' && eff.questId) {
          const q = next.quests[eff.questId];
          if (q) {
            const completedObjectives = q.objectives.map((obj) => ({
              ...obj,
              completed: true,
              current: obj.required,
            }));
            next = {
              ...next,
              quests: {
                ...next.quests,
                [eff.questId]: { ...q, status: 'completed' as const, objectives: completedObjectives },
              },
              player: {
                ...next.player,
                experience: next.player.experience + 150,
              },
            };
            triggerNotification(`¡Misión Completada: ${q.name || eff.questId}!`, 'achievement', '¡Victoria!');
            sound.playQuestComplete();
          }
        } else if (eff.type === 'give_item' && eff.itemId) {
          const item = createItem(eff.itemId, 1);
          const existingIdx = next.inventory.findIndex((i) => i.id === item.id);
          let updatedInv = [...next.inventory];
          if (existingIdx >= 0) {
            updatedInv[existingIdx] = {
              ...updatedInv[existingIdx],
              quantity: updatedInv[existingIdx].quantity + 1,
            };
          } else {
            updatedInv.push(item);
          }
          next = { ...next, inventory: updatedInv };
          triggerNotification(`Has recibido: ${item.name}`, 'item', 'Objeto Obtenido');
          sound.playItemPickup();
        } else if (eff.type === 'remove_item' && eff.itemId) {
          next = {
            ...next,
            inventory: next.inventory.filter((i) => i.id !== eff.itemId),
          };
        } else if (eff.type === 'set_flag' && eff.flagName) {
          next = {
            ...next,
            flags: {
              ...next.flags,
              [eff.flagName]: eff.flagValue ?? true,
            },
          };
        } else if (eff.type === 'add_journal' && eff.journalEntry) {
          const already = next.journal.some((j) => j.id === eff.journalEntry!.id);
          if (!already) {
            next = {
              ...next,
              journal: [...next.journal, eff.journalEntry],
            };
            triggerNotification(`Diario: ${eff.journalEntry.title}`, 'info', 'Anotación Guardada');
          }
        } else if (eff.type === 'add_experience' && eff.experience) {
          next = {
            ...next,
            player: {
              ...next.player,
              experience: next.player.experience + eff.experience,
            },
          };
        }
      }
      if (activePlayerRef.current) {
        saveGame(next, activePlayerRef.current.playerId);
      }
      return next;
    });
  }, [triggerNotification]);

  // Dialogue Branching Handlers
  const handleDialogueChoice = (choice: DialogueChoice) => {
    sound.playClick();
    if (!activeNPC) return;

    if (choice.effects) {
      applyDialogueEffects(choice.effects);
    }

    const nextNode = activeNPC.dialogueTree.find((n) => n.id === choice.nextId);
    if (nextNode) {
      setActiveDialogue(nextNode);
      if (nextNode.effects) {
        applyDialogueEffects(nextNode.effects);
      }
    } else {
      setActiveDialogue(null);
    }
  };

  const handleDialogueContinue = () => {
    sound.playClick();
    if (!activeDialogue || !activeNPC) {
      setActiveDialogue(null);
      return;
    }

    if (activeDialogue.nextId) {
      const nextNode = activeNPC.dialogueTree.find((n) => n.id === activeDialogue.nextId);
      if (nextNode) {
        setActiveDialogue(nextNode);
        if (nextNode.effects) {
          applyDialogueEffects(nextNode.effects);
        }
        return;
      }
    }
    setActiveDialogue(null);
  };

  // Travel Handler on World Map
  const handleTravel = (cityId: CityId) => {
    sound.playTransition();
    setShowMap(false);
    const city = CITIES[cityId];
    if (city && city.areas.length > 0) {
      const targetArea = city.areas[0];
      if (engineRef.current) {
        AREAS_MAP[targetArea.id] = targetArea;
        engineRef.current.loadArea(targetArea.id, targetArea.spawnPoint);
      }
      setGameState((prev) => ({
        ...prev,
        player: {
          ...prev.player,
          currentCity: cityId,
          currentArea: targetArea.id,
          position: targetArea.spawnPoint,
        },
      }));
      triggerNotification(
        `Has viajado a ${city.name}. ¡Nuevas maravillas aguardan!`,
        'quest',
        'Viaje Realizado'
      );
    }
  };

  // Puzzle Solved Handler
  const handlePuzzleSubmit = (input: string[]) => {
    const puzzle = activePuzzle;
    if (!puzzle) return;

    sound.playPuzzleSolve();

    const updatedPuzzle: Puzzle = { ...puzzle, solved: true, currentInput: input };

    setGameState((prev) => {
      let nextState = {
        ...prev,
        puzzles: {
          ...prev.puzzles,
          [puzzle.id]: updatedPuzzle,
        },
        player: {
          ...prev.player,
          experience: prev.player.experience + 100,
        },
      };

      // Grant rewards
      if (puzzle.id === 'symbol_sequence') {
        // Unlock courtyard and give mysterious_note and artifact_lens
        const note = createItem('mysterious_note', 1);
        const lens = createItem('artifact_lens', 1);
        nextState = {
          ...nextState,
          inventory: [...nextState.inventory, note, lens],
          flags: { ...nextState.flags, library_drawer_open: true },
        };
      } else if (puzzle.id === 'courtyard_mechanism') {
        const atlasPage = createItem('atlas_fragment_1', 1);
        nextState = {
          ...nextState,
          inventory: [...nextState.inventory, atlasPage],
          flags: { ...nextState.flags, first_atlas_found: true },
          player: {
            ...nextState.player,
            unlockedCities: Array.from(new Set([...nextState.player.unlockedCities, 'toledo' as CityId])),
          },
        };
      }

      return nextState;
    });

    triggerNotification(
      `¡Has resuelto ${puzzle.name}!`,
      'achievement',
      '¡Enigma Resuelto!'
    );

    // Progress related quest objective
    if (puzzle.objectiveId) {
      progressObjective(puzzle.objectiveId);
    }

    setTimeout(() => {
      setActivePuzzle(null);
    }, 1200);
  };

  // Use Item Handler
  const handleUseItem = (item: Item) => {
    sound.playClick();
    if (item.id === 'artifact_lens' && gameState.player.currentArea === 'madrid_patio') {
      setShowInventory(false);
      const puzzle = gameState.puzzles['courtyard_mechanism'] || PUZZLES['courtyard_mechanism'];
      if (puzzle) {
        setActivePuzzle(puzzle);
        triggerNotification('Has alineado la Lente de Revelación en el pedestal solar.', 'item', 'Mecanismo Activado');
      }
    } else if (item.id === 'old_key' && gameState.player.currentArea === 'madrid_biblioteca') {
      setShowInventory(false);
      const puzzle = gameState.puzzles['symbol_sequence'] || PUZZLES['symbol_sequence'];
      if (puzzle) {
        setActivePuzzle(puzzle);
        triggerNotification('La llave antigua encaja en la cerradura del cajón.', 'item', 'Cajón Abierto');
      }
    } else {
      triggerNotification(`Has inspeccionado ${item.name}: ${item.description}`, 'item');
    }
  };

  // Active Panel Tracker for QuickAccessPanel
  const activePanel = showInventory
    ? 'inventory'
    : showJournal
    ? 'journal'
    : showQuestLog
    ? 'quest'
    : showMap
    ? 'map'
    : null;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#1b2318',
        backgroundImage: 'radial-gradient(ellipse at 50% 50%, #526f42 0%, #273820 50%, #121c0f 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Full-Screen RFID Authentication Login Scene */}
      {scene === 'rfid_login' ? (
        <RfidLoginScreen
          controller={controllerRef.current}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        /* 88-90% Viewport Game Frame (Lost Legends Style) */
        <div
          ref={containerRef}
          style={{
            width: '90vw',
            maxWidth: '1440px',
            height: '88vh',
            maxHeight: '900px',
            backgroundColor: '#2a2218',
            borderRadius: '26px',
            border: '3px solid #140e06',
            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.88), 0 0 35px rgba(212, 168, 64, 0.15)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
          }}
        >
          {/* Main Menu Scene Overlay */}
          {scene === 'main_menu' && (
            <MainMenu
              hasSave={hasSave}
              onContinue={handleStartContinue}
              onNewGame={handleStartNewGame}
              onSettings={() => {
                sound.playClick();
                setShowSettingsModal(true);
              }}
              onController={() => {
                sound.playClick();
                setShowControllerModal(true);
              }}
            />
          )}

        {/* 2D Game Rendering Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            backgroundColor: '#3a2e22',
          }}
        />

        {/* HUD & In-Game UI Overlays (Only during Gameplay) */}
        {scene === 'gameplay' && (
          <>
            {/* Top-Left: Player Profile HUD */}
            <PlayerHUD player={gameState.player} />

            {/* Top-Center: Game Title / Logo */}
            <GameTitle />

            {/* Top-Right: Quick Access Panel (Bag, Journal, Quests, Map) */}
            <QuickAccessPanel
              inventoryBadgeCount={gameState.inventory.length}
              journalBadgeCount={gameState.journal.filter((j) => !j.read).length}
              questBadgeCount={Object.values(gameState.quests).filter((q) => q.status === 'active').length}
              activePanel={activePanel}
              onOpenInventory={() => {
                sound.playClick();
                setShowInventory((prev) => !prev);
              }}
              onOpenJournal={() => {
                sound.playClick();
                setShowJournal((prev) => !prev);
              }}
              onOpenQuestLog={() => {
                sound.playClick();
                setShowQuestLog((prev) => !prev);
              }}
              onOpenMap={() => {
                sound.playClick();
                setShowMap((prev) => !prev);
              }}
            />

            {/* Bottom-Center: Nearby Interaction Prompt Banner */}
            {nearbyTarget && !activeDialogue && !activePuzzle && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(28, 20, 14, 0.94)',
                  border: '1.5px solid #d4a840',
                  borderRadius: '24px',
                  padding: '6px 20px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                  color: THEME.colors.textPrimary,
                  fontSize: '0.88rem',
                  fontFamily: THEME.fonts.body,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  zIndex: 35,
                  animation: 'fadeIn 0.2s ease',
                  pointerEvents: 'none',
                }}
              >
                <span
                  style={{
                    backgroundColor: '#d4a840',
                    color: '#1a1004',
                    borderRadius: '4px',
                    padding: '1px 6px',
                    fontSize: '0.74rem',
                    fontFamily: 'monospace',
                    fontWeight: 800,
                  }}
                >
                  E
                </span>
                <span>
                  Interact with: <strong style={{ color: '#fbbf24' }}>{nearbyTarget}</strong>
                </span>
              </div>
            )}

            {/* Bottom: NPC Dialogue Panel */}
            <DialoguePanel
              dialogueNode={activeDialogue}
              npcName={activeNPC?.name || 'Habitante de la Villa'}
              npcAppearance={activeNPC?.appearance}
              filterChoice={(choice) => checkDialogueCondition(choice.condition)}
              onChoice={handleDialogueChoice}
              onContinue={handleDialogueContinue}
              onAccept={() => {
                sound.playQuestComplete();
                triggerNotification('¡Has aceptado la misión!', 'quest', 'Misión Aceptada');
                handleDialogueContinue();
              }}
              onIgnore={() => {
                sound.playClick();
                setActiveDialogue(null);
              }}
            />

            {/* Modal Overlay: Inventory Panel */}
            {showInventory && (
              <InventoryPanel
                items={gameState.inventory}
                onUseItem={handleUseItem}
                onClose={() => {
                  sound.playClick();
                  setShowInventory(false);
                }}
              />
            )}

            {/* Modal Overlay: Journal & Messages Panel */}
            {showJournal && (
              <JournalPanel
                journalEntries={gameState.journal}
                messages={gameState.messages}
                quests={Object.values(gameState.quests)}
                onClose={() => {
                  sound.playClick();
                  setShowJournal(false);
                }}
                onMarkRead={(id) => {
                  setGameState((prev) => ({
                    ...prev,
                    journal: prev.journal.map((j) => (j.id === id ? { ...j, read: true } : j)),
                  }));
                }}
              />
            )}

            {/* Modal Overlay: Quest Log Panel */}
            {showQuestLog && (
              <QuestLogPanel
                quests={gameState.quests}
                trackedQuestId={trackedQuestId}
                onTrackQuest={(id) => {
                  sound.playClick();
                  setTrackedQuestId(id);
                }}
                onClose={() => {
                  sound.playClick();
                  setShowQuestLog(false);
                }}
              />
            )}

            {/* Modal Overlay: World Map */}
            {showMap && (
              <WorldMap
                cities={CITIES}
                currentCity={gameState.player.currentCity}
                unlockedCities={gameState.player.unlockedCities}
                onTravel={handleTravel}
                onClose={() => {
                  sound.playClick();
                  setShowMap(false);
                }}
              />
            )}

            {/* Modal Overlay: Puzzle Panel */}
            {activePuzzle && (
              <PuzzlePanel
                puzzle={activePuzzle}
                inventory={gameState.inventory}
                onSubmit={handlePuzzleSubmit}
                onClose={() => {
                  sound.playClick();
                  setActivePuzzle(null);
                }}
              />
            )}

            {/* Modal Overlay: Pause Menu */}
            {isPaused && (
              <PauseMenu
                lastSaved={gameState.lastSaved}
                playerName={activePlayer?.displayName}
                onResume={() => {
                  sound.playClick();
                  setIsPaused(false);
                }}
                onSave={handleSaveGame}
                onSettings={() => {
                  sound.playClick();
                  setShowSettingsModal(true);
                }}
                onController={() => {
                  sound.playClick();
                  setShowControllerModal(true);
                }}
                onNewGame={() => {
                  sound.playClick();
                  setIsPaused(false);
                  handleStartNewGame();
                }}
                onLogout={handleLogout}
              />
            )}

            {/* Modal Overlay: Controller Setup */}
            {showControllerModal && (
              <ControllerModal
                controller={controllerRef.current}
                onClose={() => {
                  sound.playClick();
                  setShowControllerModal(false);
                }}
              />
            )}

            {/* Modal Overlay: Settings */}
            {showSettingsModal && (
              <SettingsModal
                settings={gameState.settings}
                onUpdateSettings={(newSettings: GameSettings) => {
                  setGameState((prev) => ({ ...prev, settings: newSettings }));
                }}
                onResetSave={handleResetSave}
                onClose={() => {
                  sound.playClick();
                  setShowSettingsModal(false);
                }}
              />
            )}

            {/* Temporary Popup Notification */}
            {notification && (
              <Notification
                message={notification.message}
                type={notification.type}
                title={notification.title}
                onDismiss={() => setNotification(null)}
              />
            )}
          </>
        )}
        </div>
      )}
    </div>
  );
};

export default GameScreen;
