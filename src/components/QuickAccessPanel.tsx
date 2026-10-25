// ============================================================
// ESPAÑA EXPLORER — Quick Access Controls (Lost Legends Style)
// Individual 3D chunky wooden button widgets for Bag, Messages, Quest & Map
// with top illustrated icons, notification bubbles, and orange carved plates
// ============================================================

import React, { useState } from 'react';

export interface QuickAccessPanelProps {
  inventoryBadgeCount?: number;
  journalBadgeCount?: number;
  questBadgeCount?: number;
  mapBadgeCount?: number;
  activePanel?: 'inventory' | 'journal' | 'quest' | 'map' | null;
  onOpenInventory: () => void;
  onOpenJournal: () => void;
  onOpenQuestLog: () => void;
  onOpenMap?: () => void;
}

interface ChunkyButtonProps {
  label: string;
  badge?: number;
  isActive: boolean;
  onClick: () => void;
  shortcut: string;
  icon: React.ReactNode;
}

const ChunkyButton: React.FC<ChunkyButtonProps> = ({
  label,
  badge = 0,
  isActive,
  onClick,
  shortcut,
  icon,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      title={`${label} [${shortcut}]`}
    >
      {/* 1. Top Illustrated Icon with hover bounce */}
      <div
        style={{
          width: '56px',
          height: '46px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transform: isPressed ? 'scale(0.92)' : isHovered ? 'scale(1.1) translateY(-2px)' : 'scale(1)',
          transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
          filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.65))',
        }}
      >
        {icon}

        {/* Red / Pink Notification Bubble */}
        {badge > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '-3px',
              right: '2px',
              backgroundColor: '#ef4444',
              backgroundImage: 'radial-gradient(circle at 35% 35%, #f87171 0%, #dc2626 100%)',
              border: '2px solid #ffffff',
              borderRadius: '50%',
              minWidth: '20px',
              height: '20px',
              padding: '0 4px',
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.7)',
              zIndex: 10,
              animation: 'pulse 1.8s infinite',
            }}
          >
            {badge > 9 ? '9+' : badge}
          </div>
        )}
      </div>

      {/* 2. Chunky Orange Wood Plate underneath (Lost Legends Style) */}
      <div
        style={{
          marginTop: '-6px',
          background: isActive
            ? 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)'
            : isHovered
            ? 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)'
            : 'linear-gradient(180deg, #d97706 0%, #b45309 60%, #92400e 100%)',
          border: '2.5px solid #451a03',
          borderRadius: '7px',
          padding: '2px 14px',
          minWidth: '70px',
          textAlign: 'center',
          boxShadow: isHovered
            ? '0 0 12px rgba(251, 191, 36, 0.6), 0 4px 8px rgba(0,0,0,0.6)'
            : '0 3px 6px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4)',
          transform: isPressed ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.15s ease',
          outline: isActive ? '2px solid #fef08a' : 'none',
        }}
      >
        <span
          style={{
            fontFamily: '"Nunito", "MedievalSharp", cursive, sans-serif',
            fontWeight: 900,
            color: '#ffffff',
            fontSize: '0.85rem',
            letterSpacing: '0.02em',
            textShadow: '0 2px 3px #2b1103, 0 1px 0 #180800',
            display: 'block',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

export const QuickAccessPanel: React.FC<QuickAccessPanelProps> = ({
  inventoryBadgeCount = 0,
  journalBadgeCount = 0,
  questBadgeCount = 0,
  mapBadgeCount = 0,
  activePanel = null,
  onOpenInventory,
  onOpenJournal,
  onOpenQuestLog,
  onOpenMap,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '22px',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        userSelect: 'none',
      }}
    >
      {/* 1. BAG BUTTON (Illustrated Leather Backpack with Sleeping Roll) */}
      <ChunkyButton
        label="Bag"
        shortcut="I"
        badge={inventoryBadgeCount}
        isActive={activePanel === 'inventory'}
        onClick={onOpenInventory}
        icon={
          <svg width="46" height="40" viewBox="0 0 48 42" fill="none">
            {/* Top Sleeping Roll */}
            <rect x="10" y="4" width="28" height="10" rx="5" fill="#475569" stroke="#180c04" strokeWidth="2.5" />
            <line x1="16" y1="4" x2="16" y2="14" stroke="#d97706" strokeWidth="2" />
            <line x1="32" y1="4" x2="32" y2="14" stroke="#d97706" strokeWidth="2" />
            {/* Backpack Main Leather Body */}
            <rect x="8" y="11" width="32" height="26" rx="6" fill="#ea580c" stroke="#180c04" strokeWidth="3" />
            {/* Front Flap */}
            <path
              d="M10 12C10 12 16 23 24 23C32 23 38 12 38 12"
              fill="#c2410c"
              stroke="#180c04"
              strokeWidth="2.5"
            />
            {/* Golden Buckle */}
            <rect x="21" y="20" width="6" height="7" rx="1.5" fill="#fde047" stroke="#180c04" strokeWidth="2" />
            {/* Side Pockets */}
            <rect x="4" y="18" width="6" height="12" rx="2" fill="#9a3412" stroke="#180c04" strokeWidth="2" />
            <rect x="38" y="18" width="6" height="12" rx="2" fill="#9a3412" stroke="#180c04" strokeWidth="2" />
          </svg>
        }
      />

      {/* 2. MESSAGES BUTTON (Illustrated Envelope with Pink/White Letter) */}
      <ChunkyButton
        label="Messages"
        shortcut="J"
        badge={journalBadgeCount}
        isActive={activePanel === 'journal'}
        onClick={onOpenJournal}
        icon={
          <svg width="46" height="40" viewBox="0 0 48 42" fill="none">
            {/* Envelope Back */}
            <rect x="6" y="8" width="36" height="28" rx="5" fill="#e2e8f0" stroke="#180c04" strokeWidth="3" />
            {/* Peeking Letter / Document */}
            <path d="M12 4H36V16H12V4Z" fill="#f8fafc" stroke="#180c04" strokeWidth="2" />
            <line x1="16" y1="7" x2="32" y2="7" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="16" y1="10" x2="28" y2="10" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Envelope Flap Lines */}
            <path d="M6 10L24 24L42 10" stroke="#180c04" strokeWidth="3" strokeLinejoin="round" />
            {/* Red Wax Seal */}
            <circle cx="24" cy="24" r="5" fill="#ef4444" stroke="#180c04" strokeWidth="2" />
          </svg>
        }
      />

      {/* 3. QUEST BUTTON (Orange Exclamation Mark Scroll / Badge) */}
      <ChunkyButton
        label="Quest"
        shortcut="Q"
        badge={questBadgeCount}
        isActive={activePanel === 'quest'}
        onClick={onOpenQuestLog}
        icon={
          <svg width="46" height="40" viewBox="0 0 48 42" fill="none">
            {/* Orange Shield / Tablet */}
            <path
              d="M12 6C12 6 24 3 24 3C24 3 36 6 36 6V26C36 33 24 38 24 38C24 38 12 33 12 26V6Z"
              fill="#f97316"
              stroke="#180c04"
              strokeWidth="3"
            />
            {/* Inner Gold Frame */}
            <path
              d="M15 8C15 8 24 5.5 24 5.5C24 5.5 33 8 33 8V24C33 29.5 24 34 24 34C24 34 15 29.5 15 24V8Z"
              fill="#fb923c"
            />
            {/* Bold Exclamation Mark */}
            <path d="M22 10H26L25 21H23L22 10Z" fill="#180c04" />
            <circle cx="24" cy="26" r="2.2" fill="#180c04" />
          </svg>
        }
      />

      {/* 4. MAP BUTTON (Cartographer Compass / Map) */}
      {onOpenMap && (
        <ChunkyButton
          label="Map"
          shortcut="M"
          badge={mapBadgeCount}
          isActive={activePanel === 'map'}
          onClick={onOpenMap}
          icon={
            <svg width="46" height="40" viewBox="0 0 48 42" fill="none">
              {/* Folded Map Canvas */}
              <path
                d="M8 8L18 5L30 9L40 6V32L30 35L18 31L8 34V8Z"
                fill="#fde047"
                stroke="#180c04"
                strokeWidth="2.5"
              />
              <line x1="18" y1="5" x2="18" y2="31" stroke="#ca8a04" strokeWidth="2" />
              <line x1="30" y1="9" x2="30" y2="35" stroke="#ca8a04" strokeWidth="2" />
              {/* Red Compass Star */}
              <circle cx="24" cy="19" r="6" fill="#ef4444" stroke="#180c04" strokeWidth="1.5" />
              <polygon points="24,14 26,19 24,24 22,19" fill="#ffffff" />
            </svg>
          }
        />
      )}
    </div>
  );
};

export default QuickAccessPanel;
