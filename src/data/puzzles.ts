// ============================================================
// ESPAÑA EXPLORER — Puzzle Definitions
// Mysteries & Inscriptions in Español; Hints & Explanations in English
// Designed for beginner learners to decipher Spanish clues with confidence!
// ============================================================

import { Puzzle } from '@/types/game';

export const PUZZLES: Record<string, Puzzle> = {
  // ------------------------------------------------------------
  // PUZZLE 1: Secuencia de los Astros (Library Archive Drawer)
  // ------------------------------------------------------------
  symbol_sequence: {
    id: 'symbol_sequence',
    name: 'Secuencia de los Astros (The Celestial Riddle)',
    type: 'symbol_sequence',
    description:
      '🇪🇸 Misterio en Español: "En el cajón de caoba hay cuatro diales giratorios. Una antigua inscripción reza: «Primero el Sol amanece en el este. Al anochecer, la Luna custodia el firmamento, acompañada por la brillante Estrella. Finalmente, la Brújula guía el rumbo del explorador.» Elige los cuatro símbolos en orden."',
    areaId: 'madrid_biblioteca',
    solution: ['sun', 'moon', 'star', 'compass'],
    currentInput: [],
    attempts: 0,
    maxHints: 3,
    hintsUsed: 0,
    hints: [
      '💡 Hint 1 (Spanish Vocabulary): "Sol" = Sun, "Luna" = Moon, "Estrella" = Star, "Brújula" = Compass. Notice the 4 celestial symbols matching the library codex!',
      '💡 Hint 2 (Riddle Breakdown): The inscription tells a story from dawn to night: 1. "Primero el Sol" (First the Sun)... 2. "Al anochecer, la Luna" (At nightfall, the Moon)...',
      '💡 Hint 3 (Exact Solution): Select the symbols in this exact sequence: Sol (Sun ☀️) → Luna (Moon 🌙) → Estrella (Star ⭐) → Brújula (Compass 🧭). Then click "Comprobar Secuencia"!',
    ],
    solved: false,
    rewards: [
      {
        type: 'experience',
        experience: 100,
      },
      {
        type: 'item',
        itemId: 'mysterious_note',
      },
      {
        type: 'item',
        itemId: 'artifact_lens',
      },
      {
        type: 'unlock_area',
        areaId: 'madrid_patio',
      },
    ],
    objectiveId: 'obj_open_drawer',
  },

  // ------------------------------------------------------------
  // PUZZLE 2: El Mecanismo de Piedra Solar (Courtyard Pedestal)
  // ------------------------------------------------------------
  courtyard_mechanism: {
    id: 'courtyard_mechanism',
    name: 'El Mecanismo de Piedra Solar (The Solar Stone Lock)',
    type: 'mechanism',
    description:
      '🇪🇸 Misterio en Español: "Un antiguo pedestal de piedra descansa junto al estanque del Patio Secreto. La inscripción tallada en la roca dice: «Coloca la Lente de Revelación en la cavidad del pedestal. Enfoca la luz solar hacia la estatua para revelar la primera página del Atlas Olvidado.»"',
    areaId: 'madrid_patio',
    solution: ['align_lens', 'turn_prism', 'focus_light'],
    currentInput: [],
    attempts: 0,
    maxHints: 3,
    hintsUsed: 0,
    hints: [
      '💡 Hint 1 (Spanish Vocabulary): "Lente de Revelación" = Artifact Lens. "Piedra Solar" = Solar Stone Pedestal. "Estatua" = Statue.',
      '💡 Hint 2 (Item Required): You need the "Artifact Lens" (Lente de Revelación) found inside the library drawer after solving the Celestial Riddle.',
      '💡 Hint 3 (Action): Open your Bag [I] and select "Lente de Revelación" (Artifact Lens) or click "Usar Lente de Revelación" below to focus the sunlight and recover the first Atlas page!',
    ],
    solved: false,
    rewards: [
      {
        type: 'experience',
        experience: 150,
      },
      {
        type: 'journal_entry',
      },
      {
        type: 'achievement',
        achievementId: 'first_atlas_secret',
      },
    ],
    objectiveId: 'obj_activate_mechanism',
  },
};
