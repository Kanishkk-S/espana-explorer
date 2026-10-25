// ============================================================
// ESPAÑA EXPLORER — Quest Definitions
// ============================================================

import { Quest } from '@/types/game';

export const QUESTS: Record<string, Quest> = {
  // ------------------------------------------------------------
  // MAIN QUEST 1: The Forgotten Atlas
  // ------------------------------------------------------------
  the_forgotten_atlas: {
    id: 'the_forgotten_atlas',
    name: 'El Atlas Olvidado (The Forgotten Atlas)',
    description: 'Legends speak of "El Atlas Olvidado" — a masterwork map created by Renaissance cartographers containing secret knowledge of Spain\'s hidden sanctuaries. Seek out Head Librarian Doña Isabel in the ancient library of Madrid to investigate.',
    type: 'dialogue',
    cityId: 'madrid',
    areaId: 'madrid_biblioteca',
    prerequisites: [],
    status: 'available',
    npcId: 'dona_isabel',
    isMainQuest: true,
    chapter: 1,
    completionDialogueId: 'isabel_atlas_explained',
    objectives: [
      {
        id: 'obj_talk_isabel',
        description: 'Speak with Head Librarian Doña Isabel inside La Biblioteca Antigua.',
        type: 'talk',
        target: 'dona_isabel',
        current: 0,
        required: 1,
        completed: false,
        hidden: false,
      },
      {
        id: 'obj_receive_card',
        description: 'Obtain the Carnet de Investigador (Archivist Card) to access restricted archives.',
        type: 'collect',
        target: 'library_card',
        current: 0,
        required: 1,
        completed: false,
        hidden: false,
      },
    ],
    rewards: [
      {
        type: 'experience',
        experience: 50,
      },
      {
        type: 'item',
        itemId: 'library_card',
      },
      {
        type: 'journal_entry',
      },
    ],
  },

  // ------------------------------------------------------------
  // MAIN QUEST 2: Symbols of the Past
  // ------------------------------------------------------------
  symbols_of_the_past: {
    id: 'symbols_of_the_past',
    name: 'Símbolos del Pasado (Symbols of the Past)',
    description: 'Doña Isabel revealed that pages of the Atlas were concealed using celestial ciphers. Search the library\'s shelves and old illuminated folios to locate and decode the 3 missing cartographic symbols.',
    type: 'exploration',
    cityId: 'madrid',
    areaId: 'madrid_biblioteca',
    prerequisites: ['the_forgotten_atlas'],
    status: 'locked',
    npcId: 'dona_isabel',
    isMainQuest: true,
    chapter: 1,
    completionDialogueId: 'isabel_symbols_decoded',
    objectives: [
      {
        id: 'obj_find_symbols',
        description: 'Inspect illuminated manuscripts and ancient codices in the library (0/3 found).',
        type: 'interact',
        target: 'library_symbol',
        current: 0,
        required: 3,
        completed: false,
        hidden: false,
      },
      {
        id: 'obj_create_rubbing',
        description: 'Take charcoal rubbings of the symbols to preserve their astronomical alignment.',
        type: 'discover',
        target: 'symbol_rubbing',
        current: 0,
        required: 1,
        completed: false,
        hidden: false,
      },
    ],
    rewards: [
      {
        type: 'experience',
        experience: 75,
      },
      {
        type: 'item',
        itemId: 'symbol_rubbing',
      },
    ],
  },

  // ------------------------------------------------------------
  // MAIN QUEST 3: The Locked Drawer
  // ------------------------------------------------------------
  the_locked_drawer: {
    id: 'the_locked_drawer',
    name: 'El Cajón Sellado (The Locked Drawer)',
    description: 'A heavy mahogany archive drawer in the back alcove of the library is sealed with both an antique lock and four rotating astronomical dials. Acquire the matching brass key and solve the celestial dial sequence to see what is hidden inside.',
    type: 'puzzle',
    cityId: 'madrid',
    areaId: 'madrid_biblioteca',
    prerequisites: ['symbols_of_the_past'],
    status: 'locked',
    npcId: 'dona_isabel',
    isMainQuest: true,
    chapter: 1,
    completionDialogueId: 'drawer_unlocked',
    objectives: [
      {
        id: 'obj_get_key',
        description: 'Obtain the Llave Oxidada (Old Key) from Señora Lucía in Plaza de la Llegada.',
        type: 'collect',
        target: 'old_key',
        current: 0,
        required: 1,
        completed: false,
        hidden: false,
      },
      {
        id: 'obj_solve_symbols',
        description: 'Align the 4 celestial dials (Sun, Moon, Star, Compass) on the drawer lock.',
        type: 'solve_puzzle',
        target: 'symbol_sequence',
        current: 0,
        required: 1,
        completed: false,
        hidden: false,
      },
      {
        id: 'obj_open_drawer',
        description: 'Open the secret drawer and retrieve the mysterious note and artifact lens.',
        type: 'interact',
        target: 'madrid_bib_drawer',
        current: 0,
        required: 1,
        completed: false,
        hidden: false,
      },
    ],
    rewards: [
      {
        type: 'experience',
        experience: 100,
      },
      {
        type: 'item',
        itemId: 'artifact_lens',
      },
      {
        type: 'item',
        itemId: 'mysterious_note',
      },
    ],
  },

  // ------------------------------------------------------------
  // MAIN QUEST 4: The Hidden Garden
  // ------------------------------------------------------------
  the_hidden_garden: {
    id: 'the_hidden_garden',
    name: 'El Patio Secreto (The Hidden Garden)',
    description: 'The coded note points toward a hidden sunlit sanctuary behind the library\'s deepest bookshelf. Unlatch the hidden panel, venture into the cloistered courtyard, and speak with Don Mateo, the silent keeper of the garden.',
    type: 'exploration',
    cityId: 'madrid',
    areaId: 'madrid_patio',
    prerequisites: ['the_locked_drawer'],
    status: 'locked',
    npcId: 'don_mateo',
    isMainQuest: true,
    chapter: 1,
    completionDialogueId: 'mateo_welcome',
    objectives: [
      {
        id: 'obj_find_hidden_door',
        description: 'Locate and trigger the hidden mechanism behind the tall bookshelf.',
        type: 'interact',
        target: 'madrid_bib_hidden_panel',
        current: 0,
        required: 1,
        completed: false,
        hidden: false,
      },
      {
        id: 'obj_enter_patio',
        description: 'Step through the mossy stone archway into El Patio Secreto.',
        type: 'explore',
        target: 'madrid_patio',
        current: 0,
        required: 1,
        completed: false,
        hidden: false,
      },
      {
        id: 'obj_talk_mateo',
        description: 'Speak with Don Mateo near the stone fountain pool.',
        type: 'talk',
        target: 'don_mateo',
        current: 0,
        required: 1,
        completed: false,
        hidden: false,
      },
    ],
    rewards: [
      {
        type: 'experience',
        experience: 100,
      },
      {
        type: 'unlock_area',
        areaId: 'madrid_patio',
      },
      {
        type: 'journal_entry',
      },
    ],
  },

  // ------------------------------------------------------------
  // MAIN QUEST 5: First Atlas Page
  // ------------------------------------------------------------
  first_atlas_page: {
    id: 'first_atlas_page',
    name: 'La Primera Hoja (The First Atlas Page)',
    description: 'Don Mateo confirms that the very first folio of the Forgotten Atlas is sealed within an ancient stone mechanism beside the weeping statue. Use the Lente de Revelación to reveal the cipher, unlock the reliquary, and claim the page.',
    type: 'puzzle',
    cityId: 'madrid',
    areaId: 'madrid_patio',
    prerequisites: ['the_hidden_garden'],
    status: 'locked',
    npcId: 'dona_isabel',
    isMainQuest: true,
    chapter: 1,
    completionDialogueId: 'isabel_atlas_page_received',
    objectives: [
      {
        id: 'obj_use_lens',
        description: 'Use the Lente de Revelación on the courtyard solar pedestal.',
        type: 'solve_puzzle',
        target: 'courtyard_mechanism',
        current: 0,
        required: 1,
        completed: false,
        hidden: false,
      },
      {
        id: 'obj_retrieve_atlas_page',
        description: 'Recover the first page of El Atlas Olvidado (Página del Atlas I).',
        type: 'collect',
        target: 'atlas_fragment_1',
        current: 0,
        required: 1,
        completed: false,
        hidden: false,
      },
      {
        id: 'obj_report_isabel',
        description: 'Present the recovered Atlas page to Doña Isabel in the library.',
        type: 'talk',
        target: 'dona_isabel',
        current: 0,
        required: 1,
        completed: false,
        hidden: false,
      },
    ],
    rewards: [
      {
        type: 'experience',
        experience: 200,
      },
      {
        type: 'item',
        itemId: 'ancient_seal',
      },
      {
        type: 'unlock_city',
        cityId: 'toledo',
      },
      {
        type: 'achievement',
        achievementId: 'atlas_seeker_1',
      },
    ],
  },

  // ------------------------------------------------------------
  // SIDE QUEST 1: The Old Key
  // ------------------------------------------------------------
  the_old_key: {
    id: 'the_old_key',
    name: 'La Llave Misteriosa (The Mysterious Key)',
    description: 'Señora Lucía has an antique brass key on display at her market stall in Plaza de la Llegada. She won\'t sell it for pesetas, but she will trade it for information regarding the forgotten royal insignia stamped upon it.',
    type: 'item_retrieval',
    cityId: 'madrid',
    areaId: 'madrid_plaza',
    prerequisites: [],
    status: 'available',
    npcId: 'senora_lucia',
    isMainQuest: false,
    completionDialogueId: 'lucia_trade_complete',
    objectives: [
      {
        id: 'obj_talk_lucia',
        description: 'Inquire about the curious key at Señora Lucía\'s market stall.',
        type: 'talk',
        target: 'senora_lucia',
        current: 0,
        required: 1,
        completed: false,
        hidden: false,
      },
      {
        id: 'obj_learn_origin',
        description: 'Ask Don Alfonso about the sunburst insignia stamped on the key.',
        type: 'talk',
        target: 'don_alfonso',
        current: 0,
        required: 1,
        completed: false,
        hidden: false,
      },
      {
        id: 'obj_trade_info',
        description: 'Inform Señora Lucía of the Royal Cartographers Guild crest to claim the key.',
        type: 'talk',
        target: 'senora_lucia',
        current: 0,
        required: 1,
        completed: false,
        hidden: false,
      },
    ],
    rewards: [
      {
        type: 'experience',
        experience: 60,
      },
      {
        type: 'item',
        itemId: 'old_key',
      },
    ],
  },

  // ------------------------------------------------------------
  // SIDE QUEST 2: Historical Markers
  // ------------------------------------------------------------
  historical_markers: {
    id: 'historical_markers',
    name: 'Ecos de la Historia (Echoes of History)',
    description: 'Don Alfonso, Madrid\'s devoted civic historian, is documenting historical inscriptions carved into the stone plaza landmarks. Find the three historical markers around Plaza de la Llegada and copy their texts for his chronicle.',
    type: 'collection',
    cityId: 'madrid',
    areaId: 'madrid_plaza',
    prerequisites: [],
    status: 'available',
    npcId: 'don_alfonso',
    isMainQuest: false,
    completionDialogueId: 'alfonso_markers_chronicled',
    objectives: [
      {
        id: 'obj_marker_foundation',
        description: 'Examine the 16th-century Plaza Foundation Stone near the eastern colonnade.',
        type: 'interact',
        target: 'marker_foundation',
        current: 0,
        required: 1,
        completed: false,
        hidden: false,
      },
      {
        id: 'obj_marker_fountain',
        description: 'Read the Latin verse inscribed upon the rim of the central fountain basin.',
        type: 'interact',
        target: 'marker_fountain',
        current: 0,
        required: 1,
        completed: false,
        hidden: false,
      },
      {
        id: 'obj_marker_arch',
        description: 'Inspect the bronze memorial plaque beside the Library Portal.',
        type: 'interact',
        target: 'marker_arch',
        current: 0,
        required: 1,
        completed: false,
        hidden: false,
      },
      {
        id: 'obj_report_alfonso',
        description: 'Deliver the transcribed marker notes to Don Alfonso.',
        type: 'talk',
        target: 'don_alfonso',
        current: 0,
        required: 1,
        completed: false,
        hidden: false,
      },
    ],
    rewards: [
      {
        type: 'experience',
        experience: 80,
      },
      {
        type: 'item',
        itemId: 'historian_badge',
      },
      {
        type: 'achievement',
        achievementId: 'madrid_historian',
      },
    ],
  },

  // ------------------------------------------------------------
  // SIDE QUEST 3: Lost Compass
  // ------------------------------------------------------------
  lost_compass: {
    id: 'lost_compass',
    name: 'La Brújula Extraviada (The Lost Compass)',
    description: 'Carlos el Viajero, a youthful nomad preparing for journeys south, dropped his grandfather\'s navigational compass somewhere in the plaza while admiring the architecture. Help him retrieve it.',
    type: 'item_retrieval',
    cityId: 'madrid',
    areaId: 'madrid_plaza',
    prerequisites: [],
    status: 'available',
    npcId: 'carlos_viajero',
    isMainQuest: false,
    completionDialogueId: 'carlos_compass_returned',
    objectives: [
      {
        id: 'obj_talk_carlos',
        description: 'Speak with Carlos el Viajero on the western walkway of the plaza.',
        type: 'talk',
        target: 'carlos_viajero',
        current: 0,
        required: 1,
        completed: false,
        hidden: false,
      },
      {
        id: 'obj_find_compass',
        description: 'Search the cobblestones near the plaza benches and flower beds for the compass.',
        type: 'collect',
        target: 'old_compass',
        current: 0,
        required: 1,
        completed: false,
        hidden: false,
      },
      {
        id: 'obj_return_compass',
        description: 'Return the old brass compass safely to Carlos.',
        type: 'talk',
        target: 'carlos_viajero',
        current: 0,
        required: 1,
        completed: false,
        hidden: false,
      },
    ],
    rewards: [
      {
        type: 'experience',
        experience: 60,
      },
      {
        type: 'journal_entry',
      },
    ],
  },
};
