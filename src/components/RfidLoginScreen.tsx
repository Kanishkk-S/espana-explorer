// ============================================================
// ESPAÑA EXPLORER — RFID Authentication & Player Login Scene
// Lost Legends-inspired illustrated portal for Explorer Cards
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { ControllerManager, normalizeUID } from '@/systems/controller/ControllerManager';
import { PlayerProfile, ControllerEvent } from '@/types/game';
import { sound } from '@/systems/audio/SoundSystem';
import { THEME, primaryButtonStyle, secondaryButtonStyle } from './uiTheme';

interface RfidLoginScreenProps {
  controller: ControllerManager;
  onLoginSuccess: (player: PlayerProfile) => void;
}

export const RfidLoginScreen: React.FC<RfidLoginScreenProps> = ({ controller, onLoginSuccess }) => {
  const [controllerStatus, setControllerStatus] = useState(controller.getStatus());
  const [isScanning, setIsScanning] = useState(false);
  const [authenticatedPlayer, setAuthenticatedPlayer] = useState<PlayerProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSimPanel, setShowSimPanel] = useState(false);
  const [customUidInput, setCustomUidInput] = useState('');
  const [registeredPlayers] = useState<PlayerProfile[]>(() => controller.getAllRegisteredPlayers());

  // Handle incoming RFID card scans
  const processCardScan = useCallback((rawUid: string) => {
    setIsScanning(true);
    setErrorMessage(null);

    const norm = normalizeUID(rawUid);
    const player = controller.lookupPlayerByRfid(norm);

    if (player) {
      // Recognized Player
      sound.playQuestComplete();
      setAuthenticatedPlayer(player);
      setIsScanning(false);

      // Hardware feedback
      controller.displayText('BIENVENIDO', player.displayName.substring(0, 16));
      controller.buzz(150, 1800);
      controller.setLED('green', true);
      controller.triggerLoginCooldown(3000);

      // Transition to game after welcome banner
      setTimeout(() => {
        onLoginSuccess(player);
      }, 1600);
    } else {
      // Unrecognized card
      sound.playPuzzleError();
      setIsScanning(false);
      setErrorMessage(`Tarjeta no registrada: [${rawUid}]. Usa una tarjeta de explorador autorizada.`);

      // Hardware feedback
      controller.displayText('NO REGISTRADA', rawUid.substring(0, 16));
      controller.buzz(350, 450);
      controller.setLED('red', true);
      setTimeout(() => {
        controller.setLED('red', false);
      }, 1500);
    }
  }, [controller, onLoginSuccess]);

  // Connect to controller events & lifecycle
  useEffect(() => {
    controller.setMode('login');

    const unsubEvents = controller.onEvent((evt: ControllerEvent) => {
      if (evt.type === 'rfid' && evt.uid) {
        processCardScan(evt.uid);
      }
    });

    const unsubConnect = controller.onConnect(() => {
      setControllerStatus(controller.getStatus());
      sound.playClick();
    });

    const unsubDisconnect = controller.onDisconnect(() => {
      setControllerStatus(controller.getStatus());
    });

    // Check status periodically
    const timer = setInterval(() => {
      setControllerStatus(controller.getStatus());
    }, 1000);

    return () => {
      unsubEvents();
      unsubConnect();
      unsubDisconnect();
      clearInterval(timer);
    };
  }, [controller, processCardScan]);

  const handleConnectController = async () => {
    sound.playClick();
    await controller.connect();
    setControllerStatus(controller.getStatus());
  };

  const handleSimulatedScan = (uid: string) => {
    processCardScan(uid);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#120d09',
        backgroundImage: `
          radial-gradient(circle at 50% 30%, rgba(212, 168, 64, 0.18) 0%, rgba(18, 13, 9, 0.95) 70%),
          linear-gradient(180deg, #18110b 0%, #0d0906 100%)
        `,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        fontFamily: THEME.fonts.body,
        color: THEME.colors.textPrimary,
      }}
    >
      {/* Decorative Golden Corner Accents */}
      <div style={{ position: 'absolute', top: 20, left: 20, width: 48, height: 48, borderTop: '2px solid #d4a840', borderLeft: '2px solid #d4a840', opacity: 0.6 }} />
      <div style={{ position: 'absolute', top: 20, right: 20, width: 48, height: 48, borderTop: '2px solid #d4a840', borderRight: '2px solid #d4a840', opacity: 0.6 }} />
      <div style={{ position: 'absolute', bottom: 20, left: 20, width: 48, height: 48, borderBottom: '2px solid #d4a840', borderLeft: '2px solid #d4a840', opacity: 0.6 }} />
      <div style={{ position: 'absolute', bottom: 20, right: 20, width: 48, height: 48, borderBottom: '2px solid #d4a840', borderRight: '2px solid #d4a840', opacity: 0.6 }} />

      {/* Top Header / Brand */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '24px',
          animation: 'fadeIn 0.8s ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '6px',
          }}
        >
          <span style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}>🏰</span>
          <h1
            style={{
              fontFamily: THEME.fonts.title,
              fontSize: '3.2rem',
              margin: 0,
              letterSpacing: '0.12em',
              background: 'linear-gradient(180deg, #fff3c4 0%, #d4a840 50%, #997320 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 18px rgba(212, 168, 64, 0.4)',
            }}
          >
            ESPAÑA EXPLORER
          </h1>
          <span style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}>⚔️</span>
        </div>
        <div
          style={{
            fontFamily: THEME.fonts.title,
            fontSize: '1rem',
            letterSpacing: '0.24em',
            color: '#d4a840',
            textTransform: 'uppercase',
            opacity: 0.85,
          }}
        >
          El Manuscrito de los Reyes Olvidados
        </div>
      </div>

      {/* Main Authentication Card Pedestal */}
      <div
        style={{
          position: 'relative',
          width: '540px',
          maxWidth: '92vw',
          backgroundColor: '#261b12',
          backgroundImage: 'radial-gradient(circle at 50% 25%, #3a281a 0%, #1a1008 100%)',
          border: '3px solid #d4a840',
          borderRadius: THEME.borders.radiusLg,
          boxShadow: '0 20px 60px rgba(0,0,0,0.85), inset 0 0 30px rgba(212, 168, 64, 0.15)',
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {/* Pedestal Arc & Reader Illustration */}
        <div
          style={{
            position: 'relative',
            width: '200px',
            height: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Pulsing Concentric Scan Rings */}
          <div
            style={{
              position: 'absolute',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              border: `2px dashed ${authenticatedPlayer ? '#5aa346' : '#d4a840'}`,
              opacity: 0.35,
              animation: 'spin 20s linear infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              border: `2px solid ${authenticatedPlayer ? '#76c45e' : 'rgba(212, 168, 64, 0.5)'}`,
              boxShadow: authenticatedPlayer
                ? '0 0 35px rgba(90, 163, 70, 0.7)'
                : '0 0 25px rgba(212, 168, 64, 0.35)',
              animation: 'pulse 2.2s ease-in-out infinite',
            }}
          />

          {/* Illustrated RFID Card */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              width: '130px',
              height: '84px',
              backgroundColor: '#1f160e',
              background: 'linear-gradient(135deg, #3d2c1c 0%, #20150b 100%)',
              border: '2px solid #d4a840',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.7), inset 0 0 10px rgba(212, 168, 64, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '8px 10px',
              transform: authenticatedPlayer ? 'translateY(-6px) scale(1.05)' : 'translateY(0)',
              transition: 'all 0.4s ease',
            }}
          >
            {/* Card Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.62rem', letterSpacing: '0.1em', color: '#d4a840', fontWeight: 'bold' }}>
                EXPLORER CARD
              </span>
              <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>📶</span>
            </div>

            {/* Chip & Emblem */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '22px',
                  height: '18px',
                  backgroundColor: '#d4a840',
                  borderRadius: '3px',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)',
                  border: '1px solid #f2cf6d',
                }}
              />
              <span style={{ fontSize: '0.6rem', color: THEME.colors.textMuted, letterSpacing: '0.06em' }}>
                NFC / RFID
              </span>
            </div>

            {/* Card Number / Status */}
            <div style={{ fontSize: '0.55rem', color: '#f0c860', letterSpacing: '0.12em' }}>
              {authenticatedPlayer ? authenticatedPlayer.playerId : '•••• •••• ••••'}
            </div>
          </div>
        </div>

        {/* Status Callout / Prompt */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          {authenticatedPlayer ? (
            <div style={{ animation: 'bounceIn 0.5s ease' }}>
              <div
                style={{
                  fontFamily: THEME.fonts.title,
                  fontSize: '1.7rem',
                  color: '#76c45e',
                  textShadow: '0 2px 10px rgba(90, 163, 70, 0.6)',
                  marginBottom: '4px',
                }}
              >
                ¡Bienvenido, {authenticatedPlayer.displayName}!
              </div>
              <div style={{ fontSize: '0.92rem', color: '#f0c860' }}>
                {authenticatedPlayer.role || 'Explorador Real de España'}
              </div>
              <div style={{ fontSize: '0.78rem', color: THEME.colors.textMuted, marginTop: '8px' }}>
                Iniciando expedición...
              </div>
            </div>
          ) : (
            <div>
              <h2
                style={{
                  fontFamily: THEME.fonts.title,
                  fontSize: '1.75rem',
                  color: THEME.colors.textGold,
                  margin: '0 0 6px 0',
                  textShadow: '0 2px 6px rgba(0,0,0,0.8)',
                }}
              >
                {isScanning ? 'Leyendo tarjeta...' : 'Scan your Explorer Card'}
              </h2>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: THEME.colors.textSecondary,
                  margin: 0,
                  lineHeight: '1.4',
                }}
              >
                Acerca tu tarjeta RFID física al lector del mando ESP32 para acceder a tu diario de viaje.
              </p>
            </div>
          )}
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div
            style={{
              width: '100%',
              backgroundColor: 'rgba(200, 64, 64, 0.25)',
              border: '1.5px solid #c84040',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '0.84rem',
              color: '#ffb0b0',
              textAlign: 'center',
              animation: 'shake 0.4s ease',
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Controller Connection State Bar */}
        <div
          style={{
            width: '100%',
            backgroundColor: 'rgba(18, 14, 10, 0.8)',
            border: '1px solid rgba(212, 168, 64, 0.3)',
            borderRadius: '8px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: controllerStatus.connected ? '#5aa346' : '#c84040',
                boxShadow: controllerStatus.connected
                  ? '0 0 10px #5aa346'
                  : '0 0 8px rgba(200, 64, 64, 0.6)',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: THEME.colors.textPrimary }}>
                {controllerStatus.connected
                  ? 'Mando ESP32 Conectado (USB Serial 115200)'
                  : 'Mando ESP32 Desconectado'}
              </span>
              <span style={{ fontSize: '0.72rem', color: THEME.colors.textMuted }}>
                {controllerStatus.connected
                  ? 'Lector RC522 listo para escanear'
                  : 'Conecta el cable USB del mando para habilitar RFID'}
              </span>
            </div>
          </div>

          {!controllerStatus.connected ? (
            <button
              onClick={handleConnectController}
              style={{
                ...primaryButtonStyle,
                padding: '8px 16px',
                fontSize: '0.85rem',
              }}
            >
              🎮 Conectar Mando
            </button>
          ) : (
            <span
              style={{
                fontSize: '0.78rem',
                color: '#76c45e',
                fontWeight: 'bold',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(90, 163, 70, 0.2)',
              }}
            >
              Listo
            </span>
          )}
        </div>

        {/* Collapsible Simulation / Virtual Scan Helper */}
        <div style={{ width: '100%', marginTop: '4px' }}>
          <button
            onClick={() => setShowSimPanel((prev) => !prev)}
            style={{
              background: 'none',
              border: 'none',
              color: '#d4a840',
              fontSize: '0.8rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              margin: '0 auto',
              opacity: 0.85,
            }}
          >
            <span>{showSimPanel ? '▲ Ocultar simulador de tarjetas' : '🧪 ¿Sin lector físico? Simular escaneo de tarjeta'}</span>
          </button>

          {showSimPanel && (
            <div
              style={{
                marginTop: '12px',
                backgroundColor: 'rgba(18, 14, 10, 0.95)',
                border: '1px solid rgba(212, 168, 64, 0.4)',
                borderRadius: '8px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: THEME.colors.textMuted }}>
                Perfiles registrados en <code>src/data/rfidCards.json</code>:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                {registeredPlayers.map((p) => (
                  <button
                    key={p.playerId}
                    onClick={() => handleSimulatedScan(p.uid)}
                    disabled={!p.enabled || !!authenticatedPlayer}
                    style={{
                      ...secondaryButtonStyle,
                      padding: '8px 10px',
                      fontSize: '0.78rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '2px',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontWeight: 'bold', color: THEME.colors.textGold }}>
                      👤 {p.displayName}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: THEME.colors.textMuted }}>
                      UID: <code>{p.uid}</code>
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom UID manual test */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <input
                  type="text"
                  placeholder="Escanear UID manual (ej: 04 A1 B2 C3)"
                  value={customUidInput}
                  onChange={(e) => setCustomUidInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customUidInput.trim()) {
                      handleSimulatedScan(customUidInput.trim());
                    }
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(38, 27, 18, 0.8)',
                    border: '1px solid rgba(212, 168, 64, 0.4)',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '6px 10px',
                    fontSize: '0.82rem',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={() => {
                    if (customUidInput.trim()) {
                      handleSimulatedScan(customUidInput.trim());
                    }
                  }}
                  style={{
                    ...secondaryButtonStyle,
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                  }}
                >
                  Probar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div
        style={{
          marginTop: '20px',
          fontSize: '0.76rem',
          color: 'rgba(212, 168, 64, 0.6)',
          letterSpacing: '0.04em',
        }}
      >
        Tecnología RC522 RFID 13.56 MHz + ESP32 Web Serial API
      </div>
    </div>
  );
};

export default RfidLoginScreen;
