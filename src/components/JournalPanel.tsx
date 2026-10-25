// ============================================================
// ESPAÑA EXPLORER — Journal & Messages Panel
// Leather-bound adventurer's notebook with tabs for Quests, Clues,
// NPCs, Atlas Pages, and Notes
// ============================================================

import React, { useState, useEffect } from 'react';
import { JournalEntry, GameMessage, Quest } from '@/types/game';
import { THEME, closeButtonStyle } from './uiTheme';

export interface JournalPanelProps {
  journalEntries: JournalEntry[];
  messages: GameMessage[];
  quests: Quest[];
  onClose: () => void;
  onMarkRead?: (id: string) => void;
}

type TabType = 'quests' | 'clues' | 'npcs' | 'atlas' | 'notes';

export const JournalPanel: React.FC<JournalPanelProps> = ({
  journalEntries = [],
  messages: _messages = [],
  quests = [],
  onClose,
  onMarkRead,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('quests');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'j' || e.key === 'J' || e.key === 'm' || e.key === 'M') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Categorize entries
  const clueEntries = journalEntries.filter((e) => e.category === 'clue');
  const npcEntries = journalEntries.filter((e) => e.category === 'npc_record');
  const atlasEntries = journalEntries.filter((e) => e.category === 'atlas_page');
  const noteEntries = journalEntries.filter((e) => e.category === 'note' || e.category === 'story');

  const unreadClues = clueEntries.filter((e) => !e.read).length;
  const unreadNpcs = npcEntries.filter((e) => !e.read).length;
  const unreadAtlas = atlasEntries.filter((e) => !e.read).length;
  const unreadNotes = noteEntries.filter((e) => !e.read).length;
  const activeQuestsCount = quests.filter((q) => q.status === 'active').length;

  const toggleExpand = (id: string, isRead?: boolean) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      if (!isRead && onMarkRead) {
        onMarkRead(id);
      }
    }
  };

  const tabs: Array<{ id: TabType; label: string; icon: string; count: number; unread: number }> = [
    { id: 'quests', label: 'Quests', icon: '⚔️', count: quests.length, unread: activeQuestsCount },
    { id: 'clues', label: 'Clues', icon: '🔍', count: clueEntries.length, unread: unreadClues },
    { id: 'npcs', label: 'NPCs', icon: '👥', count: npcEntries.length, unread: unreadNpcs },
    { id: 'atlas', label: 'Atlas Pages', icon: '🗺️', count: atlasEntries.length, unread: unreadAtlas },
    { id: 'notes', label: 'Notes', icon: '📖', count: noteEntries.length, unread: unreadNotes },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        backgroundColor: THEME.colors.overlayBackdrop,
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      {/* Parchment Notebook Book Frame */}
      <div
        style={{
          width: '900px',
          maxWidth: '96vw',
          height: '620px',
          maxHeight: '92vh',
          backgroundColor: '#382618',
          backgroundImage: 'radial-gradient(circle at 50% 10%, #4a3422 0%, #22160d 100%)',
          border: '3px solid #d4a840',
          borderRadius: THEME.borders.radiusLg,
          boxShadow: THEME.shadows.panelDeep,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Leather spine bookmark trim */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '260px',
            bottom: 0,
            width: '2px',
            backgroundColor: 'rgba(212, 168, 64, 0.35)',
            boxShadow: '1px 0 3px rgba(0,0,0,0.5)',
            zIndex: 10,
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            backgroundColor: 'rgba(22, 14, 8, 0.88)',
            borderBottom: '2px solid rgba(212, 168, 64, 0.45)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>📖</span>
            <h2
              style={{
                fontFamily: THEME.fonts.title,
                color: THEME.colors.textGold,
                fontSize: '1.5rem',
                margin: 0,
                letterSpacing: '0.04em',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              Cuaderno de Viaje (Travel Journal)
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close journal"
            style={closeButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(70, 30, 20, 0.95)';
              e.currentTarget.style.borderColor = '#f2cf6d';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(36, 24, 16, 0.9)';
              e.currentTarget.style.borderColor = 'rgba(212, 168, 64, 0.7)';
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body: Sidebar Tabs (Left) + Entries (Right) */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          {/* Left Navigation Column */}
          <div
            style={{
              width: '260px',
              backgroundColor: 'rgba(26, 18, 12, 0.85)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              padding: '16px 12px',
              borderRight: '1px solid rgba(212, 168, 64, 0.25)',
              flexShrink: 0,
            }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: isActive
                      ? 'rgba(78, 54, 32, 0.9)'
                      : 'rgba(34, 24, 16, 0.5)',
                    border: isActive
                      ? '1.5px solid #f2cf6d'
                      : '1px solid rgba(212, 168, 64, 0.2)',
                    color: isActive ? THEME.colors.goldLight : THEME.colors.textPrimary,
                    fontFamily: THEME.fonts.title,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.4)' : 'none',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.1rem' }}>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>

                  {tab.unread > 0 ? (
                    <span
                      style={{
                        backgroundColor: '#c83232',
                        color: '#fff',
                        borderRadius: '10px',
                        padding: '1px 7px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        fontFamily: THEME.fonts.body,
                      }}
                    >
                      {tab.unread}
                    </span>
                  ) : (
                    <span
                      style={{
                        color: THEME.colors.textMuted,
                        fontSize: '0.75rem',
                        fontFamily: THEME.fonts.body,
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Travel Quote */}
            <div
              style={{
                marginTop: 'auto',
                padding: '12px',
                backgroundColor: 'rgba(16, 12, 8, 0.6)',
                borderRadius: '8px',
                border: '1px dashed rgba(212, 168, 64, 0.3)',
                color: THEME.colors.textSecondary,
                fontSize: '0.75rem',
                fontStyle: 'italic',
                lineHeight: 1.4,
              }}
            >
              "He who does not travel does not know the value of men."
              <div style={{ textAlign: 'right', marginTop: '4px', color: THEME.colors.goldLight }}>
                — Moorish Proverb
              </div>
            </div>
          </div>

          {/* Right Entries List Column */}
          <div
            style={{
              flex: 1,
              padding: '20px 24px',
              overflowY: 'auto',
              backgroundColor: 'rgba(38, 28, 20, 0.65)',
            }}
          >
            {/* TAB: QUESTS */}
            {activeTab === 'quests' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h3
                  style={{
                    fontFamily: THEME.fonts.title,
                    color: THEME.colors.textGold,
                    fontSize: '1.2rem',
                    margin: 0,
                    borderBottom: '1px solid rgba(212, 168, 64, 0.3)',
                    paddingBottom: '8px',
                  }}
                >
                  Active & Logged Quests
                </h3>

                {quests.length === 0 ? (
                  <p style={{ color: THEME.colors.textMuted, fontStyle: 'italic' }}>
                    No quests recorded yet. Explore the plazas and talk to the inhabitants!
                  </p>
                ) : (
                  quests.map((quest) => {
                    const isExpanded = expandedId === quest.id;
                    const isCompleted = quest.status === 'completed';

                    return (
                      <div
                        key={quest.id}
                        style={{
                          backgroundColor: 'rgba(26, 18, 12, 0.85)',
                          border: isCompleted
                            ? '1px solid rgba(90, 163, 70, 0.6)'
                            : '1.5px solid rgba(212, 168, 64, 0.5)',
                          borderRadius: '8px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          onClick={() => toggleExpand(quest.id)}
                          style={{
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            backgroundColor: isExpanded ? 'rgba(54, 38, 24, 0.8)' : 'transparent',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.1rem' }}>
                              {isCompleted ? '✓' : quest.isMainQuest ? '👑' : '📜'}
                            </span>
                            <div>
                              <div
                                style={{
                                  fontFamily: THEME.fonts.title,
                                  color: isCompleted ? '#76c45e' : THEME.colors.textGold,
                                  fontSize: '0.98rem',
                                  fontWeight: 'bold',
                                }}
                              >
                                {quest.name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: THEME.colors.textMuted }}>
                                {quest.cityId.toUpperCase()} • {quest.type}
                              </div>
                            </div>
                          </div>

                          <span style={{ color: THEME.colors.goldLight, fontSize: '0.85rem' }}>
                            {isExpanded ? '▲' : '▼'}
                          </span>
                        </div>

                        {isExpanded && (
                          <div
                            style={{
                              padding: '12px 16px',
                              borderTop: '1px solid rgba(212, 168, 64, 0.25)',
                              backgroundColor: 'rgba(20, 14, 10, 0.7)',
                              fontSize: '0.88rem',
                              lineHeight: 1.5,
                            }}
                          >
                            <p style={{ color: THEME.colors.textPrimary, margin: '0 0 10px 0' }}>
                              {quest.description}
                            </p>

                            <div style={{ fontWeight: 700, color: THEME.colors.goldLight, fontSize: '0.8rem', marginBottom: '6px' }}>
                              OBJECTIVES:
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {quest.objectives.map((obj) => (
                                <div key={obj.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ color: obj.completed ? '#76c45e' : THEME.colors.textMuted }}>
                                    {obj.completed ? '☑' : '☐'}
                                  </span>
                                  <span
                                    style={{
                                      textDecoration: obj.completed ? 'line-through' : 'none',
                                      color: obj.completed ? THEME.colors.textMuted : THEME.colors.textPrimary,
                                    }}
                                  >
                                    {obj.description} ({obj.current}/{obj.required})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB: CLUES */}
            {activeTab === 'clues' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3
                  style={{
                    fontFamily: THEME.fonts.title,
                    color: THEME.colors.textGold,
                    fontSize: '1.2rem',
                    margin: 0,
                    borderBottom: '1px solid rgba(212, 168, 64, 0.3)',
                    paddingBottom: '8px',
                  }}
                >
                  Discovered Clues & Riddles
                </h3>

                {clueEntries.length === 0 ? (
                  <p style={{ color: THEME.colors.textMuted, fontStyle: 'italic' }}>
                    No clues discovered yet. Search examine points, fountains, and ancient inscriptions.
                  </p>
                ) : (
                  clueEntries.map((entry) => {
                    const isExpanded = expandedId === entry.id;
                    return (
                      <div
                        key={entry.id}
                        style={{
                          backgroundColor: 'rgba(26, 18, 12, 0.85)',
                          border: '1.5px solid rgba(212, 168, 64, 0.45)',
                          borderRadius: '8px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          onClick={() => toggleExpand(entry.id, entry.read)}
                          style={{
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            backgroundColor: isExpanded ? 'rgba(54, 38, 24, 0.8)' : 'transparent',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>🔍</span>
                            <span
                              style={{
                                fontFamily: THEME.fonts.title,
                                color: THEME.colors.textGold,
                                fontWeight: 'bold',
                              }}
                            >
                              {entry.title}
                            </span>
                            {!entry.read && (
                              <span
                                style={{
                                  backgroundColor: '#c83232',
                                  color: '#fff',
                                  borderRadius: '4px',
                                  padding: '1px 5px',
                                  fontSize: '0.66rem',
                                  fontWeight: 800,
                                }}
                              >
                                NEW
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: THEME.colors.textMuted }}>
                            {entry.location}
                          </span>
                        </div>

                        {isExpanded && (
                          <div
                            style={{
                              padding: '12px 14px',
                              borderTop: '1px solid rgba(212, 168, 64, 0.25)',
                              backgroundColor: 'rgba(18, 14, 10, 0.7)',
                              color: THEME.colors.textPrimary,
                              fontSize: '0.88rem',
                              lineHeight: 1.5,
                            }}
                          >
                            {entry.description}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB: NPCS */}
            {activeTab === 'npcs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3
                  style={{
                    fontFamily: THEME.fonts.title,
                    color: THEME.colors.textGold,
                    fontSize: '1.2rem',
                    margin: 0,
                    borderBottom: '1px solid rgba(212, 168, 64, 0.3)',
                    paddingBottom: '8px',
                  }}
                >
                  Encountered Characters
                </h3>

                {npcEntries.length === 0 ? (
                  <p style={{ color: THEME.colors.textMuted, fontStyle: 'italic' }}>
                    No characters recorded in your dossier yet. Speak with people in town!
                  </p>
                ) : (
                  npcEntries.map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        backgroundColor: 'rgba(26, 18, 12, 0.85)',
                        border: '1.5px solid rgba(212, 168, 64, 0.45)',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        display: 'flex',
                        gap: '14px',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '8px',
                          backgroundColor: '#2a1a10',
                          border: '1.5px solid #d4a840',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.6rem',
                          flexShrink: 0,
                        }}
                      >
                        👤
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: THEME.fonts.title,
                            color: THEME.colors.textGold,
                            fontSize: '1.05rem',
                            fontWeight: 'bold',
                          }}
                        >
                          {entry.title}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: THEME.colors.textMuted, marginBottom: '6px' }}>
                          Location: {entry.location}
                        </div>
                        <div style={{ fontSize: '0.86rem', color: THEME.colors.textPrimary, lineHeight: 1.45 }}>
                          {entry.description}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: ATLAS */}
            {activeTab === 'atlas' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3
                  style={{
                    fontFamily: THEME.fonts.title,
                    color: THEME.colors.textGold,
                    fontSize: '1.2rem',
                    margin: 0,
                    borderBottom: '1px solid rgba(212, 168, 64, 0.3)',
                    paddingBottom: '8px',
                  }}
                >
                  Cartographic Atlas & Lore
                </h3>

                {atlasEntries.length === 0 ? (
                  <p style={{ color: THEME.colors.textMuted, fontStyle: 'italic' }}>
                    Collect torn Atlas Pages hidden across historical landmarks to assemble Spain's royal chronicle.
                  </p>
                ) : (
                  atlasEntries.map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        backgroundColor: 'rgba(244, 232, 208, 0.95)',
                        color: '#2a1c12',
                        border: '2px solid #a87e38',
                        borderRadius: '8px',
                        padding: '16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: THEME.fonts.title,
                          color: '#6e2b10',
                          fontSize: '1.15rem',
                          fontWeight: 'bold',
                          marginBottom: '4px',
                        }}
                      >
                        📜 {entry.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#685038', marginBottom: '8px', fontStyle: 'italic' }}>
                        Region: {entry.location}
                      </div>
                      <div style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>
                        {entry.description}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: NOTES */}
            {activeTab === 'notes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3
                  style={{
                    fontFamily: THEME.fonts.title,
                    color: THEME.colors.textGold,
                    fontSize: '1.2rem',
                    margin: 0,
                    borderBottom: '1px solid rgba(212, 168, 64, 0.3)',
                    paddingBottom: '8px',
                  }}
                >
                  Explorer's Personal Notes
                </h3>

                {noteEntries.length === 0 ? (
                  <p style={{ color: THEME.colors.textMuted, fontStyle: 'italic' }}>
                    No personal field notes written yet.
                  </p>
                ) : (
                  noteEntries.map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        backgroundColor: 'rgba(26, 18, 12, 0.85)',
                        border: '1.5px solid rgba(212, 168, 64, 0.45)',
                        borderRadius: '8px',
                        padding: '12px 16px',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: THEME.fonts.title,
                          color: THEME.colors.textGold,
                          fontSize: '1.02rem',
                          fontWeight: 'bold',
                          marginBottom: '4px',
                        }}
                      >
                        {entry.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: THEME.colors.textMuted, marginBottom: '6px' }}>
                        {new Date(entry.discoveredAt).toLocaleDateString()} • {entry.location}
                      </div>
                      <div style={{ fontSize: '0.88rem', color: THEME.colors.textPrimary, lineHeight: 1.5 }}>
                        {entry.description}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalPanel;
