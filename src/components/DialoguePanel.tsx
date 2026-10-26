// ============================================================
// ESPAÑA EXPLORER — Dialogue Panel (Lost Legends Composition)
// Floating slate-navy dialogue box with carved orange wood nameplate,
// bulleted conversation text in English, ▶ Accept / Ignore buttons,
// and large right-side overlapping NPC portrait popping over the top edge
// ============================================================

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { DialogueNode, DialogueChoice, NPCAppearance } from '@/types/game';

export interface DialoguePanelProps {
  dialogueNode: DialogueNode | null;
  npcName: string;
  npcAppearance?: NPCAppearance | null;
  onChoice?: (choice: DialogueChoice) => void;
  onContinue?: () => void;
  onAccept?: () => void;
  onIgnore?: () => void;
  isQuestOffer?: boolean;
  filterChoice?: (choice: DialogueChoice) => boolean;
}

export const DialoguePanel: React.FC<DialoguePanelProps> = ({
  dialogueNode,
  npcName,
  npcAppearance = null,
  onChoice,
  onContinue,
  onAccept,
  onIgnore,
  isQuestOffer = false,
  filterChoice,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(0);
  const portraitCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const typewriterTimerRef = useRef<number | null>(null);

  const fullText = dialogueNode?.text || '';

  // Filter available choices based on quest/item/flag conditions
  const availableChoices = React.useMemo(() => {
    if (!dialogueNode?.choices) return [];
    if (!filterChoice) return dialogueNode.choices;
    return dialogueNode.choices.filter(filterChoice);
  }, [dialogueNode, filterChoice]);

  const hasChoices = availableChoices.length > 0;
  const showQuestButtons = isQuestOffer || dialogueNode?.effects?.some((e) => e.type === 'start_quest');

  // Reset choice highlight when node changes
  useEffect(() => {
    setSelectedChoiceIndex(0);
  }, [dialogueNode?.id]);

  // Typewriter effect
  useEffect(() => {
    if (!dialogueNode) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);

    let charIndex = 0;
    if (typewriterTimerRef.current !== null) {
      clearInterval(typewriterTimerRef.current);
    }

    typewriterTimerRef.current = window.setInterval(() => {
      charIndex += 1;
      setDisplayedText(fullText.slice(0, charIndex));

      if (charIndex >= fullText.length) {
        if (typewriterTimerRef.current !== null) {
          clearInterval(typewriterTimerRef.current);
          typewriterTimerRef.current = null;
        }
        setIsTyping(false);
      }
    }, 18);

    return () => {
      if (typewriterTimerRef.current !== null) {
        clearInterval(typewriterTimerRef.current);
        typewriterTimerRef.current = null;
      }
    };
  }, [dialogueNode, fullText]);

  // Fast forward text if clicked or pressed while typing
  const handleSkipTyping = useCallback(() => {
    if (isTyping) {
      if (typewriterTimerRef.current !== null) {
        clearInterval(typewriterTimerRef.current);
        typewriterTimerRef.current = null;
      }
      setDisplayedText(fullText);
      setIsTyping(false);
    } else if (!hasChoices && !showQuestButtons && onContinue) {
      onContinue();
    }
  }, [isTyping, fullText, hasChoices, showQuestButtons, onContinue]);

  // Single unified action execution for SELECT / E / Enter
  const handleSelectAction = useCallback(() => {
    if (isTyping) {
      handleSkipTyping();
      return;
    }

    if (hasChoices) {
      const choice = availableChoices[selectedChoiceIndex] || availableChoices[0];
      if (choice && onChoice) {
        onChoice(choice);
      }
    } else if (showQuestButtons) {
      if (selectedChoiceIndex === 0) {
        onAccept?.();
      } else {
        onIgnore?.();
      }
    } else if (onContinue) {
      onContinue();
    }
  }, [isTyping, handleSkipTyping, hasChoices, availableChoices, selectedChoiceIndex, onChoice, showQuestButtons, onAccept, onIgnore, onContinue]);

  // Choice navigation helper
  const handleNavigate = useCallback((delta: number) => {
    if (hasChoices) {
      setSelectedChoiceIndex((prev) => {
        const next = prev + delta;
        if (next < 0) return availableChoices.length - 1;
        if (next >= availableChoices.length) return 0;
        return next;
      });
    } else if (showQuestButtons) {
      setSelectedChoiceIndex((prev) => (prev === 0 ? 1 : 0));
    }
  }, [hasChoices, availableChoices.length, showQuestButtons]);

  // Keyboard and controller custom event listeners
  useEffect(() => {
    if (!dialogueNode) return;

    const onDialogueSelect = () => {
      handleSelectAction();
    };

    const onDialogueNav = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      handleNavigate(customEvent.detail || 1);
    };

    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'e' || key === 'enter' || key === ' ') {
        e.preventDefault();
        handleSelectAction();
      } else if (key === 'arrowup' || key === 'w' || key === 'arrowleft' || key === 'a') {
        e.preventDefault();
        handleNavigate(-1);
      } else if (key === 'arrowdown' || key === 's' || key === 'arrowright' || key === 'd') {
        e.preventDefault();
        handleNavigate(1);
      }
    };

    window.addEventListener('dialogue_select', onDialogueSelect);
    window.addEventListener('dialogue_navigate', onDialogueNav);
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('dialogue_select', onDialogueSelect);
      window.removeEventListener('dialogue_navigate', onDialogueNav);
      window.removeEventListener('keydown', handleKey);
    };
  }, [dialogueNode, handleSelectAction, handleNavigate]);

  // Render Illustrated Overlapping Portrait
  useEffect(() => {
    const canvas = portraitCanvasRef.current;
    if (!canvas || !dialogueNode) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw large illustrated character with hat / collar
    ctx.save();
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.65;

    // Soft character shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(cx, canvas.height - 10, 50, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body / Robe / Collar
    const outfitColor = npcAppearance?.outfitColor || '#7c3aed';
    ctx.fillStyle = outfitColor;
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 50, canvas.height);
    ctx.quadraticCurveTo(cx - 30, cy + 15, cx, cy + 20);
    ctx.quadraticCurveTo(cx + 30, cy + 15, cx + 50, canvas.height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Head
    const skinColor = npcAppearance?.skinColor || '#fcd34d';
    ctx.fillStyle = skinColor;
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 10, 36, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hair
    const hairColor = npcAppearance?.hairColor || '#4c1d95';
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.arc(cx - 28, cy - 2, 12, 0, Math.PI * 2);
    ctx.arc(cx + 28, cy - 2, 12, 0, Math.PI * 2);
    ctx.fill();

    // Cute smiling eyes & mouth (like Eve the Witch!)
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    // Left eye (happy arch)
    ctx.beginPath();
    ctx.arc(cx - 14, cy - 10, 7, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    // Right eye (happy arch)
    ctx.beginPath();
    ctx.arc(cx + 14, cy - 10, 7, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    // Cheeks
    ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.beginPath();
    ctx.arc(cx - 22, cy - 2, 6, 0, Math.PI * 2);
    ctx.arc(cx + 22, cy - 2, 6, 0, Math.PI * 2);
    ctx.fill();
    // Smile
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy + 3, 7, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Big Cartoon Hat (Orange / Scholar Hat like the reference screenshot!)
    ctx.fillStyle = '#ea580c';
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';

    // Hat brim
    ctx.beginPath();
    ctx.ellipse(cx, cy - 35, 65, 18, -0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hat cone (tilted)
    ctx.beginPath();
    ctx.moveTo(cx - 36, cy - 36);
    ctx.quadraticCurveTo(cx - 15, cy - 75, cx + 20, cy - 100);
    ctx.quadraticCurveTo(cx + 35, cy - 95, cx + 18, cy - 70);
    ctx.lineTo(cx + 34, cy - 36);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Gold Hat Buckle & Belt
    ctx.fillStyle = '#78350f';
    ctx.fillRect(cx - 28, cy - 44, 56, 8);
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 28, cy - 44, 56, 8);

    ctx.fillStyle = '#fde047';
    ctx.fillRect(cx - 10, cy - 47, 20, 14);
    ctx.strokeRect(cx - 10, cy - 47, 20, 14);
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(cx - 5, cy - 43, 10, 6);

    ctx.restore();
  }, [dialogueNode, npcAppearance]);

  if (!dialogueNode) return null;

  // Split text into lines or bullets if multiline
  const lines = displayedText.split('\n').filter((l) => l.trim().length > 0);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '22px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 64px)',
        maxWidth: '1040px',
        minHeight: '135px',
        maxHeight: '210px',
        zIndex: 50,
        backgroundColor: '#2b334a',
        backgroundImage: 'linear-gradient(180deg, #2e3750 0%, #22293d 100%)',
        border: '3px solid rgba(255, 255, 255, 0.14)',
        borderRadius: '22px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), inset 0 2px 0 rgba(255, 255, 255, 0.15)',
        display: 'flex',
        alignItems: 'stretch',
        padding: '24px 175px 18px 30px',
        userSelect: 'none',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: isTyping ? 'pointer' : 'default',
      }}
      onClick={handleSkipTyping}
    >
      {/* 1. TOP-LEFT CARVED ORANGE WOOD NAMEPLATE (From Reference) */}
      <div
        style={{
          position: 'absolute',
          top: '-18px',
          left: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 18px',
          borderRadius: '8px',
          background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
          border: '3px solid #451a03',
          boxShadow: '0 4px 10px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.4)',
          color: '#ffffff',
          fontFamily: '"Nunito", "MedievalSharp", cursive, sans-serif',
          fontWeight: 900,
          fontSize: '1.15rem',
          letterSpacing: '0.03em',
          textShadow: '0 2px 4px #2b1103, 0 1px 0 #180800',
          zIndex: 55,
        }}
      >
        <span>{npcName}</span>
      </div>

      {/* 2. MAIN DIALOGUE CONTENT (ENGLISH) */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minWidth: 0,
          gap: '12px',
        }}
      >
        {/* Bulleted conversation text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            color: '#f8fafc',
            fontFamily: '"Nunito", -apple-system, sans-serif',
            fontSize: '1.02rem',
            lineHeight: 1.55,
            fontWeight: 600,
            overflowY: 'auto',
          }}
        >
          {lines.length > 0 ? (
            lines.map((line, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: '#fbbf24', fontSize: '1.2rem', lineHeight: 1.2 }}>•</span>
                <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
              </div>
            ))
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: '#fbbf24', fontSize: '1.2rem', lineHeight: 1.2 }}>•</span>
              <span>{displayedText}</span>
            </div>
          )}
        </div>

        {/* 3. ACTION BUTTONS: ▶ Accept / Ignore (Lost Legends Style) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: 'auto', flexWrap: 'wrap' }}>
          {/* Quest Offer Actions */}
          {showQuestButtons && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAccept?.();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(180deg, #facc15 0%, #eab308 100%)',
                  border: selectedChoiceIndex === 0 ? '3px solid #ffffff' : '2.5px solid #713f12',
                  borderRadius: '10px',
                  padding: '7px 18px',
                  color: '#422006',
                  fontFamily: '"Nunito", sans-serif',
                  fontWeight: 900,
                  fontSize: '0.98rem',
                  cursor: 'pointer',
                  boxShadow: selectedChoiceIndex === 0 ? '0 0 14px rgba(250, 204, 21, 0.9)' : '0 3px 8px rgba(0,0,0,0.4)',
                  transform: selectedChoiceIndex === 0 ? 'scale(1.04)' : 'scale(1)',
                  transition: 'all 0.1s ease',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <span style={{ color: '#854d0e', fontSize: '0.9rem' }}>▶</span>
                <span>Accept</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onIgnore?.();
                }}
                style={{
                  background: selectedChoiceIndex === 1 ? 'rgba(71, 85, 105, 0.95)' : 'rgba(51, 65, 85, 0.8)',
                  border: selectedChoiceIndex === 1 ? '2.5px solid #ffffff' : '2px solid rgba(148, 163, 184, 0.4)',
                  borderRadius: '10px',
                  padding: '7px 16px',
                  color: selectedChoiceIndex === 1 ? '#ffffff' : '#94a3b8',
                  fontFamily: '"Nunito", sans-serif',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transform: selectedChoiceIndex === 1 ? 'scale(1.04)' : 'scale(1)',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#f1f5f9')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                Ignore
              </button>
            </div>
          )}

          {/* Multiple Branching Choices */}
          {hasChoices && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {availableChoices.map((choice, i) => {
                const isHighlighted = i === selectedChoiceIndex;
                return (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChoice?.(choice);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: isHighlighted
                        ? 'linear-gradient(180deg, #d97706 0%, #b45309 100%)'
                        : 'rgba(40, 52, 78, 0.95)',
                      border: isHighlighted ? '2.5px solid #fde047' : '2px solid #f59e0b',
                      borderRadius: '8px',
                      padding: '6px 14px',
                      color: isHighlighted ? '#ffffff' : '#fef08a',
                      fontFamily: '"Nunito", sans-serif',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      boxShadow: isHighlighted
                        ? '0 0 14px rgba(251, 191, 36, 0.8), 0 3px 8px rgba(0,0,0,0.5)'
                        : '0 2px 6px rgba(0,0,0,0.4)',
                      transform: isHighlighted ? 'scale(1.03)' : 'scale(1)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={() => setSelectedChoiceIndex(i)}
                  >
                    <span style={{ color: isHighlighted ? '#ffffff' : '#f59e0b' }}>▶</span>
                    <span>{choice.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Regular Continue button when no choices */}
          {!hasChoices && !showQuestButtons && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isTyping) handleSkipTyping();
                else onContinue?.();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(180deg, #facc15 0%, #eab308 100%)',
                border: '2.5px solid #713f12',
                borderRadius: '10px',
                padding: '6px 18px',
                color: '#422006',
                fontFamily: '"Nunito", sans-serif',
                fontWeight: 900,
                fontSize: '0.94rem',
                cursor: 'pointer',
                boxShadow: '0 3px 8px rgba(0,0,0,0.4)',
              }}
            >
              <span>{isTyping ? 'Skip' : 'Continue'}</span>
              <span style={{ fontSize: '0.82rem' }}>▶</span>
            </button>
          )}

          {/* Keyboard hint */}
          <span style={{ color: 'rgba(148, 163, 184, 0.7)', fontSize: '0.74rem', marginLeft: 'auto' }}>
            <strong style={{ color: '#fbbf24' }}>[E] / [SELECT]</strong> Avanzar/Confirmar &nbsp;|&nbsp; <strong style={{ color: '#fbbf24' }}>[WASD/↑↓]</strong> Elegir
          </span>
        </div>
      </div>

      {/* 4. OVERLAPPING RIGHT-SIDE ILLUSTRATED NPC PORTRAIT (Lost Legends Style) */}
      <div
        style={{
          position: 'absolute',
          right: '18px',
          bottom: '-12px',
          width: '150px',
          height: '180px',
          pointerEvents: 'none',
          overflow: 'visible',
          zIndex: 60,
          filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.65))',
        }}
      >
        <canvas ref={portraitCanvasRef} width={150} height={180} style={{ display: 'block' }} />
      </div>
    </div>
  );
};

export default DialoguePanel;
