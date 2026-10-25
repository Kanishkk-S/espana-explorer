// ============================================================
// ESPAÑA EXPLORER — Cities Definitions
// ============================================================

import { City, CityId } from '@/types/game';
import { MADRID_AREAS } from './areas/madrid';

export const CITIES: Record<CityId, City> = {
  // ------------------------------------------------------------
  // 1. MADRID — Starting City
  // ------------------------------------------------------------
  madrid: {
    id: 'madrid',
    name: 'Madrid',
    description: 'The golden capital of Castile, famed for monumental stone plazas, whispering fountains, and secret archives that cradle the origins of El Atlas Olvidado.',
    colorPrimary: '#c4714a',     // Terracotta
    colorSecondary: '#d4a840',   // Warm Gold
    colorAccent: '#8e3620',      // Deep Clay
    unlockRequirements: [],
    position: { x: 420, y: 320 },
    completionPercentage: 0,
    areas: MADRID_AREAS,
  },

  // ------------------------------------------------------------
  // 2. TOLEDO — City of Three Cultures & Steel
  // ------------------------------------------------------------
  toledo: {
    id: 'toledo',
    name: 'Toledo',
    description: 'An ancient fortress city encircled by the river Tagus. Renowned for legendary damascene swordsmiths, alchemical scriptoriums, and subterranean crypts.',
    colorPrimary: '#475569',     // Steel Grey
    colorSecondary: '#78350f',   // Medieval Brown
    colorAccent: '#94a3b8',      // Bright Polished Steel
    unlockRequirements: ['first_atlas_page'],
    position: { x: 400, y: 380 },
    completionPercentage: 0,
    areas: [
      {
        id: 'toledo_plaza_zocodover',
        cityId: 'toledo',
        name: 'Plaza de Zocodover',
        description: 'The historic heart of Toledo where armories, shadow-carved arches, and old bridges overlook the river Tagus.',
        width: 800,
        height: 600,
        backgroundColor: '#78716c',
        spawnPoint: { x: 400, y: 500 },
        environmentObjects: [
          {
            id: 'toledo_ground',
            type: 'plaza_tile',
            position: { x: 50, y: 50 },
            width: 700,
            height: 500,
            zIndex: 1,
            layer: 'ground',
          },
          {
            id: 'toledo_arch_gate',
            type: 'arch',
            position: { x: 300, y: 30 },
            width: 200,
            height: 90,
            zIndex: 10,
            layer: 'objects',
            collision: { x: 300, y: 30, width: 200, height: 70, solid: true },
          },
          {
            id: 'toledo_smith_shop',
            type: 'shop',
            position: { x: 80, y: 80 },
            width: 180,
            height: 120,
            zIndex: 10,
            layer: 'objects',
            collision: { x: 80, y: 80, width: 180, height: 100, solid: true },
          },
          {
            id: 'toledo_well',
            type: 'well',
            position: { x: 380, y: 270 },
            width: 50,
            height: 50,
            zIndex: 12,
            layer: 'objects',
            collision: { x: 380, y: 270, width: 50, height: 50, solid: true },
          },
        ],
        npcs: [],
        interactables: [
          {
            id: 'toledo_gate_sign',
            name: 'Puerta de Bisagra (Gate Inscription)',
            type: 'sign',
            position: { x: 480, y: 130 },
            width: 24,
            height: 32,
            interactionRange: 45,
            persistentId: 'toledo_gate_sign',
            state: 'available',
            visualType: 'sign',
            zIndex: 11,
          },
        ],
        collisionBoxes: [
          { x: 0, y: 0, width: 800, height: 30, solid: true },
          { x: 0, y: 0, width: 30, height: 600, solid: true },
          { x: 770, y: 0, width: 30, height: 600, solid: true },
          { x: 0, y: 570, width: 800, height: 30, solid: true },
          { x: 80, y: 80, width: 180, height: 100, solid: true },
          { x: 380, y: 270, width: 50, height: 50, solid: true },
        ],
        exits: [
          {
            id: 'exit_toledo_to_map',
            position: { x: 360, y: 550, width: 80, height: 30 },
            targetArea: 'world_map',
            targetSpawn: { x: 400, y: 380 },
            locked: false,
            label: 'Mapa del Mundo',
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------
  // 3. VALENCIA — City of Waters & Silk
  // ------------------------------------------------------------
  valencia: {
    id: 'valencia',
    name: 'Valencia',
    description: 'A radiant coastal kingdom of turquoise waters, fragrant orange groves, and the ancient Tribunal de las Aguas that guards agrarian hydraulic ciphers.',
    colorPrimary: '#0284c7',     // Ocean Blue
    colorSecondary: '#f97316',   // Citrus Orange
    colorAccent: '#38bdf8',      // Sky Azure
    unlockRequirements: ['toledo_page_recovered'],
    position: { x: 620, y: 350 },
    completionPercentage: 0,
    areas: [
      {
        id: 'valencia_plaza_virgen',
        cityId: 'valencia',
        name: 'Plaza de la Virgen',
        description: 'An open coastal terrace fragrant with blossoms and flowing water from the Turia canals.',
        width: 800,
        height: 600,
        backgroundColor: '#e0f2fe',
        spawnPoint: { x: 400, y: 500 },
        environmentObjects: [
          {
            id: 'val_ground',
            type: 'plaza_tile',
            position: { x: 40, y: 40 },
            width: 720,
            height: 520,
            zIndex: 1,
            layer: 'ground',
          },
          {
            id: 'val_fountain',
            type: 'fountain',
            position: { x: 360, y: 250 },
            width: 80,
            height: 70,
            zIndex: 12,
            animated: true,
            layer: 'objects',
            collision: { x: 365, y: 255, width: 70, height: 60, solid: true },
          },
        ],
        npcs: [],
        interactables: [],
        collisionBoxes: [
          { x: 0, y: 0, width: 800, height: 30, solid: true },
          { x: 0, y: 0, width: 30, height: 600, solid: true },
          { x: 770, y: 0, width: 30, height: 600, solid: true },
          { x: 0, y: 570, width: 800, height: 30, solid: true },
          { x: 365, y: 255, width: 70, height: 60, solid: true },
        ],
        exits: [
          {
            id: 'exit_valencia_to_map',
            position: { x: 360, y: 550, width: 80, height: 30 },
            targetArea: 'world_map',
            targetSpawn: { x: 620, y: 350 },
            locked: false,
            label: 'Mapa del Mundo',
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------
  // 4. BARCELONA — Mediterranean Port of Wonder
  // ------------------------------------------------------------
  barcelona: {
    id: 'barcelona',
    name: 'Barcelona',
    description: 'A vibrant Mediterranean seaport where Gothic vaults meet seafaring guildhalls. Navigators here mapped the celestial tides of the eastern seas.',
    colorPrimary: '#2b6cb0',     // Mediterranean Blue
    colorSecondary: '#e26d5c',   // Coral Pink
    colorAccent: '#7dcde8',      // Seafoam Blue
    unlockRequirements: ['valencia_page_recovered'],
    position: { x: 720, y: 190 },
    completionPercentage: 0,
    areas: [
      {
        id: 'barcelona_port_vell',
        cityId: 'barcelona',
        name: 'Moll de la Fusta (Gothic Port)',
        description: 'A lively stone dock lined with maritime trading houses and caravel masts swaying against the sea.',
        width: 800,
        height: 600,
        backgroundColor: '#bae6fd',
        spawnPoint: { x: 400, y: 500 },
        environmentObjects: [
          {
            id: 'bcn_ground',
            type: 'plaza_tile',
            position: { x: 40, y: 40 },
            width: 720,
            height: 520,
            zIndex: 1,
            layer: 'ground',
          },
        ],
        npcs: [],
        interactables: [],
        collisionBoxes: [
          { x: 0, y: 0, width: 800, height: 30, solid: true },
          { x: 0, y: 0, width: 30, height: 600, solid: true },
          { x: 770, y: 0, width: 30, height: 600, solid: true },
          { x: 0, y: 570, width: 800, height: 30, solid: true },
        ],
        exits: [
          {
            id: 'exit_barcelona_to_map',
            position: { x: 360, y: 550, width: 80, height: 30 },
            targetArea: 'world_map',
            targetSpawn: { x: 720, y: 190 },
            locked: false,
            label: 'Mapa del Mundo',
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------
  // 5. SEVILLA — The Golden Fluvial Port
  // ------------------------------------------------------------
  sevilla: {
    id: 'sevilla',
    name: 'Sevilla',
    description: 'The golden port on the Guadalquivir river. Home of the legendary Casa de la Contratación, holding secrets of the western navigators and uncharted archipelagos.',
    colorPrimary: '#d97706',     // Vibrant Orange
    colorSecondary: '#eab308',   // Sun Yellow
    colorAccent: '#92400e',      // Amber Brown
    unlockRequirements: ['barcelona_page_recovered'],
    position: { x: 260, y: 530 },
    completionPercentage: 0,
    areas: [
      {
        id: 'sevilla_patio_banderas',
        cityId: 'sevilla',
        name: 'Patio de Banderas',
        description: 'A sun-drenched Andalusian courtyard shaded by bitter orange trees within shadow of the Giralda tower.',
        width: 800,
        height: 600,
        backgroundColor: '#fef3c7',
        spawnPoint: { x: 400, y: 500 },
        environmentObjects: [
          {
            id: 'sev_ground',
            type: 'courtyard',
            position: { x: 40, y: 40 },
            width: 720,
            height: 520,
            zIndex: 1,
            layer: 'ground',
          },
        ],
        npcs: [],
        interactables: [],
        collisionBoxes: [
          { x: 0, y: 0, width: 800, height: 30, solid: true },
          { x: 0, y: 0, width: 30, height: 600, solid: true },
          { x: 770, y: 0, width: 30, height: 600, solid: true },
          { x: 0, y: 570, width: 800, height: 30, solid: true },
        ],
        exits: [
          {
            id: 'exit_sevilla_to_map',
            position: { x: 360, y: 550, width: 80, height: 30 },
            targetArea: 'world_map',
            targetSpawn: { x: 260, y: 530 },
            locked: false,
            label: 'Mapa del Mundo',
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------
  // 6. GRANADA — Crown of the Sierra Nevada
  // ------------------------------------------------------------
  granada: {
    id: 'granada',
    name: 'Granada',
    description: 'A mystical mountain jewel crowning the Sierra Nevada. In the geometric palaces and myrtle gardens of the Alhambra lies the final celestial key to the Forgotten Atlas.',
    colorPrimary: '#881337',     // Deep Pomegranate Red
    colorSecondary: '#d4af37',   // Moorish Gold
    colorAccent: '#0d9488',      // Alhambra Turquoise
    unlockRequirements: ['sevilla_page_recovered'],
    position: { x: 440, y: 550 },
    completionPercentage: 0,
    areas: [
      {
        id: 'granada_plaza_nueva',
        cityId: 'granada',
        name: 'Plaza Nueva y el Darro',
        description: 'A stone plaza bordered by the rushing river Darro, looking up at the red ramparts of the Alhambra.',
        width: 800,
        height: 600,
        backgroundColor: '#fecdd3',
        spawnPoint: { x: 400, y: 500 },
        environmentObjects: [
          {
            id: 'gra_ground',
            type: 'plaza_tile',
            position: { x: 40, y: 40 },
            width: 720,
            height: 520,
            zIndex: 1,
            layer: 'ground',
          },
        ],
        npcs: [],
        interactables: [],
        collisionBoxes: [
          { x: 0, y: 0, width: 800, height: 30, solid: true },
          { x: 0, y: 0, width: 30, height: 600, solid: true },
          { x: 770, y: 0, width: 30, height: 600, solid: true },
          { x: 0, y: 570, width: 800, height: 30, solid: true },
        ],
        exits: [
          {
            id: 'exit_granada_to_map',
            position: { x: 360, y: 550, width: 80, height: 30 },
            targetArea: 'world_map',
            targetSpawn: { x: 440, y: 550 },
            locked: false,
            label: 'Mapa del Mundo',
          },
        ],
      },
    ],
  },
};
