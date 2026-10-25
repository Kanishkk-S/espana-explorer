// ============================================================
// ESPAÑA EXPLORER — ESP32 Controller Connection & Diagnostics Modal
// Connects Web Serial API to hardware controller with live telemetry,
// input diagnostics, RFID card monitor, and keyboard fallback guidance
// ============================================================

import React, { useState, useEffect } from 'react';
import { ControllerManager } from '@/systems/controller/ControllerManager';
import { ControllerEvent } from '@/types/game';
import { THEME, closeButtonStyle, primaryButtonStyle, secondaryButtonStyle } from './uiTheme';

interface ControllerModalProps {
  controller: ControllerManager;
  onClose: () => void;
}

export const ControllerModal: React.FC<ControllerModalProps> = ({ controller, onClose }) => {
  const [status, setStatus] = useState(controller.getStatus());
  const [logs, setLogs] = useState<string[]>(controller.getLog());
  const [joystick, setJoystick] = useState<{ x: number; y: number }>({ x: 2048, y: 2048 });
  const [activeButtons, setActiveButtons] = useState<Record<string, boolean>>({});
  const [lastRfid, setLastRfid] = useState<string>('Ninguna');
  const [isSupported] = useState<boolean>(ControllerManager.isSupported());

  useEffect(() => {
    // Listen for live controller events
    const unsub = controller.onEvent((evt: ControllerEvent) => {
      if (evt.type === 'joystick' && evt.x !== undefined && evt.y !== undefined) {
        setJoystick({ x: evt.x, y: evt.y });
      } else if (evt.type === 'button' && evt.name) {
        setActiveButtons((prev) => ({ ...prev, [evt.name!]: true }));
        setTimeout(() => {
          setActiveButtons((prev) => ({ ...prev, [evt.name!]: false }));
        }, 300);
      } else if (evt.type === 'rfid' && evt.uid) {
        setLastRfid(evt.uid);
      }
    });

    // Refresh log periodically
    const interval = setInterval(() => {
      setStatus(controller.getStatus());
      setLogs(controller.getLog().slice(-20));
    }, 400);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [controller]);

  const handleConnect = async () => {
    await controller.connect();
    setStatus(controller.getStatus());
  };

  const handleDisconnect = async () => {
    await controller.disconnect();
    setStatus(controller.getStatus());
  };

  // Normalize joystick for UI dot (-100% to +100%)
  const joyNormX = ((joystick.x - 2048) / 2048) * 40;
  const joyNormY = ((joystick.y - 2048) / 2048) * 40;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 130,
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
      <div
        style={{
          width: '740px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          backgroundColor: '#261b12',
          backgroundImage: 'radial-gradient(circle at 50% 20%, #3a281a 0%, #1a1008 100%)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>🎮</span>
            <div>
              <h2
                style={{
                  fontFamily: THEME.fonts.title,
                  color: THEME.colors.textGold,
                  fontSize: '1.4rem',
                  margin: 0,
                  letterSpacing: '0.04em',
                }}
              >
                Controlador Físico ESP32 & Web Serial
              </h2>
              <span style={{ fontSize: '0.78rem', color: THEME.colors.textMuted }}>
                Integración de Mando Hardware, RFID y Telemetría
              </span>
            </div>
          </div>

          <button onClick={onClose} style={closeButtonStyle}>
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* Web Serial Status Banner */}
          {!isSupported && (
            <div
              style={{
                backgroundColor: 'rgba(180, 40, 40, 0.25)',
                border: '1.5px solid #e74c3c',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#f8d7da',
                fontSize: '0.85rem',
              }}
            >
              ⚠️ Tu navegador no soporta la <strong>Web Serial API</strong>. Utiliza Google Chrome o Microsoft Edge en escritorio para conectar el hardware físico. El juego sigue siendo 100% jugable mediante teclado y ratón.
            </div>
          )}

          {/* Connection Controls & Status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(30, 20, 14, 0.85)',
              border: '1px solid rgba(212, 168, 64, 0.3)',
              borderRadius: '8px',
              padding: '16px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: status.connected ? '#2ecc71' : '#e74c3c',
                  boxShadow: status.connected ? '0 0 10px #2ecc71' : '0 0 8px #e74c3c',
                }}
              />
              <div>
                <div style={{ fontWeight: 700, color: THEME.colors.textPrimary, fontSize: '0.95rem' }}>
                  {status.connected ? 'Controlador Conectado (115200 Baud)' : 'Desconectado'}
                </div>
                <div style={{ fontSize: '0.76rem', color: THEME.colors.textMuted }}>
                  {status.port ? `Puerto: ${status.port}` : 'Conecta el ESP32 por USB y pulsa Conectar'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {!status.connected ? (
                <button
                  onClick={handleConnect}
                  disabled={!isSupported}
                  style={{
                    ...primaryButtonStyle,
                    padding: '8px 18px',
                    fontSize: '0.86rem',
                    opacity: isSupported ? 1 : 0.5,
                  }}
                >
                  Conectar Mando
                </button>
              ) : (
                <button
                  onClick={handleDisconnect}
                  style={{
                    ...secondaryButtonStyle,
                    padding: '8px 18px',
                    fontSize: '0.86rem',
                    borderColor: '#e74c3c',
                    color: '#e74c3c',
                  }}
                >
                  Desconectar
                </button>
              )}
            </div>
          </div>

          {/* Live Input Diagnostics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}
          >
            {/* Joystick Visualizer */}
            <div
              style={{
                backgroundColor: 'rgba(20, 14, 10, 0.8)',
                border: '1px solid rgba(212, 168, 64, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: THEME.colors.goldLight }}>
                Joystick Analógico (KY-023)
              </span>

              {/* Joystick circle */}
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  border: '2px dashed rgba(212, 168, 64, 0.5)',
                  backgroundColor: '#120c08',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Crosshairs */}
                <div style={{ position: 'absolute', width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <div style={{ position: 'absolute', height: '100%', width: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                {/* Thumb Dot */}
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: '#f2cf6d',
                    boxShadow: '0 0 8px #f2cf6d',
                    transform: `translate(${joyNormX}px, ${joyNormY}px)`,
                    transition: 'transform 0.05s linear',
                  }}
                />
              </div>

              <span style={{ fontSize: '0.74rem', color: THEME.colors.textMuted, fontFamily: 'monospace' }}>
                X: {joystick.x} | Y: {joystick.y}
              </span>
            </div>

            {/* Buttons & RFID Monitor */}
            <div
              style={{
                backgroundColor: 'rgba(20, 14, 10, 0.8)',
                border: '1px solid rgba(212, 168, 64, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: THEME.colors.goldLight }}>
                Botones y Lector RFID (RC522)
              </span>

              {/* Button pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['SELECT', 'BACK', 'MAP', 'JOURNAL'].map((btn) => (
                  <div
                    key={btn}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '0.76rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      backgroundColor: activeButtons[btn] ? '#d4a840' : 'rgba(40, 28, 18, 0.9)',
                      color: activeButtons[btn] ? '#1a1004' : THEME.colors.textMuted,
                      border: `1px solid ${activeButtons[btn] ? '#f2cf6d' : 'rgba(212, 168, 64, 0.3)'}`,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {btn}
                  </div>
                ))}
              </div>

              {/* RFID card display */}
              <div
                style={{
                  marginTop: 'auto',
                  backgroundColor: 'rgba(10, 8, 6, 0.9)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(212, 168, 64, 0.2)',
                  fontSize: '0.78rem',
                }}
              >
                <div style={{ color: THEME.colors.textMuted }}>Última Tarjeta RFID escaneada:</div>
                <div style={{ color: '#f2cf6d', fontFamily: 'monospace', fontWeight: 700, marginTop: '2px' }}>
                  {lastRfid}
                </div>
              </div>
            </div>
          </div>

          {/* Incoming Message Log */}
          <div>
            <div
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: THEME.colors.textPrimary,
                marginBottom: '6px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Registro de Mensajes JSON Entrantes:</span>
              <span style={{ color: THEME.colors.textMuted, fontSize: '0.74rem' }}>
                {logs.length} líneas
              </span>
            </div>

            <div
              style={{
                height: '110px',
                backgroundColor: '#0f0a06',
                border: '1px solid rgba(212, 168, 64, 0.25)',
                borderRadius: '6px',
                padding: '8px 12px',
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.74rem',
                color: '#a0d468',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
              }}
            >
              {logs.length === 0 ? (
                <span style={{ color: THEME.colors.textMuted }}>Esperando datos del puerto serie...</span>
              ) : (
                logs.map((log, i) => <div key={i}>{log}</div>)
              )}
            </div>
          </div>

          {/* Keyboard Fallback Reference */}
          <div
            style={{
              backgroundColor: 'rgba(30, 22, 15, 0.7)',
              borderRadius: '8px',
              border: '1px solid rgba(212, 168, 64, 0.2)',
              padding: '12px 16px',
              fontSize: '0.78rem',
              color: THEME.colors.textMuted,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ fontWeight: 700, color: THEME.colors.goldLight }}>
              ⌨️ Controles por Teclado Alternativos (Fallback):
            </div>
            <div>
              <strong>WASD / Flechas:</strong> Movimiento &nbsp;|&nbsp; <strong>E / Enter:</strong> Interactuar &nbsp;|&nbsp; <strong>I:</strong> Inventario &nbsp;|&nbsp; <strong>J:</strong> Diario &nbsp;|&nbsp; <strong>Q:</strong> Misiones &nbsp;|&nbsp; <strong>M:</strong> Mapa &nbsp;|&nbsp; <strong>ESC:</strong> Pausa
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControllerModal;
