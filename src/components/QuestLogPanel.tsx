// ============================================================
// ESPAÑA EXPLORER — Quest Log Panel Overlay
// Storybook quest tracker grouped by city, with objective checkboxes,
// progress bars, rewards preview, and completed quest history
// ============================================================

import React, { useState, useEffect } from 'react';
import { Quest, QuestType, CityId } from '@/types/game';
import { THEME, closeButtonStyle } from './uiTheme';

export interface QuestLogPanelProps {
  quests: Quest[] | Record<string, Quest>;
  onClose: () => void;
  trackedQuestId?: string;
  onTrackQuest?: (questId: string) => void;
}

const QUEST_TYPE_ICONS: Record<QuestType, string> = {
  exploration: '🧭',
  dialogue: '💬',
  collection: '🎒',
  puzzle: '🧩',
  mystery: '🔮',
  item_retrieval: '🗝️',
  discovery: '🔭',
};

const CITY_NAMES: Record<CityId, string> = {
  madrid: 'Madrid — The Royal Court',
  toledo: 'Toledo — The Imperial City',
  barcelona: 'Barcelona — The Mediterranean Jewel',
  valencia: 'Valencia — City of the Turia',
  sevilla: 'Sevilla — Crown of Andalusia',
  granada: 'Granada — The Alhambra Realm',
};

export const QuestLogPanel: React.FC<QuestLogPanelProps> = ({
  quests,
  onClose,
  trackedQuestId,
  onTrackQuest,
}) => {
  // Normalize quests to an array
  const questList: Quest[] = Array.isArray(quests) ? quests : Object.values(quests);

  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null);
  const [showCompletedSection, setShowCompletedSection] = useState(true);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'q' || e.key === 'Q') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const activeQuests = questList.filter((q) => q.status === 'active' || q.status === 'available');
  const completedQuests = questList.filter((q) => q.status === 'completed');

  // Default expansion to first active quest
  useEffect(() => {
    if (activeQuests.length > 0 && !expandedQuestId) {
      setExpandedQuestId(activeQuests[0].id);
    }
  }, [activeQuests, expandedQuestId]);

  // Group active quests by city
  const questsByCity = activeQuests.reduce<Record<string, Quest[]>>((acc, q) => {
    const city = q.cityId || 'madrid';
    if (!acc[city]) acc[city] = [];
    acc[city].push(q);
    return acc;
  }, {});

  const toggleExpand = (id: string) => {
    setExpandedQuestId((prev) => (prev === id ? null : id));
  };

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
      {/* Modal Frame */}
      <div
        style={{
          width: '840px',
          maxWidth: '95vw',
          maxHeight: '88vh',
          backgroundColor: '#281d15',
          backgroundImage: 'radial-gradient(circle at 50% 10%, #3e2d1f 0%, #1a120b 100%)',
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
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            backgroundColor: 'rgba(20, 14, 10, 0.9)',
            borderBottom: '2px solid rgba(212, 168, 64, 0.45)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>⚔️</span>
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
              Registro de Misiones (Quest Log)
            </h2>
            <span style={{ color: THEME.colors.textMuted, fontSize: '0.82rem', marginLeft: '6px' }}>
              ({activeQuests.length} active, {completedQuests.length} completed)
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close quest log"
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

        {/* Quest List Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
          }}
        >
          {activeQuests.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: THEME.colors.textMuted,
                fontStyle: 'italic',
              }}
            >
              No active quests in your log. Explore Spain's cities to uncover new mysteries!
            </div>
          )}

          {/* Grouped by City */}
          {Object.entries(questsByCity).map(([cityId, cityQuests]) => {
            const formattedCityName = CITY_NAMES[cityId as CityId] || cityId.toUpperCase();

            return (
              <div key={cityId} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* City Section Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 8px',
                    backgroundColor: 'rgba(212, 168, 64, 0.12)',
                    borderLeft: '4px solid #d4a840',
                    borderRadius: '0 4px 4px 0',
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>🏰</span>
                  <span
                    style={{
                      fontFamily: THEME.fonts.title,
                      color: THEME.colors.textGold,
                      fontSize: '1.05rem',
                      fontWeight: 'bold',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {formattedCityName}
                  </span>
                </div>

                {/* Quests in this City */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {cityQuests.map((quest) => {
                    const isExpanded = expandedQuestId === quest.id;
                    const isTracked = trackedQuestId === quest.id;
                    const typeIcon = QUEST_TYPE_ICONS[quest.type] || '📜';

                    // Compute completion ratio
                    const totalObjs = quest.objectives.length;
                    const completedObjs = quest.objectives.filter((o) => o.completed).length;
                    const progressPercent = totalObjs > 0 ? Math.round((completedObjs / totalObjs) * 100) : 0;

                    return (
                      <div
                        key={quest.id}
                        style={{
                          backgroundColor: 'rgba(28, 20, 14, 0.88)',
                          border: isTracked
                            ? '2px solid #f2cf6d'
                            : '1.5px solid rgba(212, 168, 64, 0.45)',
                          borderRadius: '10px',
                          boxShadow: isTracked
                            ? '0 0 12px rgba(242, 207, 109, 0.35)'
                            : '0 3px 8px rgba(0,0,0,0.4)',
                          overflow: 'hidden',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {/* Header bar */}
                        <div
                          onClick={() => toggleExpand(quest.id)}
                          style={{
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            backgroundColor: isExpanded ? 'rgba(54, 38, 26, 0.75)' : 'transparent',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '1.3rem' }}>{typeIcon}</span>

                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                  style={{
                                    fontFamily: THEME.fonts.title,
                                    color: THEME.colors.textGold,
                                    fontSize: '1.08rem',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {quest.name}
                                </span>

                                {quest.isMainQuest && (
                                  <span
                                    style={{
                                      backgroundColor: 'rgba(212, 168, 64, 0.25)',
                                      border: '1px solid #d4a840',
                                      color: THEME.colors.goldLight,
                                      borderRadius: '4px',
                                      padding: '1px 6px',
                                      fontSize: '0.66rem',
                                      fontWeight: 800,
                                      fontFamily: THEME.fonts.body,
                                    }}
                                  >
                                    MAIN STORY
                                  </span>
                                )}

                                {isTracked && (
                                  <span
                                    style={{
                                      backgroundColor: 'rgba(74, 138, 191, 0.3)',
                                      border: '1px solid #4a8abf',
                                      color: '#a0d4ff',
                                      borderRadius: '4px',
                                      padding: '1px 6px',
                                      fontSize: '0.66rem',
                                      fontWeight: 800,
                                    }}
                                  >
                                    TRACKED
                                  </span>
                                )}
                              </div>

                              <div style={{ fontSize: '0.74rem', color: THEME.colors.textMuted, marginTop: '2px' }}>
                                Progress: {completedObjs}/{totalObjs} Objectives ({progressPercent}%)
                              </div>
                            </div>
                          </div>

                          <span style={{ color: THEME.colors.goldLight, fontSize: '0.88rem' }}>
                            {isExpanded ? '▲' : '▼'}
                          </span>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div
                            style={{
                              padding: '14px 18px',
                              borderTop: '1px solid rgba(212, 168, 64, 0.25)',
                              backgroundColor: 'rgba(20, 14, 10, 0.65)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px',
                            }}
                          >
                            {/* Narrative */}
                            <p
                              style={{
                                fontFamily: THEME.fonts.body,
                                fontSize: '0.9rem',
                                lineHeight: 1.5,
                                color: THEME.colors.textPrimary,
                                margin: 0,
                              }}
                            >
                              {quest.description}
                            </p>

                            {/* Progress Bar */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  flex: 1,
                                  height: '8px',
                                  backgroundColor: 'rgba(0,0,0,0.6)',
                                  borderRadius: '4px',
                                  overflow: 'hidden',
                                  border: '1px solid rgba(212, 168, 64, 0.4)',
                                }}
                              >
                                <div
                                  style={{
                                    width: `${progressPercent}%`,
                                    height: '100%',
                                    backgroundImage: 'linear-gradient(90deg, #d4a840, #f2cf6d)',
                                    borderRadius: '3px',
                                    transition: 'width 0.3s ease',
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: '0.75rem', color: THEME.colors.goldLight, fontWeight: 700 }}>
                                {progressPercent}%
                              </span>
                            </div>

                            {/* Objectives Checklist */}
                            <div>
                              <div
                                style={{
                                  fontSize: '0.74rem',
                                  textTransform: 'uppercase',
                                  color: THEME.colors.textMuted,
                                  fontWeight: 800,
                                  marginBottom: '6px',
                                }}
                              >
                                Objectives
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {quest.objectives.map((obj) => (
                                  <div
                                    key={obj.id}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px',
                                      fontSize: '0.86rem',
                                      backgroundColor: obj.completed ? 'rgba(40, 70, 30, 0.25)' : 'transparent',
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                    }}
                                  >
                                    <span
                                      style={{
                                        color: obj.completed ? '#76c45e' : THEME.colors.gold,
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {obj.completed ? '✓' : '○'}
                                    </span>
                                    <span
                                      style={{
                                        textDecoration: obj.completed ? 'line-through' : 'none',
                                        color: obj.completed ? THEME.colors.textMuted : THEME.colors.textPrimary,
                                        flex: 1,
                                      }}
                                    >
                                      {obj.description}
                                    </span>
                                    <span style={{ fontSize: '0.72rem', color: THEME.colors.textMuted }}>
                                      {obj.current} / {obj.required}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Rewards Preview */}
                            {quest.rewards && quest.rewards.length > 0 && (
                              <div style={{ marginTop: '4px' }}>
                                <div
                                  style={{
                                    fontSize: '0.72rem',
                                    textTransform: 'uppercase',
                                    color: THEME.colors.textMuted,
                                    fontWeight: 800,
                                    marginBottom: '6px',
                                  }}
                                >
                                  Rewards
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                  {quest.rewards.map((reward, i) => (
                                    <div
                                      key={i}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        backgroundColor: 'rgba(34, 25, 16, 0.9)',
                                        border: '1px solid rgba(212, 168, 64, 0.45)',
                                        borderRadius: '6px',
                                        padding: '4px 10px',
                                        fontSize: '0.76rem',
                                        color: THEME.colors.goldLight,
                                      }}
                                    >
                                      <span>🎁</span>
                                      <span>
                                        {reward.type === 'experience' && `+${reward.experience} XP`}
                                        {reward.type === 'item' && `Item: ${reward.itemId}`}
                                        {reward.type === 'unlock_city' && `Unlock City: ${reward.cityId}`}
                                        {reward.type === 'achievement' && `Achievement: ${reward.achievementId}`}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Track Quest Button */}
                            {onTrackQuest && (
                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                                <button
                                  onClick={() => onTrackQuest(quest.id)}
                                  style={{
                                    backgroundColor: isTracked ? 'rgba(74, 138, 191, 0.3)' : 'rgba(44, 32, 22, 0.9)',
                                    color: isTracked ? '#a0d4ff' : THEME.colors.goldLight,
                                    border: isTracked ? '1px solid #4a8abf' : '1px solid rgba(212, 168, 64, 0.5)',
                                    borderRadius: '6px',
                                    padding: '5px 12px',
                                    fontSize: '0.78rem',
                                    fontFamily: THEME.fonts.body,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  {isTracked ? '✓ Tracking in HUD' : 'Set as Active Tracker'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Completed Quests Section */}
          {completedQuests.length > 0 && (
            <div style={{ marginTop: '14px', borderTop: '2px solid rgba(90, 163, 70, 0.3)', paddingTop: '16px' }}>
              <div
                onClick={() => setShowCompletedSection((prev) => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  padding: '6px 0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#76c45e', fontSize: '1.1rem' }}>✓</span>
                  <span
                    style={{
                      fontFamily: THEME.fonts.title,
                      color: '#76c45e',
                      fontSize: '1.05rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Completed Quests ({completedQuests.length})
                  </span>
                </div>
                <span style={{ color: '#76c45e', fontSize: '0.85rem' }}>
                  {showCompletedSection ? '▲ Hide' : '▼ Show'}
                </span>
              </div>

              {showCompletedSection && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                  {completedQuests.map((quest) => (
                    <div
                      key={quest.id}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: 'rgba(20, 30, 18, 0.6)',
                        border: '1px solid rgba(90, 163, 70, 0.4)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#76c45e' }}>✓</span>
                        <span style={{ fontFamily: THEME.fonts.title, color: '#c4e8b8', fontSize: '0.95rem' }}>
                          {quest.name}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.74rem', color: THEME.colors.textMuted }}>
                        {quest.cityId.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestLogPanel;
