# ESPAÑA EXPLORER

A complete, playable browser-based illustrated 2D adventure RPG set in a colorful, hand-illustrated version of Spain.

## 🎮 Overview

Explore a fictionalized, storybook-inspired version of Spain! Travel between cities, meet unique characters, accept quests, find clues, solve puzzles, collect artifacts, and uncover the mystery of **The Forgotten Atlas**.

### Features
- **Hand-illustrated procedural art** — All visuals drawn with Canvas 2D
- **Multiple Spanish cities** — Madrid, Barcelona, Sevilla, Granada, Valencia, Toledo
- **Rich quest system** — Main quest chain + side quests with real objectives
- **Interactive NPCs** — Unique characters with personality and branching dialogue
- **Puzzle mechanics** — Symbol sequences, mechanism puzzles with actual logic
- **Inventory & Journal** — Track items, clues, and discoveries
- **Save/Load** — Persistent progress via localStorage
- **ESP32 Controller** — Optional hardware controller with joystick, buttons, RFID, gyroscope
- **Responsive design** — Desktop-first with tablet/mobile support

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The game runs at `http://localhost:5173` by default.

## 🎯 Controls

### Keyboard
| Key | Action |
|-----|--------|
| WASD / Arrow Keys | Move character |
| E / Enter | Interact with NPCs/objects |
| Escape | Pause menu |
| I | Open inventory |
| J | Open journal |
| Q | Open quest log |
| M | Open world map |

### Mouse
- Click UI buttons for inventory, journal, quests
- Click dialogue choices
- Click map locations to travel

### ESP32 Controller (Optional)
- Joystick: Movement
- SELECT: Interact
- BACK: Menu / Cancel
- MAP: World map
- JOURNAL: Open journal
- RFID cards: Discover items

## 🗺️ Game World

### Madrid (Starting City)
1. **Plaza de la Llegada** — Central plaza with fountain, market, and NPCs
2. **La Biblioteca Antigua** — Old library with puzzles and hidden passages
3. **El Patio Secreto** — Hidden courtyard with rare discoveries

### Other Cities (Unlocked through progression)
- **Barcelona** — Mediterranean port city
- **Sevilla** — Vibrant Andalusian capital
- **Granada** — Moorish palace city
- **Valencia** — Coastal orange grove city
- **Toledo** — Medieval steel city

## 📖 Story: The Secrets of the Forgotten Atlas

You find an old illustrated atlas with missing pages. The remaining drawings point to hidden locations across Spain. As you investigate, you meet historians, artists, and gardeners who reveal that the atlas is connected to a forgotten network of explorers...

## 🏗️ Project Structure

```
src/
  components/     # React UI overlay components
  game/
    engine/       # Game loop, input, camera, collision
    rendering/    # Procedural asset drawing
  data/           # Cities, NPCs, quests, items, puzzles
  systems/        # Quest engine, save/load, controller
  types/          # TypeScript type definitions
  styles/         # Global CSS

firmware/         # ESP32 Arduino firmware

public/
  assets/         # Static assets
```

## 💳 RFID Login & Player Profile System

España Explorer features physical NFC/RFID card authentication powered by the Web Serial API and an RC522 reader on the ESP32.

### Login Flow:
1. When opening the game, a full-screen illustrated **RFID Login Portal** appears.
2. Connect your ESP32 controller via the **Conectar Mando** button (Web Serial API at 115200 baud).
3. Scan your physical NFC/RFID card on the RC522 scanner.
4. If the card UID matches a registered profile in `src/data/rfidCards.json`, the explorer is authenticated:
   - Plays a medieval welcome chime
   - Displays player name & role badge on the screen and on the ESP32 TFT
   - Loads the player's personal saved progress (namespaced by `playerId`)
   - Seamlessly enters gameplay at their saved location and city
5. If the card is unknown or unauthorized, a clear alert is shown and access remains locked.
6. A built-in **Simulador de Tarjetas** test panel allows testing registered explorer UIDs directly in the browser even without hardware.

### Adding New Explorer Profiles:
Edit `src/data/rfidCards.json` under `"players"`:
```json
{
  "players": [
    {
      "uid": "04 A1 B2 C3",
      "playerId": "explorer-01",
      "displayName": "Explorer Mateo",
      "role": "Master Cartographer",
      "enabled": true
    }
  ]
}
```
> **UID Normalization:** UID matching is case-insensitive and ignores spaces, colons, and hyphens (`04:A1:B2:C3`, `04 A1 B2 C3`, and `04A1B2C3` all match).

### Controller Modes & Cooldown:
- **Login Mode:** Scanning an authorized card authenticates the player profile.
- **Gameplay Mode:** Scanning cards grants in-game relics or initiates quests.
- **Mode Separation:** A cooldown prevents the card scanned during login from accidentally granting in-game item rewards upon entering the world.
- **Logout:** In the Pause Menu ([ESC] or BACK button), click **Cambiar Tarjeta / Cerrar Sesión** to safely save and return to the login portal.

## 🎮 ESP32 Controller Setup

### Hardware Requirements
- ESP32 development board
- 1.8" SPI TFT display (ST7735)
- RC522 RFID reader
- MPU6050 accelerometer
- KY-023 joystick (sideways mounting corrected in software)
- 4 buttons (SELECT, BACK, MAP, JOURNAL)
- 2 LEDs (Green, Red)
- Buzzer

### Arduino Libraries Required
- Adafruit GFX Library
- Adafruit ST7735
- MFRC522
- ArduinoJson

### Pin Connections

| Component | Pin | GPIO |
|-----------|-----|------|
| TFT CS | 5 | GPIO5 |
| TFT DC | 27 | GPIO27 |
| TFT RST | 4 | GPIO4 |
| RFID SS | 16 | GPIO16 |
| RFID RST | 17 | GPIO17 |
| MPU SDA | 21 | GPIO21 |
| MPU SCL | 22 | GPIO22 |
| Joystick X | 34 | GPIO34 |
| Joystick Y | 35 | GPIO35 |
| Joystick SW | 33 | GPIO33 |
| SELECT | 25 | GPIO25 |
| BACK | 26 | GPIO26 |
| MAP | 14 | GPIO14 |
| JOURNAL | 32 | GPIO32 |
| Green LED | 13 | GPIO13 |
| Red LED | 15 | GPIO15 |
| Buzzer | 2 | GPIO2 |

### Firmware Upload
1. Open `firmware/espana_explorer_controller.ino` in Arduino IDE
2. Select "ESP32 Dev Module" as board
3. Install required libraries via Library Manager (Adafruit GFX, Adafruit ST7735, MFRC522, ArduinoJson)
4. Upload to ESP32
5. Open Serial Monitor at 115200 baud to verify startup handshake

### Connecting to Game
1. Connect ESP32 via USB
2. On the RFID Login screen, click **Conectar Mando**
3. Select the ESP32 serial port in the browser dialog
4. Once connected, the green indicator activates and the controller TFT displays ready status

### RFID Card Configuration
Edit `src/data/rfidCards.json` to map your NFC card UIDs to game items.
Scan a card and check the ESP32 serial output to get its UID.

> **Note:** USB serial communication must be tested on actual hardware. The Web Serial API requires Chrome/Edge on desktop. The game is fully playable with keyboard/mouse when no controller is connected.

## 🔧 Technical Details

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite 5
- **Rendering:** HTML5 Canvas 2D (procedural drawing)
- **Persistence:** localStorage with versioned saves
- **Controller:** Web Serial API (optional)
- **No external APIs** — Works completely offline after install

## 📝 Development Notes

- The game uses procedural vector art drawn directly on Canvas
- All assets are generated at runtime — no image files required
- The asset renderer (`assetRenderer.ts`) contains all drawing functions
- Environment objects are positioned in world coordinates and rendered relative to the camera
- Y-sorting ensures proper depth ordering for characters and objects
- The quest engine tracks objectives as stateful interactions
- Save data is checksummed and version-migrated

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Blank screen | Check browser console for errors. Ensure `npm install` completed. |
| Controller not connecting | Use Chrome/Edge. Check USB cable. Verify baud rate (115200). |
| RFID not reading | Ensure RC522 is properly wired. Check SPI connections. |
| Save data corrupt | Clear localStorage: `localStorage.removeItem('espana_explorer_save')` |
| Fonts not loading | Check internet connection for Google Fonts, or use fallback fonts |

## 📄 License

This project is for educational and personal use. All game content, characters, and artwork are original creations.
