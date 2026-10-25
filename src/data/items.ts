// ============================================================
// ESPAÑA EXPLORER — Item Definitions
// ============================================================

import { Item, ItemDefinition } from '@/types/game';

export const ITEM_DEFINITIONS: Record<string, ItemDefinition> = {
  old_key: {
    id: 'old_key',
    name: 'Llave Oxidada (Old Key)',
    description: 'An intricately carved brass key with a green patina and a sunburst motif on the bow. Obtained from Señora Lucía\'s market stall.',
    category: 'key',
    icon: 'key',
    maxQuantity: 1,
    usable: true,
    useTarget: 'madrid_bib_drawer',
    questId: 'the_locked_drawer',
    unique: true,
  },
  atlas_fragment_1: {
    id: 'atlas_fragment_1',
    name: 'Página del Atlas I (Atlas Page I)',
    description: 'The first recovered folio of the legendary Forgotten Atlas (El Atlas Olvidado). Glowing lines depict ancient constellations and hidden roads across the Iberian peninsula.',
    category: 'artifact',
    icon: 'atlas_page',
    maxQuantity: 1,
    usable: true,
    questId: 'first_atlas_page',
    unique: true,
  },
  artifact_lens: {
    id: 'artifact_lens',
    name: 'Lente de Revelación (Artifact Lens)',
    description: 'A polished quartz lens encased in spun silver. When held up to ancient stonework, it reveals invisible script and celestial alignments.',
    category: 'tool',
    icon: 'lens',
    maxQuantity: 1,
    usable: true,
    useTarget: 'madrid_patio_mechanism',
    questId: 'the_hidden_garden',
    unique: true,
  },
  symbol_rubbing: {
    id: 'symbol_rubbing',
    name: 'Frotado de Símbolos (Symbol Rubbings)',
    description: 'Charcoal rubbings of four glyphs found hidden among the library manuscripts: the Sun, Moon, Star, and Compass.',
    category: 'quest_item',
    icon: 'parchment',
    maxQuantity: 1,
    usable: false,
    questId: 'symbols_of_the_past',
    unique: true,
  },
  mysterious_note: {
    id: 'mysterious_note',
    name: 'Nota Cifrada (Coded Note)',
    description: 'A parchment slip recovered from the librarian\'s secret drawer. It bears coordinates pointing beyond the library walls: "Where orange blossoms meet ancient water."',
    category: 'quest_item',
    icon: 'note',
    maxQuantity: 1,
    usable: true,
    questId: 'the_locked_drawer',
    unique: true,
  },
  old_compass: {
    id: 'old_compass',
    name: 'Brújula de Carlos (Carlos\'s Compass)',
    description: 'A well-traveled brass compass with an enameled needle that gently trembles toward historical anomalies rather than true north.',
    category: 'quest_item',
    icon: 'compass',
    maxQuantity: 1,
    usable: false,
    questId: 'lost_compass',
    unique: true,
  },
  historian_badge: {
    id: 'historian_badge',
    name: 'Insignia de Cronista (Historian Badge)',
    description: 'A bronze medallion granted by Don Alfonso for cataloging the forgotten commemorative plaques of Madrid. Scholars and archivists respect its bearer.',
    category: 'collectible',
    icon: 'badge',
    maxQuantity: 1,
    usable: false,
    questId: 'historical_markers',
    unique: true,
  },
  library_card: {
    id: 'library_card',
    name: 'Carnet de Investigador (Archivist Card)',
    description: 'An official parchment pass signed by Head Librarian Doña Isabel, granting access to restricted archives and private reading courtyards.',
    category: 'quest_item',
    icon: 'card',
    maxQuantity: 1,
    usable: false,
    questId: 'the_forgotten_atlas',
    unique: true,
  },
  garden_flower: {
    id: 'garden_flower',
    name: 'Flor del Alba (Dawn Jasmine)',
    description: 'A luminescent white flower picked from El Patio Secreto. It blooms only in courtyards untouched by mortal bustle for centuries.',
    category: 'collectible',
    icon: 'flower',
    maxQuantity: 5,
    usable: false,
    unique: false,
  },
  ancient_seal: {
    id: 'ancient_seal',
    name: 'Sello Imperial Olvidado (Forgotten Seal)',
    description: 'A heavy cinnabar wax seal bearing the emblem of the Royal Cartographers Guild of 1588. It bound the binding straps of the Atlas.',
    category: 'artifact',
    icon: 'seal',
    maxQuantity: 1,
    usable: false,
    questId: 'first_atlas_page',
    unique: true,
  },
};

/**
 * Creates an instantiated Item instance from an ItemDefinition.
 */
export function createItem(id: string, quantity: number = 1): Item {
  const def = ITEM_DEFINITIONS[id];
  if (!def) {
    throw new Error(`Item definition not found for id: "${id}"`);
  }
  return {
    id: def.id,
    name: def.name,
    description: def.description,
    category: def.category,
    icon: def.icon,
    quantity,
    maxQuantity: def.maxQuantity,
    usable: def.usable,
    useTarget: def.useTarget,
    questId: def.questId,
    source: 'game_content',
    unique: def.unique,
  };
}
