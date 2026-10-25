// ============================================================
// ESPAÑA EXPLORER — Input Manager
// Handles keyboard input (WASD / Arrow keys, E, Enter, Escape)
// and integrates external controller events (Web Serial ESP32)
// ============================================================

import { ControllerEvent, Vec2 } from '@/types/game';

export class InputManager {
  private keysDown: Set<string> = new Set();
  private interactPressed: boolean = false;
  private pausePressed: boolean = false;
  private controllerMovement: Vec2 = { x: 0, y: 0 };
  private onRFIDCallback?: (uid: string) => void;

  private isBound: boolean = false;

  constructor() {
    this.bind();
  }

  /**
   * Attach window keyboard and focus listeners
   */
  public bind(): void {
    if (this.isBound || typeof window === 'undefined') return;
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
    this.isBound = true;
  }

  /**
   * Detach event listeners
   */
  public destroy(): void {
    if (!this.isBound || typeof window === 'undefined') return;
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    this.keysDown.clear();
    this.interactPressed = false;
    this.pausePressed = false;
    this.isBound = false;
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    // Ignore key events when the user is typing in form controls
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return;
    }

    const key = e.key.toLowerCase();
    this.keysDown.add(key);

    // Prevent scrolling with arrows and space
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
      e.preventDefault();
    }

    // Trigger edge detection for interact
    if (key === 'e' || key === 'enter') {
      this.interactPressed = true;
    }

    // Trigger edge detection for pause / menu
    if (key === 'escape') {
      this.pausePressed = true;
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    const key = e.key.toLowerCase();
    this.keysDown.delete(key);
  };

  private handleBlur = (): void => {
    // Reset all pressed keys when browser window loses focus
    this.keysDown.clear();
    this.controllerMovement = { x: 0, y: 0 };
  };

  /**
   * Returns a normalized movement vector {x, y} from keyboard or controller input.
   * Speed magnitude is capped at 1.0.
   */
  public getMovementVector(): Vec2 {
    let dx = 0;
    let dy = 0;

    // Keyboard W / Up
    if (this.keysDown.has('w') || this.keysDown.has('arrowup')) {
      dy -= 1;
    }
    // Keyboard S / Down
    if (this.keysDown.has('s') || this.keysDown.has('arrowdown')) {
      dy += 1;
    }
    // Keyboard A / Left
    if (this.keysDown.has('a') || this.keysDown.has('arrowleft')) {
      dx -= 1;
    }
    // Keyboard D / Right
    if (this.keysDown.has('d') || this.keysDown.has('arrowright')) {
      dx += 1;
    }

    const hasKeyboardInput = dx !== 0 || dy !== 0;

    if (hasKeyboardInput) {
      const length = Math.hypot(dx, dy);
      if (length > 0) {
        return {
          x: dx / length,
          y: dy / length,
        };
      }
    }

    // Fall back to controller joystick if no keyboard input is active
    const ctrlDist = Math.hypot(this.controllerMovement.x, this.controllerMovement.y);
    const DEADZONE = 0.15;
    if (ctrlDist > DEADZONE) {
      const scale = Math.min(1, ctrlDist) / ctrlDist;
      return {
        x: this.controllerMovement.x * scale,
        y: this.controllerMovement.y * scale,
      };
    }

    return { x: 0, y: 0 };
  }

  /**
   * Check if interact action (E or Enter, or controller button) was pressed.
   * Edge-triggered: returns true only once per key press.
   */
  public isInteractPressed(): boolean {
    if (this.interactPressed) {
      this.interactPressed = false;
      return true;
    }
    return false;
  }

  /**
   * Check if pause action (Escape, or controller pause button) was pressed.
   * Edge-triggered: returns true only once per key press.
   */
  public isPausePressed(): boolean {
    if (this.pausePressed) {
      this.pausePressed = false;
      return true;
    }
    return false;
  }

  /**
   * Check if a specific key is currently held down.
   */
  public isKeyDown(key: string): boolean {
    return this.keysDown.has(key.toLowerCase());
  }

  /**
   * Register a listener for RFID card scan events.
   */
  public onRFID(callback: (uid: string) => void): void {
    this.onRFIDCallback = callback;
  }

  /**
   * Injects events from the ESP32 hardware controller (Web Serial)
   */
  public injectControllerEvent(event: ControllerEvent): void {
    switch (event.type) {
      case 'joystick': {
        const x = typeof event.x === 'number' ? event.x : 0;
        const y = typeof event.y === 'number' ? event.y : 0;
        this.controllerMovement = { x, y };
        break;
      }

      case 'button': {
        const name = (event.name || '').toLowerCase();
        if (['interact', 'a', 'button_a', 'e', 'enter', 'select'].includes(name)) {
          this.interactPressed = true;
        } else if (['pause', 'start', 'button_start', 'menu', 'escape'].includes(name)) {
          this.pausePressed = true;
        } else if (name === 'up') {
          this.controllerMovement.y = -1;
        } else if (name === 'down') {
          this.controllerMovement.y = 1;
        } else if (name === 'left') {
          this.controllerMovement.x = -1;
        } else if (name === 'right') {
          this.controllerMovement.x = 1;
        } else if (name === 'release_dpad') {
          this.controllerMovement = { x: 0, y: 0 };
        }
        break;
      }

      case 'rfid': {
        if (event.uid && this.onRFIDCallback) {
          this.onRFIDCallback(event.uid);
        }
        break;
      }

      default:
        break;
    }
  }

  /**
   * Manually trigger interact (e.g. from touch button on mobile HUD)
   */
  public triggerInteract(): void {
    this.interactPressed = true;
  }

  /**
   * Manually trigger pause
   */
  public triggerPause(): void {
    this.pausePressed = true;
  }

  /**
   * Reset all pressed states
   */
  public reset(): void {
    this.keysDown.clear();
    this.interactPressed = false;
    this.pausePressed = false;
    this.controllerMovement = { x: 0, y: 0 };
  }
}
