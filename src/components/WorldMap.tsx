// ============================================================
// ESPAÑA EXPLORER — World Map Overlay
// Parchment cartographic overlay of the Iberian Peninsula with 6 cities,
// dotted trade routes, lock states, completion meters, and fast travel
// ============================================================

import React, { useState, useEffect } from 'react';
import { City, CityId, Vec2 } from '@/types/game';
import { THEME, closeButtonStyle, primaryButtonStyle } from './uiTheme';

export interface WorldMapProps {
  cities: City[] | Record<CityId, City>;
  currentCity: CityId;
  unlockedCities?: CityId[];
  playerPosition?: Vec2;
  onTravel: (cityId: CityId) => void;
  onClose: () => void;
}

interface CityNodeCoord {
  id: CityId;
  name: string;
  x: number; // Percentage or SVG coordinate
  y: number;
  region: string;
  defaultDescription: string;
}

const CITY_COORDS: CityNodeCoord[] = [
  {
    id: 'madrid',
    name: 'Madrid',
    x: 480,
    y: 280,
    region: 'Castilla Central',
    defaultDescription: 'The bustling royal heart of Spain, famous for Plaza Mayor and ancient archives.',
  },
  {
    id: 'toledo',
    name: 'Toledo',
    x: 420,
    y: 340,
    region: 'Castilla-La Mancha',
    defaultDescription: 'City of Three Cultures, renowned for legendary steel, alchemy, and Visigoth lore.',
  },
  {
    id: 'barcelona',
    name: 'Barcelona',
    x: 740,
    y: 170,
    region: 'Cataluña',
    defaultDescription: 'Mediterranean jewel of maritime trade, Gothic spires, and seafaring cartographers.',
  },
  {
    id: 'valencia',
    name: 'Valencia',
    x: 640,
    y: 340,
    region: 'Levante',
    defaultDescription: 'Sunlit shores, fertile orchards, and the secrets of the ancient Turia waterways.',
  },
  {
    id: 'sevilla',
    name: 'Sevilla',
    x: 270,
    y: 470,
    region: 'Andalucía Occidental',
    defaultDescription: 'Golden tower on the Guadalquivir river, birthplace of maritime voyages to the New World.',
  },
  {
    id: 'granada',
    name: 'Granada',
    x: 450,
    y: 510,
    region: 'Andalucía Oriental',
    defaultDescription: 'Nestled under the Sierra Nevada, home to the breathtaking palaces of the Alhambra.',
  },
];

const TRADE_ROUTES: Array<[CityId, CityId]> = [
  ['madrid', 'toledo'],
  ['madrid', 'barcelona'],
  ['madrid', 'valencia'],
  ['madrid', 'sevilla'],
  ['toledo', 'sevilla'],
  ['sevilla', 'granada'],
  ['granada', 'valencia'],
  ['valencia', 'barcelona'],
];

export const WorldMap: React.FC<WorldMapProps> = ({
  cities,
  currentCity,
  unlockedCities = ['madrid', 'toledo', 'valencia'],
  onTravel,
  onClose,
}) => {
  const [selectedCityId, setSelectedCityId] = useState<CityId>(currentCity);

  // Normalize cities input
  const cityMap: Record<CityId, Partial<City>> = Array.isArray(cities)
    ? cities.reduce((acc, c) => ({ ...acc, [c.id]: c }), {} as Record<CityId, Partial<City>>)
    : (cities as Record<CityId, Partial<City>>);

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const selectedNode = CITY_COORDS.find((c) => c.id === selectedCityId) || CITY_COORDS[0];
  const selectedCityData = cityMap[selectedCityId];
  const isSelectedUnlocked = unlockedCities.includes(selectedCityId);
  const isSelectedCurrent = selectedCityId === currentCity;

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
        padding: '20px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      {/* Map Board Frame */}
      <div
        style={{
          width: '980px',
          maxWidth: '96vw',
          height: '660px',
          maxHeight: '94vh',
          backgroundColor: '#f3e5c8',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #fbf3e2 0%, #ecd7b0 70%, #d8be92 100%)',
          border: '4px solid #8e6828',
          borderRadius: THEME.borders.radiusLg,
          boxShadow: '0 20px 60px rgba(0,0,0,0.85), inset 0 0 40px rgba(138, 98, 40, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Ornate Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 24px',
            backgroundColor: 'rgba(54, 38, 24, 0.92)',
            borderBottom: '2px solid #d4a840',
            color: THEME.colors.textGold,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>🗺️</span>
            <h2
              style={{
                fontFamily: THEME.fonts.title,
                fontSize: '1.5rem',
                margin: 0,
                letterSpacing: '0.05em',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              Mapa del Reino de España
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close map"
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

        {/* Map Interactive Area */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
          }}
        >
          {/* SVG Map Canvas with trade routes and coastlines */}
          <svg
            viewBox="0 0 900 600"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            <defs>
              {/* Radial gradient for glowing city nodes */}
              <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f8d674" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#d4a840" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Stylized Iberian Peninsula Coastline */}
            <path
              d="M 120 180 Q 240 100 480 110 T 720 120 Q 820 140 800 240 Q 750 340 700 420 Q 640 500 500 550 Q 340 560 220 530 Q 140 480 180 380 Q 150 280 120 180 Z"
              fill="rgba(224, 204, 164, 0.35)"
              stroke="rgba(146, 114, 72, 0.5)"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />

            {/* Water Waves / Sea texture */}
            <path d="M 80 140 Q 100 135 120 140" stroke="#8a9a86" strokeWidth="1" fill="none" opacity="0.6" />
            <path d="M 740 460 Q 760 455 780 460" stroke="#8a9a86" strokeWidth="1" fill="none" opacity="0.6" />
            <path d="M 780 490 Q 800 485 820 490" stroke="#8a9a86" strokeWidth="1" fill="none" opacity="0.6" />

            {/* Decorative Compass Rose (Top Right) */}
            <g transform="translate(800, 90) scale(0.7)">
              <circle cx="0" cy="0" r="38" stroke="#aa8430" strokeWidth="1.5" fill="none" opacity="0.7" />
              <polygon points="0,-48 6,-10 0,-16 -6,-10" fill="#a83030" stroke="#4a1818" strokeWidth="1" />
              <polygon points="0,48 6,10 0,16 -6,10" fill="#685038" stroke="#4a1818" strokeWidth="1" />
              <polygon points="-48,0 -10,6 -16,0 -10,-6" fill="#685038" stroke="#4a1818" strokeWidth="1" />
              <polygon points="48,0 10,6 16,0 10,-6" fill="#685038" stroke="#4a1818" strokeWidth="1" />
              <text x="0" y="-52" textAnchor="middle" fill="#8e2020" fontFamily={THEME.fonts.title} fontSize="14" fontWeight="bold">N</text>
            </g>

            {/* Trade Routes (Dotted Lines) */}
            {TRADE_ROUTES.map(([startId, endId], index) => {
              const start = CITY_COORDS.find((c) => c.id === startId);
              const end = CITY_COORDS.find((c) => c.id === endId);
              if (!start || !end) return null;

              const isStartUnlocked = unlockedCities.includes(startId);
              const isEndUnlocked = unlockedCities.includes(endId);
              const isRouteActive = isStartUnlocked && isEndUnlocked;

              return (
                <line
                  key={index}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={isRouteActive ? '#a87820' : '#b0a08a'}
                  strokeWidth={isRouteActive ? 2.5 : 1.5}
                  strokeDasharray={isRouteActive ? '5 4' : '3 3'}
                  opacity={isRouteActive ? 0.8 : 0.4}
                />
              );
            })}
          </svg>

          {/* Interactive City Nodes */}
          {CITY_COORDS.map((city) => {
            const isUnlocked = unlockedCities.includes(city.id);
            const isCurrent = city.id === currentCity;
            const isSelected = city.id === selectedCityId;
            const completion = cityMap[city.id]?.completionPercentage ?? (isCurrent ? 65 : isUnlocked ? 25 : 0);

            return (
              <div
                key={city.id}
                onClick={() => setSelectedCityId(city.id)}
                style={{
                  position: 'absolute',
                  left: `${(city.x / 900) * 100}%`,
                  top: `${(city.y / 600) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isSelected ? 30 : 20,
                  cursor: isUnlocked ? 'pointer' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Node Pin / Badge */}
                <div
                  style={{
                    position: 'relative',
                    width: isSelected ? '46px' : '38px',
                    height: isSelected ? '46px' : '38px',
                    borderRadius: '50%',
                    backgroundColor: isUnlocked ? '#3a2414' : '#686058',
                    border: isSelected
                      ? '3px solid #f8e8a0'
                      : isUnlocked
                      ? '2.5px solid #d4a840'
                      : '2px solid #8e8880',
                    boxShadow: isSelected
                      ? '0 0 20px rgba(242, 207, 109, 0.8), 0 4px 10px rgba(0,0,0,0.5)'
                      : isUnlocked
                      ? '0 2px 8px rgba(0,0,0,0.4)'
                      : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isSelected ? '1.5rem' : '1.2rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isUnlocked ? (isCurrent ? '👑' : '🏰') : '🔒'}

                  {/* Pulsing beacon if current city */}
                  {isCurrent && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: '-8px',
                        borderRadius: '50%',
                        border: '2px solid #d4a840',
                        animation: 'pulse 1.8s infinite',
                      }}
                    />
                  )}
                </div>

                {/* City Label Banner */}
                <div
                  style={{
                    marginTop: '6px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: isSelected
                      ? 'rgba(44, 28, 16, 0.95)'
                      : 'rgba(255, 248, 235, 0.9)',
                    border: isSelected ? '1.5px solid #d4a840' : '1px solid #aa8430',
                    color: isSelected ? '#f8e8a0' : '#3a2414',
                    fontFamily: THEME.fonts.title,
                    fontWeight: 'bold',
                    fontSize: '0.86rem',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{city.name}</span>
                  {isUnlocked && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        color: isSelected ? '#d4a840' : '#8a6428',
                        fontWeight: 700,
                      }}
                    >
                      {completion}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Selected City Detail Card (Floating Bottom-Left) */}
          <div
            style={{
              position: 'absolute',
              bottom: '18px',
              left: '18px',
              width: '320px',
              backgroundColor: 'rgba(32, 22, 14, 0.94)',
              border: '2px solid #d4a840',
              borderRadius: THEME.borders.radiusMd,
              padding: '16px',
              boxShadow: THEME.shadows.panelDeep,
              color: THEME.colors.textPrimary,
              zIndex: 40,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <h3
                style={{
                  fontFamily: THEME.fonts.title,
                  color: THEME.colors.textGold,
                  fontSize: '1.25rem',
                  margin: 0,
                  letterSpacing: '0.04em',
                }}
              >
                {selectedNode.name}
              </h3>
              <span style={{ fontSize: '0.74rem', color: THEME.colors.textMuted }}>
                {selectedNode.region}
              </span>
            </div>

            <p style={{ fontSize: '0.84rem', lineHeight: 1.45, margin: 0, color: THEME.colors.textSecondary }}>
              {selectedCityData?.description || selectedNode.defaultDescription}
            </p>

            {/* Completion Meter */}
            {isSelectedUnlocked ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                  <span style={{ color: THEME.colors.textMuted }}>Exploration Progress</span>
                  <span style={{ color: THEME.colors.goldLight, fontWeight: 700 }}>
                    {selectedCityData?.completionPercentage ?? (isSelectedCurrent ? 65 : 25)}%
                  </span>
                </div>
                <div
                  style={{
                    height: '6px',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    border: '1px solid rgba(212, 168, 64, 0.4)',
                  }}
                >
                  <div
                    style={{
                      width: `${selectedCityData?.completionPercentage ?? (isSelectedCurrent ? 65 : 25)}%`,
                      height: '100%',
                      backgroundImage: 'linear-gradient(90deg, #d4a840, #f2cf6d)',
                    }}
                  />
                </div>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: 'rgba(50, 20, 16, 0.6)',
                  border: '1px dashed #c84040',
                  borderRadius: '6px',
                  padding: '8px',
                  fontSize: '0.75rem',
                  color: '#e8a0a0',
                }}
              >
                🔒 Locked: Complete preceding regional quests to obtain the royal travel decree.
              </div>
            )}

            {/* Travel Action Button */}
            {isSelectedUnlocked && !isSelectedCurrent && (
              <button
                onClick={() => onTravel(selectedCityId)}
                style={{
                  ...primaryButtonStyle,
                  marginTop: '4px',
                  width: '100%',
                  padding: '8px 0',
                }}
              >
                <span>🐎 Viajar a {selectedNode.name}</span>
              </button>
            )}

            {isSelectedCurrent && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '6px',
                  backgroundColor: 'rgba(212, 168, 64, 0.15)',
                  border: '1px solid rgba(212, 168, 64, 0.4)',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  color: THEME.colors.goldLight,
                  fontWeight: 700,
                }}
              >
                📍 Tu ubicación actual
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
