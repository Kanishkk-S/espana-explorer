// ============================================================
// ESPAÑA EXPLORER — ESP32 Controller Integration
// Web Serial API communication with the ESP32 hardware controller
// ============================================================

import { ControllerEvent, RFIDCardMapping } from '@/types/game';

// RFID card mapping configuration
export const RFID_CARD_MAPPINGS: RFIDCardMapping[] = [
  // Add known card UIDs here
  // Example:
  // { uid: '04 A1 B2 C3', name: 'Atlas Fragment Card', itemId: 'atlas_fragment_1', effect: 'discover_item' },
  // { uid: '04 D4 E5 F6', name: 'Mystery Key Card', itemId: 'old_key', effect: 'discover_item' },
];

export type ControllerCallback = (event: ControllerEvent) => void;

export class ControllerManager {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<string> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private decoder: TextDecoderStream | null = null;
  private isConnected: boolean = false;
  private isReading: boolean = false;
  private callbacks: Set<ControllerCallback> = new Set();
  private buffer: string = '';
  private processedRfids: Set<string> = new Set(); // Prevent duplicate RFID events
  private rfidCooldown: number = 0;
  private lastJoystickEmit: number = 0;
  private readonly JOYSTICK_EMIT_INTERVAL = 50; // ms
  private readonly RFID_COOLDOWN_MS = 3000;
  private messageLog: string[] = [];
  private readonly MAX_LOG_SIZE = 100;

  // Check if Web Serial is supported
  static isSupported(): boolean {
    return 'serial' in navigator;
  }

  // Register event callback
  onEvent(callback: ControllerCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  // Connect to controller
  async connect(): Promise<boolean> {
    if (!ControllerManager.isSupported()) {
      console.warn('Web Serial API not supported in this browser');
      return false;
    }

    try {
      // Request port from user
      this.port = await navigator.serial.requestPort({
        filters: [
          // ESP32 common USB-to-serial chips
          { usbVendorId: 0x10C4 }, // CP210x
          { usbVendorId: 0x1A86 }, // CH340
          { usbVendorId: 0x0403 }, // FTDI
          { usbVendorId: 0x303A }, // Espressif
        ],
      });

      await this.port.open({ baudRate: 115200 });
      
      this.isConnected = true;
      this.log('Connected to ESP32 controller');

      // Set up reading
      this.startReading();

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

    this.isConnected = false;
    this.log('Disconnected from controller');
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
  getStatus(): { connected: boolean; port: string | null } {
    return {
      connected: this.isConnected,
      port: this.port ? 'USB Serial' : null,
    };
  }

  // Get message log
  getLog(): string[] {
    return [...this.messageLog];
  }

  // Clear processed RFIDs (for new game)
  clearProcessedRfids(): void {
    this.processedRfids.clear();
  }

  // Look up RFID card
  lookupRfidCard(uid: string): RFIDCardMapping | undefined {
    return RFID_CARD_MAPPINGS.find(card => card.uid === uid);
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
      }
    });

    // Handle stream end
    readableStream.catch((err: unknown) => {
      if (this.isReading) {
        console.error('Stream error:', err);
        this.isConnected = false;
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
      if (now - this.rfidCooldown < this.RFID_COOLDOWN_MS) {
        return; // Cooldown active
      }
      this.rfidCooldown = now;
      this.log(`RFID: ${event.uid}`);
    }

    // Throttle joystick events
    if (event.type === 'joystick') {
      if (now - this.lastJoystickEmit < this.JOYSTICK_EMIT_INTERVAL) {
        return;
      }
      this.lastJoystickEmit = now;
    }

    // Log the event
    if (event.type !== 'joystick') {
      this.log(`Event: ${JSON.stringify(event)}`);
    }

    // Dispatch to callbacks
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
    this.disconnect();
    this.callbacks.clear();
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
