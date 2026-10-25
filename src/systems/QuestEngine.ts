// ============================================================
// ESPAÑA EXPLORER — Quest Engine
// Manages quest lifecycle, objective tracking, and rewards
// ============================================================

import {
  Quest,
  QuestStatus,
  QuestReward,
  GameState,
  Item,
  JournalEntry,
  GameMessage,
} from '@/types/game';

export class QuestEngine {
  private state: GameState;
  private onStateChange: (state: GameState) => void;
  private onNotification: (message: string, type: string) => void;

  constructor(
    state: GameState,
    onStateChange: (state: GameState) => void,
    onNotification: (message: string, type: string) => void
  ) {
    this.state = state;
    this.onStateChange = onStateChange;
    this.onNotification = onNotification;
  }

  updateState(state: GameState) {
    this.state = state;
  }

  // --- Quest Lifecycle ---

  startQuest(questId: string): boolean {
    const quest = this.state.quests[questId];
    if (!quest) return false;
    if (quest.status !== 'available') return false;

    // Check prerequisites
    if (!this.checkPrerequisites(quest)) return false;

    const updatedQuests = { ...this.state.quests };
    updatedQuests[questId] = { ...quest, status: 'active' as QuestStatus };

    const message: GameMessage = {
      id: `quest_start_${questId}_${Date.now()}`,
      title: 'New Quest!',
      content: `Started: ${quest.name} - ${quest.description}`,
      timestamp: Date.now(),
      read: false,
      type: 'quest_update',
      relatedQuestId: questId,
    };

    this.state = {
      ...this.state,
      quests: updatedQuests,
      messages: [...this.state.messages, message],
    };

    this.onNotification(`Quest Started: ${quest.name}`, 'quest');
    this.onStateChange(this.state);
    return true;
  }

  completeQuest(questId: string): boolean {
    const quest = this.state.quests[questId];
    if (!quest || quest.status !== 'active') return false;

    // Check all objectives are complete
    const allComplete = quest.objectives.every(obj => obj.completed);
    if (!allComplete) return false;

    const updatedQuests = { ...this.state.quests };
    updatedQuests[questId] = { ...quest, status: 'completed' as QuestStatus };

    // Grant rewards
    let newState = { ...this.state, quests: updatedQuests };
    newState = this.grantRewards(newState, quest.rewards, quest.name);

    // Update statistics
    newState.statistics = {
      ...newState.statistics,
      questsCompleted: newState.statistics.questsCompleted + 1,
    };

    // Unlock dependent quests
    newState = this.checkQuestUnlocks(newState, questId);

    const message: GameMessage = {
      id: `quest_complete_${questId}_${Date.now()}`,
      title: 'Quest Completed!',
      content: `Completed: ${quest.name}`,
      timestamp: Date.now(),
      read: false,
      type: 'quest_update',
      relatedQuestId: questId,
    };
    newState.messages = [...newState.messages, message];

    this.state = newState;
    this.onNotification(`Quest Completed: ${quest.name}! 🎉`, 'achievement');
    this.onStateChange(this.state);
    return true;
  }

  // --- Objective Tracking ---

  updateObjective(questId: string, objectiveId: string, progress: number = 1): boolean {
    const quest = this.state.quests[questId];
    if (!quest || quest.status !== 'active') return false;

    const objectiveIndex = quest.objectives.findIndex(o => o.id === objectiveId);
    if (objectiveIndex === -1) return false;

    const objective = quest.objectives[objectiveIndex];
    if (objective.completed) return false;

    const newCurrent = Math.min(objective.current + progress, objective.required);
    const isComplete = newCurrent >= objective.required;

    const updatedObjectives = [...quest.objectives];
    updatedObjectives[objectiveIndex] = {
      ...objective,
      current: newCurrent,
      completed: isComplete,
    };

    const updatedQuests = { ...this.state.quests };
    updatedQuests[questId] = { ...quest, objectives: updatedObjectives };

    this.state = { ...this.state, quests: updatedQuests };

    if (isComplete) {
      this.onNotification(`Objective Complete: ${objective.description}`, 'quest');
      
      // Check if all objectives are now complete
      const allComplete = updatedObjectives.every(o => o.completed);
      if (allComplete) {
        this.completeQuest(questId);
      }
    }

    this.onStateChange(this.state);
    return true;
  }

  // Progress an objective by matching its target
  progressObjectiveByTarget(target: string, type: string): void {
    Object.values(this.state.quests).forEach(quest => {
      if (quest.status !== 'active') return;
      quest.objectives.forEach(objective => {
        if (!objective.completed && objective.target === target && objective.type === type) {
          this.updateObjective(quest.id, objective.id);
        }
      });
    });
  }

  // --- Helper Methods ---

  private checkPrerequisites(quest: Quest): boolean {
    return quest.prerequisites.every(prereqId => {
      const prereq = this.state.quests[prereqId];
      return prereq && prereq.status === 'completed';
    });
  }

  private grantRewards(state: GameState, rewards: QuestReward[], questName: string): GameState {
    let newState = { ...state };

    rewards.forEach(reward => {
      switch (reward.type) {
        case 'experience':
          if (reward.experience) {
            newState = this.addExperience(newState, reward.experience);
          }
          break;
        case 'item':
          if (reward.itemId) {
            // Item adding is handled by the inventory system
            this.onNotification(`Received item from ${questName}!`, 'item');
          }
          break;
        case 'unlock_city':
          if (reward.cityId && !newState.player.unlockedCities.includes(reward.cityId)) {
            newState.player = {
              ...newState.player,
              unlockedCities: [...newState.player.unlockedCities, reward.cityId],
            };
            this.onNotification(`New city unlocked!`, 'achievement');
            newState.statistics = {
              ...newState.statistics,
              citiesUnlocked: newState.statistics.citiesUnlocked + 1,
            };
          }
          break;
        case 'unlock_area':
          if (reward.areaId) {
            newState.flags = { ...newState.flags, [`area_unlocked_${reward.areaId}`]: true };
          }
          break;
      }
    });

    return newState;
  }

  private addExperience(state: GameState, amount: number): GameState {
    let newExp = state.player.experience + amount;
    let newLevel = state.player.level;
    let expToNext = state.player.experienceToNext;

    while (newExp >= expToNext) {
      newExp -= expToNext;
      newLevel++;
      expToNext = Math.floor(expToNext * 1.5);
      this.onNotification(`Level Up! You are now level ${newLevel}!`, 'achievement');
    }

    return {
      ...state,
      player: {
        ...state.player,
        experience: newExp,
        level: newLevel,
        experienceToNext: expToNext,
      },
    };
  }

  private checkQuestUnlocks(state: GameState, _completedQuestId: string): GameState {
    const updatedQuests = { ...state.quests };
    let changed = false;

    Object.values(updatedQuests).forEach(quest => {
      if (quest.status === 'locked') {
        const prerequisites = quest.prerequisites;
        const allMet = prerequisites.every(prereqId => {
          const prereq = updatedQuests[prereqId];
          return prereq && prereq.status === 'completed';
        });
        if (allMet) {
          updatedQuests[quest.id] = { ...quest, status: 'available' as QuestStatus };
          changed = true;
        }
      }
    });

    if (changed) {
      return { ...state, quests: updatedQuests };
    }
    return state;
  }

  // --- Query Methods ---

  getActiveQuests(): Quest[] {
    return Object.values(this.state.quests).filter(q => q.status === 'active');
  }

  getCompletedQuests(): Quest[] {
    return Object.values(this.state.quests).filter(q => q.status === 'completed');
  }

  getAvailableQuests(): Quest[] {
    return Object.values(this.state.quests).filter(q => q.status === 'available');
  }

  getQuestById(questId: string): Quest | undefined {
    return this.state.quests[questId];
  }

  isQuestComplete(questId: string): boolean {
    const quest = this.state.quests[questId];
    return quest?.status === 'completed';
  }

  isQuestActive(questId: string): boolean {
    const quest = this.state.quests[questId];
    return quest?.status === 'active';
  }

  hasActiveObjective(target: string): boolean {
    return Object.values(this.state.quests).some(quest =>
      quest.status === 'active' &&
      quest.objectives.some(obj => !obj.completed && obj.target === target)
    );
  }
}

// --- Inventory System ---
export class InventorySystem {
  private state: GameState;
  private onStateChange: (state: GameState) => void;
  private onNotification: (message: string, type: string) => void;

  constructor(
    state: GameState,
    onStateChange: (state: GameState) => void,
    onNotification: (message: string, type: string) => void
  ) {
    this.state = state;
    this.onStateChange = onStateChange;
    this.onNotification = onNotification;
  }

  updateState(state: GameState) {
    this.state = state;
  }

  addItem(item: Item): boolean {
    // Check if unique item already exists
    if (item.unique) {
      const existing = this.state.inventory.find(i => i.id === item.id);
      if (existing) return false;
    }

    const existingIndex = this.state.inventory.findIndex(i => i.id === item.id);
    let newInventory: Item[];

    if (existingIndex >= 0) {
      const existing = this.state.inventory[existingIndex];
      if (existing.quantity >= existing.maxQuantity) return false;

      newInventory = [...this.state.inventory];
      newInventory[existingIndex] = {
        ...existing,
        quantity: Math.min(existing.quantity + item.quantity, existing.maxQuantity),
      };
    } else {
      newInventory = [...this.state.inventory, { ...item }];
    }

    this.state = {
      ...this.state,
      inventory: newInventory,
      statistics: {
        ...this.state.statistics,
        itemsCollected: this.state.statistics.itemsCollected + 1,
      },
    };

    this.onNotification(`Found: ${item.name}`, 'item');
    this.onStateChange(this.state);
    return true;
  }

  removeItem(itemId: string, quantity: number = 1): boolean {
    const index = this.state.inventory.findIndex(i => i.id === itemId);
    if (index === -1) return false;

    const item = this.state.inventory[index];
    let newInventory = [...this.state.inventory];

    if (item.quantity <= quantity) {
      newInventory.splice(index, 1);
    } else {
      newInventory[index] = { ...item, quantity: item.quantity - quantity };
    }

    this.state = { ...this.state, inventory: newInventory };
    this.onStateChange(this.state);
    return true;
  }

  hasItem(itemId: string): boolean {
    return this.state.inventory.some(i => i.id === itemId);
  }

  getItem(itemId: string): Item | undefined {
    return this.state.inventory.find(i => i.id === itemId);
  }

  useItem(itemId: string, target?: string): boolean {
    const item = this.state.inventory.find(i => i.id === itemId);
    if (!item || !item.usable) return false;
    if (item.useTarget && item.useTarget !== target) return false;

    // Item use is handled by the game engine
    // This just validates the action
    return true;
  }

  getItemsByCategory(category: string): Item[] {
    return this.state.inventory.filter(i => i.category === category);
  }
}

// --- Journal System ---
export class JournalSystem {
  private state: GameState;
  private onStateChange: (state: GameState) => void;

  constructor(state: GameState, onStateChange: (state: GameState) => void) {
    this.state = state;
    this.onStateChange = onStateChange;
  }

  updateState(state: GameState) {
    this.state = state;
  }

  addEntry(entry: JournalEntry): boolean {
    // Check for duplicate
    if (this.state.journal.some(e => e.id === entry.id)) return false;

    const newEntry = {
      ...entry,
      discoveredAt: Date.now(),
      sequence: this.state.journal.length + 1,
      read: false,
    };

    this.state = {
      ...this.state,
      journal: [...this.state.journal, newEntry],
    };

    this.onStateChange(this.state);
    return true;
  }

  markRead(entryId: string): void {
    const index = this.state.journal.findIndex(e => e.id === entryId);
    if (index === -1) return;

    const newJournal = [...this.state.journal];
    newJournal[index] = { ...newJournal[index], read: true };

    this.state = { ...this.state, journal: newJournal };
    this.onStateChange(this.state);
  }

  getEntriesByCategory(category: string): JournalEntry[] {
    return this.state.journal.filter(e => e.category === category);
  }

  getUnreadCount(): number {
    return this.state.journal.filter(e => !e.read).length;
  }

  hasEntry(entryId: string): boolean {
    return this.state.journal.some(e => e.id === entryId);
  }
}

// --- Message System ---
export class MessageSystem {
  private state: GameState;
  private onStateChange: (state: GameState) => void;

  constructor(state: GameState, onStateChange: (state: GameState) => void) {
    this.state = state;
    this.onStateChange = onStateChange;
  }

  updateState(state: GameState) {
    this.state = state;
  }

  addMessage(message: GameMessage): void {
    const newMessage = {
      ...message,
      id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false,
    };

    this.state = {
      ...this.state,
      messages: [...this.state.messages, newMessage],
    };

    this.onStateChange(this.state);
  }

  markRead(messageId: string): void {
    const index = this.state.messages.findIndex(m => m.id === messageId);
    if (index === -1) return;

    const newMessages = [...this.state.messages];
    newMessages[index] = { ...newMessages[index], read: true };

    this.state = { ...this.state, messages: newMessages };
    this.onStateChange(this.state);
  }

  getUnreadCount(): number {
    return this.state.messages.filter(m => !m.read).length;
  }

  getMessages(): GameMessage[] {
    return [...this.state.messages].sort((a, b) => b.timestamp - a.timestamp);
  }
}
