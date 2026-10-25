// ============================================================
// ESPAÑA EXPLORER — Inventory Panel Overlay
// Leather & parchment modal with category tabs, 6-column slot grid,
// item inspection pane, and use item actions
// ============================================================

import React, { useState, useEffect } from 'react';
import { Item, ItemCategory } from '@/types/game';
import { THEME, closeButtonStyle, primaryButtonStyle } from './uiTheme';

export interface InventoryPanelProps {
  items: Item[];
  onUseItem: (item: Item) => void;
  onClose: () => void;
}

const CATEGORY_TABS: Array<{ id: ItemCategory | 'all'; label: string; icon: string }> = [
  { id: 'all', label: 'All', icon: '🎒' },
  { id: 'quest_item', label: 'Quest Items', icon: '📜' },
  { id: 'key', label: 'Keys', icon: '🗝️' },
  { id: 'artifact', label: 'Artifacts', icon: '🏺' },
  { id: 'tool', label: 'Tools', icon: '🧭' },
  { id: 'collectible', label: 'Collectibles', icon: '🪙' },
];

export const InventoryPanel: React.FC<InventoryPanelProps> = ({
  items,
  onUseItem,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // ESC key handler to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'i' || e.key === 'I' || e.key === 'b' || e.key === 'B') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Filter items by category
  const filteredItems = items.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  // Default selection
  useEffect(() => {
    if (filteredItems.length > 0 && (!selectedItemId || !filteredItems.some(i => i.id === selectedItemId))) {
      setSelectedItemId(filteredItems[0].id);
    } else if (filteredItems.length === 0) {
      setSelectedItemId(null);
    }
  }, [selectedCategory, items]);

  const selectedItem = items.find((item) => item.id === selectedItemId);

  // Pad grid to at least 18 slots (6 columns x 3 rows)
  const totalSlots = Math.max(18, Math.ceil(filteredItems.length / 6) * 6);
  const slots: Array<Item | null> = Array.from({ length: totalSlots }, (_, i) => filteredItems[i] || null);

  const getCategoryCount = (catId: ItemCategory | 'all') => {
    if (catId === 'all') return items.length;
    return items.filter((i) => i.category === catId).length;
  };

  const getItemEmoji = (item: Item) => {
    if (item.icon) {
      // If icon contains an emoji or symbol, return it
      if (item.icon.length <= 4) return item.icon;
    }
    switch (item.category) {
      case 'quest_item': return '📜';
      case 'key': return '🗝️';
      case 'artifact': return '🏺';
      case 'tool': return '🔍';
      case 'collectible': return '🪙';
      default: return '📦';
    }
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
      {/* Modal Container */}
      <div
        style={{
          width: '880px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          backgroundColor: '#281e16',
          backgroundImage: 'radial-gradient(circle at 50% 20%, #3a2b1f 0%, #1e150f 100%)',
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
        {/* Top Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '2px solid rgba(212, 168, 64, 0.45)',
            backgroundColor: 'rgba(20, 14, 10, 0.85)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>🎒</span>
            <h2
              style={{
                fontFamily: THEME.fonts.title,
                color: THEME.colors.textGold,
                fontSize: '1.6rem',
                margin: 0,
                letterSpacing: '0.05em',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              Inventario del Explorador
            </h2>
            <span
              style={{
                fontSize: '0.8rem',
                color: THEME.colors.textMuted,
                marginLeft: '8px',
              }}
            >
              ({items.length} items)
            </span>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close inventory"
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

        {/* Category Tabs Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 20px',
            backgroundColor: 'rgba(16, 12, 8, 0.6)',
            borderBottom: '1px solid rgba(212, 168, 64, 0.25)',
            overflowX: 'auto',
          }}
        >
          {CATEGORY_TABS.map((tab) => {
            const count = getCategoryCount(tab.id);
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: isSelected
                    ? '1.5px solid #f2cf6d'
                    : '1px solid rgba(212, 168, 64, 0.25)',
                  backgroundColor: isSelected
                    ? 'rgba(90, 60, 30, 0.9)'
                    : 'rgba(34, 25, 18, 0.6)',
                  color: isSelected ? THEME.colors.goldLight : THEME.colors.textSecondary,
                  fontSize: '0.84rem',
                  fontFamily: THEME.fonts.body,
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 0 8px rgba(212, 168, 64, 0.3)' : 'none',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  style={{
                    backgroundColor: isSelected ? '#3a200e' : 'rgba(0,0,0,0.4)',
                    color: isSelected ? '#f2cf6d' : THEME.colors.textMuted,
                    borderRadius: '10px',
                    padding: '1px 6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Body: Grid (Left) & Detail Panel (Right) */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            minHeight: '380px',
            padding: '20px',
            gap: '24px',
            overflow: 'hidden',
          }}
        >
          {/* Item Slots Grid (6 Columns) */}
          <div
            style={{
              flex: '1 1 540px',
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gridAutoRows: '78px',
              gap: '10px',
              overflowY: 'auto',
              maxHeight: '420px',
              paddingRight: '6px',
            }}
          >
            {slots.map((item, index) => {
              if (!item) {
                return (
                  <div
                    key={`empty_${index}`}
                    style={{
                      borderRadius: '8px',
                      backgroundColor: 'rgba(18, 14, 10, 0.4)',
                      border: '1.5px dashed rgba(212, 168, 64, 0.2)',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
                    }}
                  />
                );
              }

              const isSelected = item.id === selectedItemId;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  title={`${item.name} - ${item.description}`}
                  style={{
                    borderRadius: '8px',
                    backgroundColor: isSelected
                      ? 'rgba(80, 55, 30, 0.95)'
                      : 'rgba(38, 28, 20, 0.85)',
                    border: isSelected
                      ? '2px solid #f2cf6d'
                      : '1.5px solid rgba(212, 168, 64, 0.55)',
                    boxShadow: isSelected
                      ? '0 0 14px rgba(242, 207, 109, 0.5), inset 0 0 8px rgba(242, 207, 109, 0.2)'
                      : '0 3px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px 4px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                    transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'rgba(242, 207, 109, 0.8)';
                      e.currentTarget.style.backgroundColor = 'rgba(54, 40, 28, 0.9)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'rgba(212, 168, 64, 0.55)';
                      e.currentTarget.style.backgroundColor = 'rgba(38, 28, 20, 0.85)';
                    }
                  }}
                >
                  {/* Quantity badge */}
                  {item.quantity > 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        backgroundColor: '#1a1008',
                        border: '1px solid #d4a840',
                        color: '#f2cf6d',
                        borderRadius: '4px',
                        padding: '0 4px',
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        fontFamily: THEME.fonts.body,
                      }}
                    >
                      x{item.quantity}
                    </div>
                  )}

                  {/* Icon */}
                  <span style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>
                    {getItemEmoji(item)}
                  </span>

                  {/* Name truncate */}
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontFamily: THEME.fonts.body,
                      fontWeight: 600,
                      color: isSelected ? THEME.colors.goldLight : THEME.colors.textPrimary,
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      width: '100%',
                      marginTop: '2px',
                    }}
                  >
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Item Detail Panel (Right) */}
          <div
            style={{
              flex: '0 0 280px',
              backgroundColor: 'rgba(20, 15, 10, 0.8)',
              border: '1.5px solid rgba(212, 168, 64, 0.45)',
              borderRadius: THEME.borders.radiusMd,
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: THEME.shadows.innerCarve,
            }}
          >
            {selectedItem ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Visual Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(44, 32, 20, 0.9)',
                      border: '2px solid #d4a840',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.2rem',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                      flexShrink: 0,
                    }}
                  >
                    {getItemEmoji(selectedItem)}
                  </div>

                  <div>
                    <h3
                      style={{
                        fontFamily: THEME.fonts.title,
                        color: THEME.colors.textGold,
                        fontSize: '1.15rem',
                        margin: 0,
                        lineHeight: 1.2,
                        letterSpacing: '0.03em',
                      }}
                    >
                      {selectedItem.name}
                    </h3>
                    <div
                      style={{
                        display: 'inline-block',
                        marginTop: '4px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(212, 168, 64, 0.15)',
                        border: '1px solid rgba(212, 168, 64, 0.4)',
                        color: THEME.colors.goldLight,
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                      }}
                    >
                      {selectedItem.category.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(212,168,64,0.4), transparent)',
                  }}
                />

                {/* Lore / Description */}
                <div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      textTransform: 'uppercase',
                      color: THEME.colors.textMuted,
                      fontWeight: 700,
                      marginBottom: '4px',
                    }}
                  >
                    Descripción
                  </div>
                  <p
                    style={{
                      fontFamily: THEME.fonts.body,
                      fontSize: '0.88rem',
                      lineHeight: 1.5,
                      color: THEME.colors.textPrimary,
                      margin: 0,
                    }}
                  >
                    {selectedItem.description}
                  </p>
                </div>

                {/* Source or Target details */}
                {selectedItem.useTarget && (
                  <div
                    style={{
                      backgroundColor: 'rgba(34, 26, 18, 0.7)',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px dashed rgba(212, 168, 64, 0.3)',
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', color: THEME.colors.goldLight, fontWeight: 700 }}>
                      Target: {selectedItem.useTarget}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: THEME.colors.textMuted,
                  textAlign: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '2.5rem', opacity: 0.5 }}>🧭</span>
                <p style={{ fontSize: '0.88rem' }}>
                  Select an item to inspect its history and properties.
                </p>
              </div>
            )}

            {/* Bottom Use Button */}
            {selectedItem && (
              <div style={{ marginTop: '16px' }}>
                <button
                  disabled={!selectedItem.usable}
                  onClick={() => onUseItem(selectedItem)}
                  style={{
                    ...primaryButtonStyle,
                    width: '100%',
                    padding: '10px 0',
                    opacity: selectedItem.usable ? 1 : 0.45,
                    cursor: selectedItem.usable ? 'pointer' : 'not-allowed',
                  }}
                >
                  <span>{selectedItem.usable ? '✨ Usar Objeto' : 'No Usable Ahora'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Hint */}
        <div
          style={{
            padding: '8px 24px',
            backgroundColor: 'rgba(16, 12, 8, 0.85)',
            borderTop: '1px solid rgba(212, 168, 64, 0.25)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: THEME.colors.textMuted,
          }}
        >
          <span>Tip: Keys and Artifacts unlock ancient secret gates in Toledo and Granada.</span>
          <span>Press [ESC] or [I] to close</span>
        </div>
      </div>
    </div>
  );
};

export default InventoryPanel;
