// ============================================================
// ESPAÑA EXPLORER — Puzzle Panel Overlay
// Interactive modal for Symbol Sequence and Ancient Mechanism puzzles
// with hint reveals, slot clearing, feedback animations, and inventory integration
// ============================================================

import React, { useState, useEffect } from 'react';
import { Puzzle, Item } from '@/types/game';
import { THEME, closeButtonStyle, primaryButtonStyle, secondaryButtonStyle } from './uiTheme';

export interface PuzzlePanelProps {
  puzzle: Puzzle;
  inventory?: Item[];
  onSubmit: (input: string[]) => void;
  onUseItem?: (itemId: string) => void;
  onClose: () => void;
}

interface SymbolOption {
  id: string;
  label: string;
  icon: string;
}

const SYMBOL_PALETTE: SymbolOption[] = [
  { id: 'sun', label: 'Sol (Sun)', icon: '☀️' },
  { id: 'moon', label: 'Luna (Moon)', icon: '🌙' },
  { id: 'star', label: 'Estrella (Star)', icon: '⭐' },
  { id: 'compass', label: 'Brújula (Compass)', icon: '🧭' },
  { id: 'castle', label: 'Castillo (Castle)', icon: '🏰' },
  { id: 'lion', label: 'León (Lion)', icon: '🦁' },
  { id: 'rose', label: 'Rosa (Rose)', icon: '🌹' },
  { id: 'key', label: 'Llave (Key)', icon: '🗝️' },
  { id: 'crown', label: 'Corona (Crown)', icon: '👑' },
  { id: 'falcon', label: 'Halcón (Falcon)', icon: '🦅' },
];

export const PuzzlePanel: React.FC<PuzzlePanelProps> = ({
  puzzle,
  inventory = [],
  onSubmit,
  onUseItem,
  onClose,
}) => {
  const slotCount = puzzle.solution?.length || 4;
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(
    puzzle.currentInput && puzzle.currentInput.length > 0 ? puzzle.currentInput : []
  );
  const [hintIndex, setHintIndex] = useState(puzzle.hintsUsed || 0);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>(
    puzzle.solved ? 'correct' : 'idle'
  );
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Click symbol from palette
  const handleSelectSymbol = (symId: string) => {
    if (puzzle.solved || feedback === 'correct') return;

    if (selectedSlotIndex !== null && selectedSlotIndex < slotCount) {
      // Replace specific slot
      const next = [...selectedSymbols];
      next[selectedSlotIndex] = symId;
      setSelectedSymbols(next);
      setSelectedSlotIndex(null);
    } else {
      // Append to first empty slot
      if (selectedSymbols.length < slotCount) {
        setSelectedSymbols([...selectedSymbols, symId]);
      }
    }
  };

  // Remove symbol from slot
  const handleRemoveSlot = (index: number) => {
    if (puzzle.solved || feedback === 'correct') return;
    const next = [...selectedSymbols];
    next.splice(index, 1);
    setSelectedSymbols(next);
    setSelectedSlotIndex(null);
  };

  // Check / Submit Solution
  const handleSubmit = () => {
    if (selectedSymbols.length < slotCount) return;

    // Check against puzzle solution
    const isCorrect =
      puzzle.solution &&
      puzzle.solution.length === selectedSymbols.length &&
      puzzle.solution.every((val, i) => val.toLowerCase() === selectedSymbols[i].toLowerCase());

    if (isCorrect) {
      setFeedback('correct');
      setTimeout(() => {
        onSubmit(selectedSymbols);
      }, 1000);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback('idle');
      }, 900);
    }
  };

  const handleRevealHint = () => {
    if (hintIndex < (puzzle.hints?.length || 0)) {
      setHintIndex((prev) => prev + 1);
    }
  };

  const isMechanism = puzzle.type === 'mechanism';
  // Check if player has items that might fit
  const usableItems = inventory.filter((i) => i.category === 'quest_item' || i.category === 'key' || i.category === 'artifact');

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 120,
        backgroundColor: THEME.colors.overlayBackdrop,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      {/* Centered Puzzle Frame */}
      <div
        style={{
          width: '680px',
          maxWidth: '94vw',
          backgroundColor: '#261b12',
          backgroundImage: 'radial-gradient(circle at 50% 20%, #3a281a 0%, #1a1008 100%)',
          border: '3px solid #d4a840',
          borderRadius: THEME.borders.radiusLg,
          boxShadow: feedback === 'correct'
            ? '0 0 35px rgba(242, 207, 109, 0.7), 0 20px 50px rgba(0,0,0,0.8)'
            : THEME.shadows.panelDeep,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          animation: feedback === 'wrong' ? 'shake 0.4s ease' : undefined,
          transition: 'box-shadow 0.4s ease',
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
            <span style={{ fontSize: '1.4rem' }}>{isMechanism ? '⚙️' : '🧩'}</span>
            <div>
              <h2
                style={{
                  fontFamily: THEME.fonts.title,
                  color: THEME.colors.textGold,
                  fontSize: '1.4rem',
                  margin: 0,
                  letterSpacing: '0.04em',
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                }}
              >
                {puzzle.name}
              </h2>
              <span style={{ fontSize: '0.74rem', color: THEME.colors.textMuted }}>
                {isMechanism ? 'Ancient Mechanical Device' : 'Heraldic Symbol Sequence'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close puzzle"
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

        {/* Content */}
        <div
          style={{
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            alignItems: 'center',
          }}
        >
          {/* Description / Spanish Mystery Inscription */}
          <div
            style={{
              backgroundColor: 'rgba(244, 232, 208, 0.95)',
              color: '#281a0e',
              border: '2px solid #b45309',
              borderRadius: '10px',
              padding: '14px 20px',
              width: '100%',
              fontSize: '0.94rem',
              lineHeight: 1.6,
              boxShadow: '0 4px 12px rgba(0,0,0,0.35), inset 0 0 15px rgba(180, 83, 9, 0.15)',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                backgroundColor: '#b45309',
                color: '#ffffff',
                fontFamily: THEME.fonts.title,
                fontWeight: 800,
                fontSize: '0.74rem',
                padding: '2px 8px',
                borderRadius: '4px',
                marginBottom: '6px',
                letterSpacing: '0.04em',
              }}
            >
              🇪🇸 ENIGMA EN ESPAÑOL (Mystery in Spanish)
            </div>
            <div style={{ fontStyle: 'italic', color: '#1c1917', fontWeight: 600 }}>
              "{puzzle.description}"
            </div>
          </div>

          {/* Beginner Spanish Vocabulary Helper Card */}
          <div
            style={{
              width: '100%',
              backgroundColor: 'rgba(30, 41, 59, 0.85)',
              border: '1.5px solid #f59e0b',
              borderRadius: '8px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: 800 }}>
              <span>📖</span>
              <span>Beginner Spanish Helper:</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', color: '#f1f5f9', fontWeight: 600, flexWrap: 'wrap' }}>
              <span>☀️ Sol = Sun</span>
              <span>🌙 Luna = Moon</span>
              <span>⭐ Estrella = Star</span>
              <span>🧭 Brújula = Compass</span>
            </div>
          </div>

          {/* Feedback Banner */}
          {feedback === 'wrong' && (
            <div
              style={{
                backgroundColor: 'rgba(160, 40, 40, 0.85)',
                border: '1.5px solid #ff7070',
                color: '#ffffff',
                borderRadius: '6px',
                padding: '6px 16px',
                fontSize: '0.86rem',
                fontWeight: 'bold',
                fontFamily: THEME.fonts.title,
                animation: 'fadeIn 0.2s ease',
              }}
            >
              ✕ Secuencia incorrecta. Observa los relieves de la plaza.
            </div>
          )}

          {feedback === 'correct' && (
            <div
              style={{
                backgroundColor: 'rgba(40, 140, 50, 0.85)',
                border: '1.5px solid #84d876',
                color: '#ffffff',
                borderRadius: '6px',
                padding: '8px 20px',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                fontFamily: THEME.fonts.title,
                animation: 'fadeIn 0.2s ease',
              }}
            >
              ✓ ¡Mecanismo desbloqueado con éxito!
            </div>
          )}

          {/* PUZZLE TYPE 1: SYMBOL SEQUENCE */}
          {!isMechanism ? (
            <>
              {/* Sequence Slots */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: THEME.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Ranuras del Mecanismo (Slots)
                </span>

                <div style={{ display: 'flex', gap: '14px' }}>
                  {Array.from({ length: slotCount }).map((_, index) => {
                    const symId = selectedSymbols[index];
                    const symbolInfo = SYMBOL_PALETTE.find((s) => s.id === symId);
                    const isSlotSelected = selectedSlotIndex === index;

                    return (
                      <div
                        key={index}
                        onClick={() => (symId ? handleRemoveSlot(index) : setSelectedSlotIndex(index))}
                        title={symId ? `Click to remove ${symbolInfo?.label}` : 'Click to select slot'}
                        style={{
                          width: '74px',
                          height: '74px',
                          borderRadius: '12px',
                          backgroundColor: symId ? 'rgba(64, 45, 28, 0.95)' : 'rgba(18, 12, 8, 0.7)',
                          border: isSlotSelected
                            ? '2.5px solid #ffffff'
                            : symId
                            ? '2.5px solid #f2cf6d'
                            : '2px dashed rgba(212, 168, 64, 0.4)',
                          boxShadow: symId
                            ? '0 4px 12px rgba(0,0,0,0.5), inset 0 0 10px rgba(242, 207, 109, 0.3)'
                            : 'inset 0 3px 6px rgba(0,0,0,0.6)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.18s ease',
                          transform: isSlotSelected ? 'scale(1.05)' : 'scale(1)',
                        }}
                      >
                        {symId ? (
                          <>
                            <span style={{ fontSize: '2.1rem' }}>{symbolInfo?.icon || '🔹'}</span>
                            <span style={{ fontSize: '0.64rem', color: THEME.colors.goldLight, fontWeight: 700 }}>
                              {symbolInfo?.label}
                            </span>
                            <div
                              style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-4px',
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                backgroundColor: '#a83030',
                                color: '#fff',
                                fontSize: '0.6rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              ✕
                            </div>
                          </>
                        ) : (
                          <span style={{ color: 'rgba(212, 168, 64, 0.35)', fontSize: '1.2rem', fontFamily: THEME.fonts.title }}>
                            {index + 1}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Symbol Palette */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%' }}>
                <span style={{ fontSize: '0.78rem', color: THEME.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Símbolos Disponibles (Click para insertar)
                </span>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '12px',
                    backgroundColor: 'rgba(20, 14, 10, 0.7)',
                    borderRadius: '10px',
                    border: '1px solid rgba(212, 168, 64, 0.3)',
                    maxWidth: '520px',
                  }}
                >
                  {SYMBOL_PALETTE.map((sym) => (
                    <button
                      key={sym.id}
                      onClick={() => handleSelectSymbol(sym.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '54px',
                        height: '54px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(44, 32, 22, 0.9)',
                        border: '1.5px solid rgba(212, 168, 64, 0.55)',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(74, 52, 34, 0.95)';
                        e.currentTarget.style.borderColor = '#f2cf6d';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(44, 32, 22, 0.9)';
                        e.currentTarget.style.borderColor = 'rgba(212, 168, 64, 0.55)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{sym.icon}</span>
                      <span style={{ fontSize: '0.62rem', color: THEME.colors.textPrimary, fontWeight: 600 }}>
                        {sym.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions & Hints */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: '6px' }}>
                {/* Hint Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {puzzle.hints && puzzle.hints.length > 0 && (
                    <button
                      onClick={handleRevealHint}
                      disabled={hintIndex >= puzzle.hints.length}
                      style={{
                        ...secondaryButtonStyle,
                        fontSize: '0.82rem',
                        padding: '6px 14px',
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        color: '#fde047',
                        border: '1.5px solid #eab308',
                        opacity: hintIndex >= puzzle.hints.length ? 0.5 : 1,
                      }}
                    >
                      <span>💡 English Hint ({hintIndex}/{puzzle.hints.length})</span>
                    </button>
                  )}
                  {selectedSymbols.length > 0 && (
                    <button
                      onClick={() => setSelectedSymbols([])}
                      style={{
                        ...secondaryButtonStyle,
                        fontSize: '0.82rem',
                        padding: '6px 12px',
                      }}
                    >
                      <span>Limpiar</span>
                    </button>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={selectedSymbols.length < slotCount || feedback === 'correct'}
                  style={{
                    ...primaryButtonStyle,
                    padding: '8px 24px',
                    fontSize: '1rem',
                    opacity: selectedSymbols.length < slotCount ? 0.45 : 1,
                    cursor: selectedSymbols.length < slotCount ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span>✓ Comprobar Secuencia</span>
                </button>
              </div>

              {/* Revealed Hints */}
              {hintIndex > 0 && puzzle.hints && (
                <div
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(38, 28, 16, 0.8)',
                    border: '1px dashed #d4a840',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '0.82rem',
                    color: THEME.colors.goldLight,
                  }}
                >
                  {puzzle.hints.slice(0, hintIndex).map((hint, i) => (
                    <div key={i}>
                      <strong>Pista {i + 1}:</strong> {hint}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* PUZZLE TYPE 2: MECHANISM */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
              {/* Mechanism Illustration Frame */}
              <div
                style={{
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  border: '4px solid #d4a840',
                  backgroundColor: '#1e140d',
                  boxShadow: '0 0 20px rgba(0,0,0,0.7), inset 0 0 20px rgba(212, 168, 64, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4.5rem',
                  position: 'relative',
                }}
              >
                ⚙️
              </div>

              <div style={{ textAlign: 'center', fontSize: '0.88rem', color: THEME.colors.textSecondary }}>
                Este mecanismo milenario requiere un objeto o llave especial para activar sus engranajes.
              </div>

              {/* Inventory items to use */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '400px' }}>
                <span style={{ fontSize: '0.76rem', color: THEME.colors.textMuted, textTransform: 'uppercase' }}>
                  Objetos en tu mochila compatibles:
                </span>

                {usableItems.length === 0 ? (
                  <div style={{ fontSize: '0.84rem', color: THEME.colors.textMuted, fontStyle: 'italic', textAlign: 'center' }}>
                    No tienes ningún objeto adecuado en tu inventario.
                  </div>
                ) : (
                  usableItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onUseItem && onUseItem(item.id)}
                      style={{
                        ...secondaryButtonStyle,
                        justifyContent: 'space-between',
                        padding: '8px 14px',
                        backgroundColor: 'rgba(44, 32, 22, 0.9)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{item.icon || '🗝️'}</span>
                        <span>{item.name}</span>
                      </div>
                      <span style={{ color: THEME.colors.goldLight, fontWeight: 700, fontSize: '0.78rem' }}>
                        Usar ›
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PuzzlePanel;
