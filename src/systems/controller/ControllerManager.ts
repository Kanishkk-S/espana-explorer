// ============================================================
// ESPAÑA EXPLORER — ESP32 Controller Integration
// Web Serial API communication with the ESP32 hardware controller
// ============================================================

import { ControllerEvent, RFIDCardMapping, PlayerProfile } from '@/types/game';
import rfidCardsConfig from '@/data/rfidCards.json';

// Utility to normalize RFID UIDs (strips spaces, colons, hyphens, prefixes, and converts to uppercase)
export function normalizeUID(uid: string): string {
  if (!uid) return '';
  return String(uid)
    .trim()
    .replace(/\b0x/gi, '')
    .replace(/[^0-9A-Fa-f]/g, '')
    .toUpperCase();
}

export const RFID_CARD_MAPPINGS: RFIDCardMapping[] = (rfidCardsConfig.cards || []) as RFIDCardMapping[];

export type ControllerMode = 'login' | 'gameplay';
export type ControllerCallback = (event: ControllerEvent) => void;

export class ControllerManager {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<string> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private decoder: TextDecoderStream | null = null;
  private isConnected: boolean = false;
  private isReading: boolean = false;
  private callbacks: Set<ControllerCallback> = new Set();
  private disconnectListeners: Set<() => void> = new Set();
  private connectListeners: Set<() => void> = new Set();
  private buffer: string = '';
  private processedRfids: Set<string> = new Set(); // Prevent duplicate RFID events
  private rfidCooldown: number = 0;
  private lastJoystickEmit: number = 0;
  private readonly JOYSTICK_EMIT_INTERVAL = 40; // ms
  private readonly RFID_COOLDOWN_MS = 2500;
  private messageLog: string[] = [];
  private readonly MAX_LOG_SIZE = 100;
  private mode: ControllerMode = 'login';
  private loginCooldownUntil: number = 0;
  private boundDisconnectListener: ((e: Event) => void) | null = null;

  constructor() {
    // Listen for OS USB disconnection
    if (typeof navigator !== 'undefined' && 'serial' in navigator) {
      this.boundDisconnectListener = (event: Event) => {
        // SerialPort disconnect event
        const targetPort = (event as { port?: SerialPort }).port;
        if (targetPort && this.port && targetPort === this.port) {
          this.log('USB controller unplugged by system.');
          this.handlePortDisconnect();
        }
      };
      (navigator.serial as unknown as EventTarget).addEventListener('disconnect', this.boundDisconnectListener as EventListener);
    }
  }

  // Check if Web Serial is supported
  static isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  // Register event callback
  onEvent(callback: ControllerCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  // Register connection lifecycle listeners
  onDisconnect(cb: () => void): () => void {
    this.disconnectListeners.add(cb);
    return () => this.disconnectListeners.delete(cb);
  }

  onConnect(cb: () => void): () => void {
    this.connectListeners.add(cb);
    return () => this.connectListeners.delete(cb);
  }

  // Mode management
  getMode(): ControllerMode {
    return this.mode;
  }

  setMode(mode: ControllerMode): void {
    this.mode = mode;
    this.log(`Controller mode changed: ${mode}`);
    if (this.isConnected) {
      if (mode === 'gameplay') {
        this.displayText('ESPANA EXPLORER', 'Modo Juego Activo');
        this.setLED('green', true);
      } else {
        this.displayText('ESPANA EXPLORER', 'Escanea Tarjeta');
        this.setLED('green', false);
      }
    }
  }

  triggerLoginCooldown(durationMs: number = 3000): void {
    this.loginCooldownUntil = Date.now() + durationMs;
  }

  isInLoginCooldown(): boolean {
    return Date.now() < this.loginCooldownUntil;
  }

  // Connect to controller
  async connect(): Promise<boolean> {
    if (!ControllerManager.isSupported()) {
      console.warn('Web Serial API not supported in this browser');
      return false;
    }

    try {
      // Close any previous port cleanly
      if (this.isConnected || this.port) {
        await this.disconnect();
      }

      // Request port from user
      this.port = await navigator.serial.requestPort({
        filters: [
          // ESP32 common USB-to-serial chips
          { usbVendorId: 0x10C4 }, // CP210x
          { usbVendorId: 0x1A86 }, // CH340
          { usbVendorId: 0x0403 }, // FTDI
          { usbVendorId: 0x303A }, // Espressif native USB / ESP32-S2/S3/C3
        ],
      });

      await this.port.open({ baudRate: 115200 });
      
      this.isConnected = true;
      this.log('Connected to ESP32 controller (115200 baud)');

      // Set up reading loop
      this.startReading();

      // Send initial handshake
      setTimeout(() => {
        if (this.isConnected) {
          this.displayText('ESPANA EXPLORER', this.mode === 'login' ? 'Escanea Tarjeta' : 'Explorador Activo');
          this.buzz(100, 1500);
        }
      }, 300);

      this.connectListeners.forEach(cb => {
        try { cb(); } catch (e) { console.error(e); }
      });

      return true;
    } catch (error) {
      console.error('Failed to connect to controller:', error);
      this.log(`Connection failed: ${error}`);
      return false;
    }
  }

  // Disconnect from controller
  async disconnect(): Promise<void> {
    this.isReading = false;

    try {
      if (this.reader) {
        await this.reader.cancel();
        this.reader = null;
      }
      if (this.writer) {
        await this.writer.close();
        this.writer = null;
      }
      if (this.decoder) {
        this.decoder = null;
      }
      if (this.port) {
        await this.port.close();
        this.port = null;
      }
    } catch (error) {
      console.error('Error during disconnect:', error);
    }

    this.handlePortDisconnect();
  }

  private handlePortDisconnect(): void {
    if (this.isConnected) {
      this.isConnected = false;
      this.log('Disconnected from controller');
      this.disconnectListeners.forEach(cb => {
        try { cb(); } catch (e) { console.error(e); }
      });
    }
  }

  // Send message to controller
  async send(data: object): Promise<boolean> {
    if (!this.port || !this.isConnected) return false;

    try {
      if (!this.writer) {
        const writable = this.port.writable;
        if (!writable) return false;
        this.writer = writable.getWriter();
      }

      const message = JSON.stringify(data) + '\n';
      const encoded = new TextEncoder().encode(message);
      if (this.writer) {
        await this.writer.write(encoded);
      }
      return true;
    } catch (error) {
      console.error('Failed to send to controller:', error);
      return false;
    }
  }

  // Send LED command
  async setLED(color: 'red' | 'green', state: boolean): Promise<boolean> {
    return this.send({ type: 'led', color, state });
  }

  // Send buzzer command
  async buzz(duration: number = 100, frequency: number = 1000): Promise<boolean> {
    return this.send({ type: 'buzzer', duration, frequency });
  }

  // Send display text
  async displayText(line1: string, line2?: string): Promise<boolean> {
    return this.send({ type: 'display', line1, line2 });
  }

  // Get connection status
  getStatus(): { connected: boolean; port: string | null; mode: ControllerMode } {
    return {
      connected: this.isConnected,
      port: this.port ? 'USB Serial (115200)' : null,
      mode: this.mode,
    };
  }

  // Get message log
  getLog(): string[] {
    return [...this.messageLog];
  }

  // Clear processed RFIDs
  clearProcessedRfids(): void {
    this.processedRfids.clear();
  }

  // Look up registered player by RFID UID
  lookupPlayerByRfid(uid: string): PlayerProfile | undefined {
    if (!uid) return undefined;
    const norm = normalizeUID(uid);
    const players: PlayerProfile[] = (rfidCardsConfig.players || []) as PlayerProfile[];
    return players.find(p => p.enabled && normalizeUID(p.uid) === norm);
  }

  // Look up gameplay RFID card mapping
  lookupRfidCard(uid: string): RFIDCardMapping | undefined {
    if (!uid) return undefined;
    const norm = normalizeUID(uid);
    const cards: RFIDCardMapping[] = (rfidCardsConfig.cards || []) as RFIDCardMapping[];
    return cards.find(card => normalizeUID(card.uid) === norm);
  }

  getAllRegisteredPlayers(): PlayerProfile[] {
    return (rfidCardsConfig.players || []) as PlayerProfile[];
  }

  getAllItemCards(): RFIDCardMapping[] {
    return (rfidCardsConfig.cards || []) as RFIDCardMapping[];
  }

  // --- Private Methods ---

  private async startReading(): Promise<void> {
    if (!this.port || !this.port.readable) return;

    this.isReading = true;
    this.decoder = new TextDecoderStream();
    const readableStream = this.port.readable.pipeTo(this.decoder.writable);
    this.reader = this.decoder.readable.getReader();

    // Read loop
    this.readLoop().catch((err: unknown) => {
      if (this.isReading) {
        console.error('Read error:', err);
        this.log(`Read error: ${err}`);
        this.handlePortDisconnect();
      }
    });

    // Handle stream end
    readableStream.catch((err: unknown) => {
      if (this.isReading) {
        console.error('Stream error:', err);
        this.handlePortDisconnect();
      }
    });
  }

  private async readLoop(): Promise<void> {
    while (this.isReading && this.reader) {
      try {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value) {
          this.buffer += value;
          this.processBuffer();
        }
      } catch (error) {
        if (this.isReading) {
          console.error('Read error:', error);
          this.handlePortDisconnect();
        }
        break;
      }
    }
  }

  private processBuffer(): void {
    const lines = this.buffer.split('\n');
    // Keep incomplete last line in buffer
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        const event = JSON.parse(trimmed) as ControllerEvent;
        this.handleEvent(event);
      } catch {
        // Ignore malformed messages safely
        this.log(`Ignored malformed: ${trimmed.substring(0, 50)}`);
      }
    }
  }

  private handleEvent(event: ControllerEvent): void {
    const now = Date.now();

    // Filter duplicate/rapid RFID events
    if (event.type === 'rfid' && event.uid) {
      const norm = normalizeUID(event.uid);
      if (now - this.rfidCooldown < this.RFID_COOLDOWN_MS) {
        return; // Cooldown active
      }
      this.rfidCooldown = now;
      this.log(`RFID scanned: ${event.uid} (Norm: ${norm})`);
    }

    // Throttle joystick events
    if (event.type === 'joystick') {
      if (now - this.lastJoystickEmit < this.JOYSTICK_EMIT_INTERVAL) {
        return;
      }
      this.lastJoystickEmit = now;
    }

    // Log non-joystick events
    if (event.type !== 'joystick') {
      this.log(`Event: ${JSON.stringify(event)}`);
    }

    // Dispatch to registered callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Controller callback error:', error);
      }
    });
  }

  private log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.messageLog.push(`[${timestamp}] ${message}`);
    if (this.messageLog.length > this.MAX_LOG_SIZE) {
      this.messageLog.shift();
    }
  }

  // Cleanup
  destroy(): void {
    if (this.boundDisconnectListener && typeof navigator !== 'undefined' && 'serial' in navigator) {
      (navigator.serial as unknown as EventTarget).removeEventListener('disconnect', this.boundDisconnectListener as EventListener);
      this.boundDisconnectListener = null;
    }
    this.disconnect();
    this.callbacks.clear();
    this.disconnectListeners.clear();
    this.connectListeners.clear();
  }
}

// --- Controller to Game Input Mapping ---
export function mapControllerToGameInput(
  event: ControllerEvent,
  callbacks: {
    onMove?: (dx: number, dy: number) => void;
    onInteract?: () => void;
    onBack?: () => void;
    onMap?: () => void;
    onJournal?: () => void;
    onSelect?: () => void;
    onRfid?: (uid: string) => void;
    onShake?: () => void;
  }
): void {
  switch (event.type) {
    case 'joystick':
      if (callbacks.onMove && event.x !== undefined && event.y !== undefined) {
        // Normalize joystick values (0-4095 range for ESP32 ADC)
        // Center is ~2048, deadzone is ±300
        const deadzone = 300;
        const center = 2048;
        const maxRange = 2048 - deadzone;

        let dx = 0;
        let dy = 0;

        const rawX = event.x - center;
        const rawY = event.y - center;

        if (Math.abs(rawX) > deadzone) {
          dx = (rawX - Math.sign(rawX) * deadzone) / maxRange;
          dx = Math.max(-1, Math.min(1, dx));
        }
        if (Math.abs(rawY) > deadzone) {
          dy = (rawY - Math.sign(rawY) * deadzone) / maxRange;
          dy = Math.max(-1, Math.min(1, dy));
        }

        callbacks.onMove(dx, dy);
      }
      break;

    case 'button':
      switch (event.name) {
        case 'SELECT':
          callbacks.onSelect?.();
          callbacks.onInteract?.();
          break;
        case 'BACK':
          callbacks.onBack?.();
          break;
        case 'MAP':
          callbacks.onMap?.();
          break;
        case 'JOURNAL':
          callbacks.onJournal?.();
          break;
      }
      break;

    case 'rfid':
      if (event.uid) {
        callbacks.onRfid?.(event.uid);
      }
      break;

    case 'gesture':
      if (event.name === 'SHAKE') {
        callbacks.onShake?.();
      }
      break;
  }
}
