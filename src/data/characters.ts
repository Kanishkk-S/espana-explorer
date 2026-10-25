// ============================================================
// ESPAÑA EXPLORER — NPC & Character Definitions
// All conversational dialogues in English with authentic Spanish flavor,
// mysteries & inscriptions quoted in Spanish with beginner-friendly English explanations
// ============================================================

import { NPCDefinition } from '@/types/game';

export const NPCS: Record<string, NPCDefinition> = {
  // ------------------------------------------------------------
  // 1. DON ALFONSO — Historian of Madrid
  // ------------------------------------------------------------
  don_alfonso: {
    id: 'don_alfonso',
    name: 'Don Alfonso',
    title: 'City Chronicler (Cronista de la Villa)',
    personality: 'A scholarly, warm-hearted gentleman with an insatiable passion for Madrid\'s founding lore and forgotten architectural inscriptions. Speaks with elegant theatrical cadence.',
    position: { x: 340, y: 310 },
    direction: 'down',
    portraitId: 'portrait_don_alfonso',
    interactionRange: 48,
    animationState: 'idle',
    questIds: ['historical_markers', 'the_old_key'],
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
        id: 'alfonso_start',
        speaker: 'Don Alfonso',
        text: '¡Ah, greetings, young traveler! Welcome to Madrid. Few nowadays pause to admire the noble stones of our town. Every cobblestone in this plaza whispers the footsteps of kings, poets, and cartographers.',
        portraitEmotion: 'happy',
        choices: [
          {
            text: 'What story does this plaza hold, Don Alfonso?',
            nextId: 'alfonso_plaza_lore',
          },
          {
            text: 'I saw an antique key with a radiant sun symbol at the market stall...',
            nextId: 'alfonso_key_inquiry',
            condition: {
              type: 'quest_status',
              questId: 'the_old_key',
              status: 'active',
            },
          },
          {
            text: 'Do you know anything about the legendary "Forgotten Atlas"?',
            nextId: 'alfonso_atlas_lore',
          },
          {
            text: 'I have transcribed the three Spanish historical markers for you!',
            nextId: 'alfonso_markers_complete',
            condition: {
              type: 'quest_status',
              questId: 'historical_markers',
              status: 'active',
            },
          },
          {
            text: 'Just exploring the city. Have a good day, Don Alfonso.',
            nextId: 'alfonso_farewell',
          },
        ],
      },
      {
        id: 'alfonso_plaza_lore',
        speaker: 'Don Alfonso',
        text: 'This is the Plaza de la Llegada, the gateway to old Madrid. Three historic 16th-century commemorative inscriptions are hidden in plain sight, carved in Spanish and Latin. But alas, my aged eyes can no longer read them clearly.',
        portraitEmotion: 'thinking',
        choices: [
          {
            text: 'I can help you find and transcribe those three markers!',
            nextId: 'alfonso_accept_markers_quest',
          },
          {
            text: 'Perhaps a bit later, Don Alfonso.',
            nextId: 'alfonso_start',
          },
        ],
      },
      {
        id: 'alfonso_accept_markers_quest',
        speaker: 'Don Alfonso',
        text: 'Splendid spirit of discovery! Seek out the Foundation Stone to the east, the Spanish inscription on the Moon Fountain (Fuente de la Luna), and the bronze plaque by the library entrance. Take good notes in your journal!',
        portraitEmotion: 'happy',
        effects: [
          {
            type: 'start_quest',
            questId: 'historical_markers',
          },
          {
            type: 'add_journal',
            journalEntry: {
              id: 'journal_madrid_markers_start',
              title: 'Don Alfonso\'s Historical Markers',
              description: 'Don Alfonso has asked me to transcribe three Spanish inscriptions in the Plaza: the eastern foundation stone, the central fountain, and the library plaque.',
              location: 'Plaza de la Llegada, Madrid',
              associatedNPC: 'don_alfonso',
              associatedQuest: 'historical_markers',
              discoveredAt: Date.now(),
              category: 'note',
              sequence: 1,
              read: false,
            },
          },
        ],
        nextId: 'alfonso_start',
      },
      {
        id: 'alfonso_key_inquiry',
        speaker: 'Don Alfonso',
        text: 'By the saints! A radiant sixteen-pointed sun with a compass rose etched inside? That is the ancient seal of King Philip II\'s Royal Guild of Cartographers! That key once opened the secret archive drawer in the library next door.',
        portraitEmotion: 'surprised',
        effects: [
          {
            type: 'set_flag',
            flagName: 'knows_key_origin',
            flagValue: true,
          },
          {
            type: 'add_journal',
            journalEntry: {
              id: 'journal_key_origin',
              title: 'The Cartographer\'s Insignia',
              description: 'Don Alfonso confirmed that the sun emblem on the antique key belongs to the 1588 Royal Guild of Cartographers. Señora Lucía will want to hear this discovery!',
              location: 'Plaza de la Llegada, Madrid',
              associatedNPC: 'don_alfonso',
              associatedQuest: 'the_old_key',
              discoveredAt: Date.now(),
              category: 'clue',
              sequence: 2,
              read: false,
            },
          },
        ],
        choices: [
          {
            text: 'I will go tell Señora Lucía immediately!',
            nextId: 'alfonso_key_inquiry_end',
          },
        ],
      },
      {
        id: 'alfonso_key_inquiry_end',
        speaker: 'Don Alfonso',
        text: 'Tell Lucía that real history is measured in memory, not copper coins. She will honor her promise and entrust the key to you.',
        portraitEmotion: 'neutral',
      },
      {
        id: 'alfonso_atlas_lore',
        speaker: 'Don Alfonso',
        text: 'El Atlas Olvidado (The Forgotten Atlas)? Legend says it held the secret geography of Spain: hidden waterways, subterranean tunnels, and forgotten sanctuaries. After the great fire of 1601, its pages were dispersed across six cities to safeguard them.',
        portraitEmotion: 'thinking',
        choices: [
          {
            text: 'And the first page remained hidden here in Madrid?',
            nextId: 'alfonso_atlas_lore_2',
          },
        ],
      },
      {
        id: 'alfonso_atlas_lore_2',
        speaker: 'Don Alfonso',
        text: 'Precisely! Doña Isabel in the Old Library guards the manuscripts. Speak with her; she holds the ledgers that no ordinary passerby has been able to decipher.',
        portraitEmotion: 'neutral',
        choices: [
          {
            text: 'I will visit the library at once. Thank you, Don Alfonso!',
            nextId: 'alfonso_start',
          },
        ],
      },
      {
        id: 'alfonso_markers_complete',
        speaker: 'Don Alfonso',
        text: 'Extraordinary fieldwork! Your transcriptions match the lost annals word for word. As Chronicler of the City, it is my privilege to award you this Historian\'s Badge!',
        portraitEmotion: 'happy',
        effects: [
          {
            type: 'complete_quest',
            questId: 'historical_markers',
          },
          {
            type: 'give_item',
            itemId: 'historian_badge',
          },
          {
            type: 'add_experience',
            experience: 80,
          },
        ],
        choices: [
          {
            text: 'It is an honor, Don Alfonso. I will wear it proudly!',
            nextId: 'alfonso_after_quest',
          },
        ],
      },
      {
        id: 'alfonso_after_quest',
        speaker: 'Don Alfonso',
        text: 'May your curiosity never falter, young explorer. The stones of Spain hold more mysteries than can fit in a hundred lifetimes!',
        portraitEmotion: 'happy',
      },
      {
        id: 'alfonso_farewell',
        speaker: 'Don Alfonso',
        text: 'Walk with reverence and open eyes. History is alive beneath your feet!',
        portraitEmotion: 'neutral',
      },
    ],
  },

  // ------------------------------------------------------------
  // 2. SEÑORA LUCÍA — Market Seller
  // ------------------------------------------------------------
  senora_lucia: {
    id: 'senora_lucia',
    name: 'Señora Lucía',
    title: 'Antiques Merchant (Mercader de Antigüedades)',
    personality: 'Spirited, sharp-witted market trader with a keen eye for curiosities and gossip. She fiercely protects family heirlooms but deeply respects real historical pedigree.',
    position: { x: 620, y: 380 },
    direction: 'left',
    portraitId: 'portrait_senora_lucia',
    interactionRange: 48,
    animationState: 'idle',
    questIds: ['the_old_key'],
    appearance: {
      skinColor: '#b08050',
      hairColor: '#2a2020',
      hairStyle: 'curly',
      outfitColor: '#d84040',
      outfitType: 'dress',
      accessory: 'necklace',
      height: 'short',
    },
    dialogueTree: [
      {
        id: 'lucia_start',
        speaker: 'Señora Lucía',
        text: 'Step right up, wanderer! Handcrafted Talavera ceramics, fine Almagro lace, and curiosities rescued from old Castilian attics. What catches your eye today?',
        portraitEmotion: 'happy',
        choices: [
          {
            text: 'That antique brass key on your counter has a fascinating design.',
            nextId: 'lucia_key_inquiry',
          },
          {
            text: 'I know who owned that key: King Philip II\'s Royal Guild of Cartographers!',
            nextId: 'lucia_trade_key',
            condition: {
              type: 'flag',
              flagName: 'knows_key_origin',
              value: true,
            },
          },
          {
            text: 'Just browsing your wares, Señora Lucía.',
            nextId: 'lucia_browse',
          },
        ],
      },
      {
        id: 'lucia_key_inquiry',
        speaker: 'Señora Lucía',
        text: 'Ah! You have a sharp eye for relics. I rescued it from an old bookbinder\'s estate. It is not for sale for mere copper coins; I promised my grandmother I would only part with it if someone could prove the true origin of its sunburst emblem.',
        portraitEmotion: 'thinking',
        effects: [
          {
            type: 'start_quest',
            questId: 'the_old_key',
          },
        ],
        choices: [
          {
            text: 'What if I find out who that sun emblem belonged to?',
            nextId: 'lucia_challenge',
          },
          {
            text: 'I will ask the historians around the plaza.',
            nextId: 'lucia_start',
          },
        ],
      },
      {
        id: 'lucia_challenge',
        speaker: 'Señora Lucía',
        text: 'Bring me the true history of that insignia, and the key is yours free of charge! Don Alfonso often strolls by the fountain; he knows every stone in Madrid by heart.',
        portraitEmotion: 'happy',
      },
      {
        id: 'lucia_trade_key',
        speaker: 'Señora Lucía',
        text: 'The 16th-century Royal Guild of Cartographers?! The ones who charted the secret trails of the Tagus river? Heavens above... so my grandmother\'s tales were true! Here, take the antique key; you have earned it fair and square.',
        portraitEmotion: 'surprised',
        effects: [
          {
            type: 'complete_quest',
            questId: 'the_old_key',
          },
          {
            type: 'give_item',
            itemId: 'old_key',
          },
          {
            type: 'add_experience',
            experience: 60,
          },
        ],
        choices: [
          {
            text: 'Thank you so much, Señora Lucía! I will put it to good use.',
            nextId: 'lucia_after_trade',
          },
        ],
      },
      {
        id: 'lucia_after_trade',
        speaker: 'Señora Lucía',
        text: 'May it open doors to grand discoveries, traveler! And if you uncover more antiques on your adventures, remember my stall!',
        portraitEmotion: 'happy',
      },
      {
        id: 'lucia_browse',
        speaker: 'Señora Lucía',
        text: 'Take your time and look around. The best thing about Madrid is that even the air smells like a holiday fair!',
        portraitEmotion: 'neutral',
      },
    ],
  },

  // ------------------------------------------------------------
  // 3. DOÑA ISABEL — Head Librarian
  // ------------------------------------------------------------
  dona_isabel: {
    id: 'dona_isabel',
    name: 'Doña Isabel',
    title: 'Head Librarian (Bibliotecaria Mayor)',
    personality: 'Dignified, erudite guardian of ancient codices. She maintains strict decorum in her library, but her eyes ignite with genuine wonder when speaking of El Atlas Olvidado.',
    position: { x: 350, y: 160 },
    direction: 'down',
    portraitId: 'portrait_dona_isabel',
    interactionRange: 48,
    animationState: 'idle',
    questIds: ['the_forgotten_atlas', 'symbols_of_the_past', 'the_locked_drawer', 'first_atlas_page'],
    appearance: {
      skinColor: '#f0c8a0',
      hairColor: '#5a3a20',
      hairStyle: 'bun',
      outfitColor: '#6a3a7a',
      outfitType: 'robe',
      accessory: 'glasses',
      height: 'tall',
    },
    dialogueTree: [
      {
        id: 'isabel_start',
        speaker: 'Doña Isabel',
        text: 'Quiet, please. In this library, the ancient codices sleep undisturbed. What brings a traveler to the archives of Madrid?',
        portraitEmotion: 'neutral',
        choices: [
          {
            text: 'I am following the trail of "The Forgotten Atlas" (El Atlas Olvidado).',
            nextId: 'isabel_atlas_intro',
            condition: {
              type: 'quest_status',
              questId: 'the_forgotten_atlas',
              status: 'available',
            },
          },
          {
            text: 'I have found and decoded the astronomical symbols across the codices!',
            nextId: 'isabel_symbols_decoded',
            condition: {
              type: 'quest_status',
              questId: 'symbols_of_the_past',
              status: 'active',
            },
          },
          {
            text: 'I recovered the first Atlas page from the secret courtyard!',
            nextId: 'isabel_atlas_page_received',
            condition: {
              type: 'has_item',
              itemId: 'atlas_fragment_1',
            },
          },
          {
            text: 'I just wish to consult some historical volumes.',
            nextId: 'isabel_reading_advice',
          },
        ],
      },
      {
        id: 'isabel_atlas_intro',
        speaker: 'Doña Isabel',
        text: 'Lower your voice! The Forgotten Atlas is no mere tavern rumor... It is the most sacred cartographic codex ever crafted in this kingdom. Six illuminated folios unifying the astronomical, botanical, and geographical secrets of Spain.',
        portraitEmotion: 'thinking',
        choices: [
          {
            text: 'How can I help recover the missing pages?',
            nextId: 'isabel_atlas_quest_grant',
          },
        ],
      },
      {
        id: 'isabel_atlas_quest_grant',
        speaker: 'Doña Isabel',
        text: 'You will need credentials to access the restricted archives. Take this Library Card (Carnet de Investigador). To begin, you must find three celestial symbols encrypted among our historical manuscripts.',
        portraitEmotion: 'happy',
        effects: [
          {
            type: 'complete_quest',
            questId: 'the_forgotten_atlas',
          },
          {
            type: 'give_item',
            itemId: 'library_card',
          },
          {
            type: 'start_quest',
            questId: 'symbols_of_the_past',
          },
          {
            type: 'add_experience',
            experience: 50,
          },
          {
            type: 'add_journal',
            journalEntry: {
              id: 'journal_atlas_mission',
              title: 'The Quest for the Forgotten Atlas',
              description: 'Doña Isabel gave me researcher clearance. I must locate the three celestial symbols hidden across the library manuscripts to decipher the drawer puzzle.',
              location: 'La Biblioteca Antigua, Madrid',
              associatedNPC: 'dona_isabel',
              associatedQuest: 'symbols_of_the_past',
              discoveredAt: Date.now(),
              category: 'story',
              sequence: 3,
              read: false,
            },
          },
        ],
        choices: [
          {
            text: 'I will examine the books with the greatest care.',
            nextId: 'isabel_start',
          },
        ],
      },
      {
        id: 'isabel_symbols_decoded',
        speaker: 'Doña Isabel',
        text: 'Splendid! The Spanish celestial riddle in the ledger translates as: First the radiant Sun (Sol), then the watchful Moon (Luna), followed by the North Star (Estrella), and guided by the Compass (Brújula). That is the exact combination for the locked mahogany drawer!',
        portraitEmotion: 'happy',
        effects: [
          {
            type: 'complete_quest',
            questId: 'symbols_of_the_past',
          },
          {
            type: 'start_quest',
            questId: 'the_locked_drawer',
          },
          {
            type: 'add_experience',
            experience: 75,
          },
        ],
        choices: [
          {
            text: 'What key fits into the drawer lock?',
            nextId: 'isabel_locked_drawer_hint',
          },
        ],
      },
      {
        id: 'isabel_locked_drawer_hint',
        speaker: 'Doña Isabel',
        text: 'The lock requires the antique key with the sun insignia. If you obtained it from Señora Lucía in the market, insert it into the drawer and align the four celestial dials: Sun → Moon → Star → Compass!',
        portraitEmotion: 'thinking',
      },
      {
        id: 'isabel_atlas_page_received',
        speaker: 'Doña Isabel',
        text: 'Heavens above!... Look at those vibrant lapis lazuli and gold leaf inks! It is the First Folio of the Forgotten Atlas, intact after four centuries behind the secret revolving bookshelf!',
        portraitEmotion: 'surprised',
        effects: [
          {
            type: 'complete_quest',
            questId: 'first_atlas_page',
          },
          {
            type: 'give_item',
            itemId: 'ancient_seal',
          },
          {
            type: 'add_experience',
            experience: 200,
          },
          {
            type: 'add_journal',
            journalEntry: {
              id: 'journal_first_page_recovered',
              title: 'The First Atlas Page Recovered!',
              description: 'The recovered page reveals the ancient imperial highway leading south from Madrid to the historic city of Toledo. The adventure has begun!',
              location: 'La Biblioteca Antigua, Madrid',
              associatedNPC: 'dona_isabel',
              associatedQuest: 'first_atlas_page',
              discoveredAt: Date.now(),
              category: 'atlas_page',
              sequence: 4,
              read: false,
            },
          },
        ],
        choices: [
          {
            text: 'Where does the map point next?',
            nextId: 'isabel_toledo_unlocked',
          },
        ],
      },
      {
        id: 'isabel_toledo_unlocked',
        speaker: 'Doña Isabel',
        text: 'The illuminated lines point straight toward Toledo — the legendary city of swordsmiths and alchemists. The road south is now unlocked on your World Map [M]. Take this Ancient Guild Seal and travel to Toledo whenever you are ready!',
        portraitEmotion: 'happy',
      },
      {
        id: 'isabel_reading_advice',
        speaker: 'Doña Isabel',
        text: 'Treat these ancient volumes with reverence. Those who respect parchment uncover the secrets that hasty eyes miss.',
        portraitEmotion: 'neutral',
      },
    ],
  },

  // ------------------------------------------------------------
  // 4. DON MATEO — Secret Courtyard Keeper
  // ------------------------------------------------------------
  don_mateo: {
    id: 'don_mateo',
    name: 'Don Mateo',
    title: 'Secret Courtyard Keeper (Guardián del Patio)',
    personality: 'A reclusive, calm sage of flora and stone who has quietly tended the secluded garden for decades. He speaks in contemplative proverbs with profound reverence for ancient craftsmanship.',
    position: { x: 280, y: 240 },
    direction: 'right',
    portraitId: 'portrait_don_mateo',
    interactionRange: 48,
    animationState: 'idle',
    questIds: ['the_hidden_garden', 'first_atlas_page'],
    appearance: {
      skinColor: '#b08050',
      hairColor: '#8a8a8a',
      hairStyle: 'bald',
      outfitColor: '#308050',
      outfitType: 'apron',
      accessory: 'hat',
      height: 'medium',
    },
    dialogueTree: [
      {
        id: 'mateo_start',
        speaker: 'Don Mateo',
        text: 'Close the wooden latch gently, friend. It has been more than forty years since anyone stepped through that hidden passage without startling the night jasmines.',
        portraitEmotion: 'surprised',
        choices: [
          {
            text: 'Pardon the intrusion. What sanctuary is this?',
            nextId: 'mateo_garden_lore',
          },
          {
            text: 'I am looking for the Atlas page hidden in this courtyard.',
            nextId: 'mateo_atlas_mechanism',
          },
          {
            text: 'How do these fragrant flowers flourish so vibrantly in a walled cloister?',
            nextId: 'mateo_flower_lore',
          },
        ],
      },
      {
        id: 'mateo_garden_lore',
        speaker: 'Don Mateo',
        text: 'This is El Patio Secreto — the Secret Courtyard. It was designed in 1588 by students of Juan de Herrera as an oasis untouched by time. Here scholars rested and concealed their greatest treasures.',
        portraitEmotion: 'neutral',
        effects: [
          {
            type: 'complete_quest',
            questId: 'the_hidden_garden',
          },
          {
            type: 'start_quest',
            questId: 'first_atlas_page',
          },
        ],
        choices: [
          {
            text: 'Where is the relic of the cartographers hidden?',
            nextId: 'mateo_atlas_mechanism',
          },
        ],
      },
      {
        id: 'mateo_atlas_mechanism',
        speaker: 'Don Mateo',
        text: 'Look at the ancient stone pedestal by the reflecting pool. A circular recess awaits the Artifact Lens (Lente de Revelación) from the library drawer. Slot it in, and the midday sun will focus a beam of light onto the weeping stone statue, revealing the Atlas!',
        portraitEmotion: 'thinking',
        choices: [
          {
            text: 'Understood. I will slot the lens into the pedestal mechanism!',
            nextId: 'mateo_start',
          },
        ],
      },
      {
        id: 'mateo_flower_lore',
        speaker: 'Don Mateo',
        text: 'It is the Dawn Jasmine — Flor del Alba. It drinks pure water filtered through Madrid\'s subterranean granite aqueducts. Take one; its scent clears the mind of all doubt.',
        portraitEmotion: 'happy',
        effects: [
          {
            type: 'give_item',
            itemId: 'garden_flower',
          },
        ],
        choices: [
          {
            text: 'Thank you for your warm hospitality, Don Mateo.',
            nextId: 'mateo_start',
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------
  // 5. CARLOS EL VIAJERO — Young Adventurer
  // ------------------------------------------------------------
  carlos_viajero: {
    id: 'carlos_viajero',
    name: 'Carlos el Viajero',
    title: 'Wandering Adventurer (Viajero Aventurero)',
    personality: 'Youthful, energetic, and brimming with wanderlust. He dreams of mapping every forgotten corner of Spain, but is prone to comical clumsiness.',
    position: { x: 180, y: 390 },
    direction: 'right',
    portraitId: 'portrait_carlos_viajero',
    interactionRange: 48,
    animationState: 'idle',
    questIds: ['lost_compass'],
    appearance: {
      skinColor: '#d8a878',
      hairColor: '#4a2a10',
      hairStyle: 'long',
      outfitColor: '#305aa0',
      outfitType: 'cloak',
      accessory: 'scarf',
      height: 'medium',
    },
    dialogueTree: [
      {
        id: 'carlos_start',
        speaker: 'Carlos el Viajero',
        text: 'Confound my clumsiness! How am I supposed to hike across the mountains to Toledo when I don\'t even know where I dropped my grandfather\'s brass compass?',
        portraitEmotion: 'sad',
        choices: [
          {
            text: 'Did you lose something important, fellow traveler?',
            nextId: 'carlos_quest_inquiry',
          },
          {
            text: 'Is this antique brass compass what you were looking for?',
            nextId: 'carlos_compass_returned',
            condition: {
              type: 'has_item',
              itemId: 'old_compass',
            },
          },
          {
            text: 'Be more careful next time, Carlos.',
            nextId: 'carlos_farewell',
          },
        ],
      },
      {
        id: 'carlos_quest_inquiry',
        speaker: 'Carlos el Viajero',
        text: 'A solid brass naval compass! I was resting near the plaza benches admiring the orange trees, and when I stood up it must have tumbled under one of the wooden seats. If you find it, I will reward you with supplies and travel notes!',
        portraitEmotion: 'thinking',
        effects: [
          {
            type: 'start_quest',
            questId: 'lost_compass',
          },
        ],
        choices: [
          {
            text: 'I will keep an eye out around the plaza benches.',
            nextId: 'carlos_start',
          },
        ],
      },
      {
        id: 'carlos_compass_returned',
        speaker: 'Carlos el Viajero',
        text: 'By all the winds of Spain! That is it! My grandfather\'s compass with the green enamel needle! You have saved me from wandering in circles at Puerta del Sol for the rest of my days!',
        portraitEmotion: 'surprised',
        effects: [
          {
            type: 'complete_quest',
            questId: 'lost_compass',
          },
          {
            type: 'remove_item',
            itemId: 'old_compass',
          },
          {
            type: 'add_experience',
            experience: 60,
          },
          {
            type: 'add_journal',
            journalEntry: {
              id: 'journal_carlos_compass',
              title: 'Carlos\'s Family Compass Returned',
              description: 'I returned the lost brass compass to Carlos. In gratitude, he shared stories of subterranean bladesmith workshops in Toledo.',
              location: 'Plaza de la Llegada, Madrid',
              associatedNPC: 'carlos_viajero',
              associatedQuest: 'lost_compass',
              discoveredAt: Date.now(),
              category: 'note',
              sequence: 5,
              read: false,
            },
          },
        ],
        choices: [
          {
            text: 'Glad I could help, Carlos. Safe travels on the road!',
            nextId: 'carlos_after_quest',
          },
        ],
      },
      {
        id: 'carlos_after_quest',
        speaker: 'Carlos el Viajero',
        text: 'See you on the trails, friend! When you reach Toledo or Sevilla, keep your eyes wide open. Spain is brimming with wonders!',
        portraitEmotion: 'happy',
      },
      {
        id: 'carlos_farewell',
        speaker: 'Carlos el Viajero',
        text: 'Aye, caution is the mother of wisdom... but adventure never waits!',
        portraitEmotion: 'neutral',
      },
    ],
  },

  // ------------------------------------------------------------
  // 6. PROFESORA ELENA — Art & Cartography Scholar
  // ------------------------------------------------------------
  profesora_elena: {
    id: 'profesora_elena',
    name: 'Profesora Elena',
    title: 'Professor of Fine Arts (Maestra de Artes)',
    personality: 'Artistic, observant, and poetically eloquent. She captures lost architecture with delicate watercolours and possesses encyclopedic insight into historical pigments and mapmaking.',
    position: { x: 520, y: 220 },
    direction: 'down',
    portraitId: 'portrait_profesora_elena',
    interactionRange: 48,
    animationState: 'idle',
    questIds: ['first_atlas_page'],
    appearance: {
      skinColor: '#f0c8a0',
      hairColor: '#2a2020',
      hairStyle: 'long',
      outfitColor: '#a84050',
      outfitType: 'vest',
      accessory: 'scarf',
      height: 'tall',
    },
    dialogueTree: [
      {
        id: 'elena_start',
        speaker: 'Profesora Elena',
        text: 'Notice how the morning light tinges the terracotta balustrades in golden saffron. The ancient Spanish cartographers did not merely sketch coastlines; they painted the very spirit of the lands they traveled.',
        portraitEmotion: 'thinking',
        choices: [
          {
            text: 'How did they craft the illuminated pages of the Forgotten Atlas?',
            nextId: 'elena_atlas_technique',
          },
          {
            text: 'Which Spanish cities hold the remaining pages of the Atlas?',
            nextId: 'elena_cities_lore',
          },
          {
            text: 'Your watercolor sketches are breathtaking, Professor.',
            nextId: 'elena_compliment',
          },
        ],
      },
      {
        id: 'elena_atlas_technique',
        speaker: 'Profesora Elena',
        text: 'They ground malachite for the fertile orchards of Valencia, ultramarine lapis lazuli for the Mediterranean ports of Barcelona, and gold dust for the towers of Toledo and Sevilla. Every page was both a navigation map and a sacred talisman.',
        portraitEmotion: 'happy',
        choices: [
          {
            text: 'An art truly worthy of being rediscovered.',
            nextId: 'elena_start',
          },
        ],
      },
      {
        id: 'elena_cities_lore',
        speaker: 'Profesora Elena',
        text: 'Toledo holds the secrets of steel and alchemy; Barcelona guards the maritime Mediterranean routes; Valencia preserves the waterways; Sevilla shelters the royal river archives; and Granada holds the celestial star domes of the Alhambra. A colossal journey awaits you!',
        portraitEmotion: 'happy',
        choices: [
          {
            text: 'I will journey across every one of those cities!',
            nextId: 'elena_start',
          },
        ],
      },
      {
        id: 'elena_compliment',
        speaker: 'Profesora Elena',
        text: 'Beauty is in the eye of those who know how to pause and look closely. May your traveler\'s journal be filled with luminous discoveries!',
        portraitEmotion: 'happy',
      },
    ],
  },
};
