/*
 * ============================================================
 * ESPAÑA EXPLORER — ESP32 Controller Firmware (Integrated Hardware)
 * ============================================================
 * 
 * Hardware:
 *   - ESP32 Development Board (ESP32 Dev Module)
 *   - 1.8" SPI TFT Display (ST7735, 128x160 Landscape)
 *   - RC522 RFID Reader (Shared SPI with separate CS)
 *   - MPU6050 Accelerometer / Gyroscope (I2C)
 *   - KY-023 Analog Joystick (Mounted sideways, axes mapped)
 *   - 4 Pushbuttons: SELECT, BACK, MAP, JOURNAL (Active LOW with pullup)
 *   - 2 Status LEDs: Green, Red
 *   - Buzzer: GPIO 2
 * 
 * Communication: Web Serial USB at 115200 baud
 * Protocol: Newline-delimited JSON
 * 
 * Pin Mapping:
 *   TFT Display:   CS=5, DC=27, RST=4, SCK=18, MOSI=23
 *   RC522 RFID:    SS=16, RST=17, SCK=18, MOSI=23, MISO=19
 *   MPU6050:       SDA=21, SCL=22, AD0=GND (0x68)
 *   KY-023 Stick:  VRx=34, VRy=35, SW=33
 *   Buttons:       SELECT=25, BACK=26, MAP=14, JOURNAL=32
 *   LEDs:          GREEN=13, RED=15
 *   Buzzer:        GPIO=2
 * ============================================================
 */

#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ST7735.h>
#include <MFRC522.h>
#include <ArduinoJson.h>

// ============================================
// PIN DEFINITIONS
// ============================================

// TFT Display (ST7735)
#define TFT_CS    5
#define TFT_DC    27
#define TFT_RST   4
// SCK = 18, MOSI = 23 (Hardware VSPI)

// RC522 RFID Reader
#define RFID_SS   16
#define RFID_RST  17
// SCK = 18, MOSI = 23, MISO = 19 (Shared VSPI)

// MPU6050 (I2C)
#define MPU_SDA   21
#define MPU_SCL   22
#define MPU_ADDR  0x68

// KY-023 Joystick (Mounted sideways on breadboard)
#define JOY_X_PIN 34
#define JOY_Y_PIN 35
#define JOY_SW    33

// Pushbuttons (Active LOW with internal pullup)
#define BTN_SELECT  25
#define BTN_BACK    26
#define BTN_MAP     14
#define BTN_JOURNAL 32

// Status LEDs
#define LED_GREEN 13
#define LED_RED   15

// Piezo Buzzer
#define BUZZER_PIN 2

// ============================================
// CONFIGURATION CONSTANTS
// ============================================

#define SERIAL_BAUD         115200
#define JOYSTICK_DEADZONE   300
#define JOYSTICK_CENTER     2048
#define JOYSTICK_SEND_MS    50
#define BUTTON_DEBOUNCE     50
#define RFID_CHECK_MS       100
#define DISPLAY_UPDATE_MS   800
#define SERIAL_TIMEOUT_MS   5000

// MPU6050 Gyroscope Tilt Controls
#define TILT_ENABLED        true
#define TILT_DEADZONE_DEG   9.0f    // Minimum tilt angle to trigger movement
#define TILT_MAX_DEG        32.0f   // Tilt angle for full speed movement
#define TILT_INVERT_X       false   // Invert Left/Right tilt if desired
#define TILT_INVERT_Y       false   // Invert Up/Down tilt if desired

// ============================================
// HARDWARE OBJECTS
// ============================================

Adafruit_ST7735 tft = Adafruit_ST7735(TFT_CS, TFT_DC, TFT_RST);
MFRC522 rfid(RFID_SS, RFID_RST);

// ============================================
// SPI BUS ARBITRATION GUARDS
// ============================================

inline void selectTFT() {
  digitalWrite(RFID_SS, HIGH); // Ensure RFID does NOT decode TFT data
  digitalWrite(TFT_CS, LOW);
}

inline void deselectTFT() {
  digitalWrite(TFT_CS, HIGH);
}

inline void selectRFID() {
  digitalWrite(TFT_CS, HIGH);  // Ensure TFT does NOT decode RFID data
  digitalWrite(RFID_SS, LOW);
}

inline void deselectRFID() {
  digitalWrite(RFID_SS, HIGH);
}

// ============================================
// SYSTEM STATE
// ============================================

// Button management
struct ButtonState {
  uint8_t pin;
  const char* name;
  bool lastState;
  bool currentState;
  unsigned long lastDebounce;
};

ButtonState buttons[] = {
  { BTN_SELECT,  "SELECT",  HIGH, HIGH, 0 },
  { BTN_BACK,    "BACK",    HIGH, HIGH, 0 },
  { BTN_MAP,     "MAP",     HIGH, HIGH, 0 },
  { BTN_JOURNAL, "JOURNAL", HIGH, HIGH, 0 },
  { JOY_SW,      "JOY_BTN", HIGH, HIGH, 0 },
};
const int NUM_BUTTONS = sizeof(buttons) / sizeof(buttons[0]);

// Joystick state & neutral auto-zero
int joyX = JOYSTICK_CENTER;
int joyY = JOYSTICK_CENTER;
int centerRawX = JOYSTICK_CENTER;
int centerRawY = JOYSTICK_CENTER;
float filteredRawX = (float)JOYSTICK_CENTER;
float filteredRawY = (float)JOYSTICK_CENTER;
bool joystickAtCenter = true;
unsigned long lastJoystickSend = 0;

// MPU6050 Gyroscope & Accelerometer state
bool mpuPresent = false;
float pitchAngle = 0.0f;
float rollAngle = 0.0f;
float neutralPitch = 0.0f;
float neutralRoll = 0.0f;
float gyroBiasX = 0.0f;
float gyroBiasY = 0.0f;
unsigned long lastMotionTime = 0;
bool tiltAtCenter = true;

// RFID state
unsigned long lastRfidCheck = 0;
String lastRfidUid = "";
unsigned long lastRfidTime = 0;
byte rfidVersion = 0;

// ST7735 Display & Connection state
unsigned long lastDisplayUpdate = 0;
bool browserConnected = false;
unsigned long lastSerialReceive = 0;

String statusLocation = "Plaza Llegada";
String statusQuest = "The Forgotten Atlas";
String statusObjective = "Explore Plaza";
String statusClue = "SEL: Action";

// LED state
bool greenLedState = false;
bool redLedState = false;

// Forward declarations
void calibrateJoystick();
void initMPU6050();
void calibrateMPU();
void showDiagnosticStartupScreen(const char* rfidMsg, const char* mpuMsg, const char* joyMsg);
void showReadyScreen();
void updateDisplay(unsigned long now);
void readButtons(unsigned long now);
void readJoystick(unsigned long now);
void readMotionControl(unsigned long now);
void checkRFID();
void sendButtonEvent(const char* name);
void sendJoystickEvent(int x, int y);
void sendRfidEvent(String uid);
void readSerialCommands();
void playTone(int frequency, int duration);

// ============================================
// SETUP
// ============================================

void setup() {
  Serial.begin(SERIAL_BAUD);
  
  // 1. Initialize digital I/O pins
  for (int i = 0; i < NUM_BUTTONS; i++) {
    pinMode(buttons[i].pin, INPUT_PULLUP);
  }
  
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_RED, LOW);
  digitalWrite(BUZZER_PIN, LOW);
  
  // 2. Configure SPI Chip Select and Reset pins as inactive HIGH
  pinMode(TFT_CS, OUTPUT);
  digitalWrite(TFT_CS, HIGH); // Deselect TFT
  
  pinMode(RFID_SS, OUTPUT);
  digitalWrite(RFID_SS, HIGH); // Deselect RFID
  
  pinMode(TFT_DC, OUTPUT);
  digitalWrite(TFT_DC, HIGH);
  
  pinMode(TFT_RST, OUTPUT);
  digitalWrite(TFT_RST, HIGH);
  
  pinMode(RFID_RST, OUTPUT);
  digitalWrite(RFID_RST, HIGH);
  
  // 3. Hardware reset both SPI peripherals
  digitalWrite(TFT_RST, LOW);
  digitalWrite(RFID_RST, LOW);
  delay(20);
  digitalWrite(TFT_RST, HIGH);
  digitalWrite(RFID_RST, HIGH);
  delay(80); // Wait for power supply and oscillators to stabilize
  
  // 4. Initialize I2C bus (100kHz standard mode for breadboard reliability)
  Wire.begin(MPU_SDA, MPU_SCL);
  Wire.setClock(100000);
  
  // 5. Initialize shared hardware SPI bus
  SPI.begin(18, 19, 23); // SCK=18, MISO=19, MOSI=23
  
  // 6. Initialize ST7735 TFT display
  deselectRFID();
  selectTFT();
  tft.initR(INITR_BLACKTAB); // 1.8" 128x160 BlackTab initialization
  tft.setRotation(1);        // Landscape (160 wide x 128 high)
  tft.fillScreen(ST77XX_BLACK);
  deselectTFT();
  
  // 7. Auto-zero neutral joystick readings
  calibrateJoystick();
  
  // 8. Initialize MPU6050 sensor
  initMPU6050();
  if (mpuPresent) {
    calibrateMPU();
  }
  
  // 9. Initialize RC522 RFID reader
  deselectTFT();
  selectRFID();
  rfid.PCD_Init();
  delay(30);
  rfid.PCD_SetAntennaGain(rfid.RxGain_max);
  rfid.PCD_AntennaOn();
  rfidVersion = rfid.PCD_ReadRegister(rfid.VersionReg);
  deselectRFID();
  
  // Print diagnostic status to Serial
  Serial.println(F("{\"type\":\"diagnostic\",\"system\":\"ESP32_CONTROLLER_READY\"}"));
  Serial.print(F("[INIT] RC522 Version: 0x"));
  Serial.println(rfidVersion, HEX);
  Serial.print(F("[INIT] MPU6050 Present: "));
  Serial.println(mpuPresent ? F("YES (0x68)") : F("NO"));
  
  // 10. Show comprehensive diagnostic startup screen on ST7735
  char rfidBuf[24];
  if (rfidVersion == 0x92 || rfidVersion == 0x91 || rfidVersion == 0x88 || rfidVersion == 0x12) {
    snprintf(rfidBuf, sizeof(rfidBuf), "READY (v0x%02X)", rfidVersion);
  } else {
    snprintf(rfidBuf, sizeof(rfidBuf), "WAITING (0x%02X)", rfidVersion);
  }
  
  const char* mpuBuf = mpuPresent ? "READY (0x68)" : "NOT FOUND";
  char joyBuf[24];
  snprintf(joyBuf, sizeof(joyBuf), "OK (%d,%d)", centerRawX, centerRawY);
  
  showDiagnosticStartupScreen(rfidBuf, mpuBuf, joyBuf);
  
  // 11. Audible startup chirp
  playTone(1000, 80);
  delay(60);
  playTone(1600, 90);
  
  digitalWrite(LED_GREEN, HIGH);
  delay(1200); // Allow user to view hardware test diagnostics on screen
  digitalWrite(LED_GREEN, LOW);
  
  // Transition to full companion UI
  showReadyScreen();
}

// ============================================
// MAIN LOOP
// ============================================

void loop() {
  unsigned long now = millis();
  
  // 1. Process physical button presses (debounced edge-triggered)
  readButtons(now);
  
  // 2. Process joystick directional input
  readJoystick(now);
  
  // 3. Process MPU6050 gyroscope tilt controls
  if (mpuPresent && TILT_ENABLED) {
    readMotionControl(now);
  }
  
  // 4. Process RC522 RFID scans
  if (now - lastRfidCheck >= RFID_CHECK_MS) {
    lastRfidCheck = now;
    checkRFID();
  }
  
  // 5. Receive browser serial commands (LEDs, display text, companion data)
  readSerialCommands();
  
  // 6. Monitor Web Serial connection timeout
  if (lastSerialReceive > 0 && now - lastSerialReceive > SERIAL_TIMEOUT_MS) {
    if (browserConnected) {
      browserConnected = false;
      updateDisplay(now);
    }
  }
  
  // 7. Refresh companion display periodically
  if (now - lastDisplayUpdate >= DISPLAY_UPDATE_MS) {
    lastDisplayUpdate = now;
    updateDisplay(now);
  }
  
  delay(1);
}

// ============================================
// HARDWARE INITIALIZATION & CALIBRATION
// ============================================

void calibrateJoystick() {
  long sumX = 0;
  long sumY = 0;
  const int CAL_SAMPLES = 48;
  for (int i = 0; i < CAL_SAMPLES; i++) {
    sumX += analogRead(JOY_X_PIN);
    sumY += analogRead(JOY_Y_PIN);
    delay(4);
  }
  centerRawX = sumX / CAL_SAMPLES;
  centerRawY = sumY / CAL_SAMPLES;

  // Safe fallback if joystick pin is disconnected or floating
  if (centerRawX < 400 || centerRawX > 3700) centerRawX = JOYSTICK_CENTER;
  if (centerRawY < 400 || centerRawY > 3700) centerRawY = JOYSTICK_CENTER;

  filteredRawX = (float)centerRawX;
  filteredRawY = (float)centerRawY;
}

void initMPU6050() {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B); // PWR_MGMT_1
  Wire.write(0x00); // Wake up MPU6050
  if (Wire.endTransmission(true) != 0) {
    mpuPresent = false;
    return;
  }
  
  // Configure Gyroscope: ±500 deg/sec
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x1B); // GYRO_CONFIG
  Wire.write(0x08);
  Wire.endTransmission(true);
  
  // Configure Accelerometer: ±4g
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x1C); // ACCEL_CONFIG
  Wire.write(0x08);
  if (Wire.endTransmission(true) == 0) {
    mpuPresent = true;
  } else {
    mpuPresent = false;
  }
}

void calibrateMPU() {
  long sumAx = 0, sumAy = 0, sumAz = 0;
  long sumGx = 0, sumGy = 0;
  const int SAMPLES = 32;
  
  for (int i = 0; i < SAMPLES; i++) {
    Wire.beginTransmission(MPU_ADDR);
    Wire.write(0x3B);
    Wire.endTransmission(false);
    Wire.requestFrom((uint8_t)MPU_ADDR, (uint8_t)14, (uint8_t)true);
    
    if (Wire.available() >= 14) {
      int16_t ax = (Wire.read() << 8) | Wire.read();
      int16_t ay = (Wire.read() << 8) | Wire.read();
      int16_t az = (Wire.read() << 8) | Wire.read();
      Wire.read(); Wire.read(); // Skip temp
      int16_t gx = (Wire.read() << 8) | Wire.read();
      int16_t gy = (Wire.read() << 8) | Wire.read();
      Wire.read(); Wire.read(); // Skip gz
      
      sumAx += ax;
      sumAy += ay;
      sumAz += az;
      sumGx += gx;
      sumGy += gy;
    }
    delay(5);
  }
  
  float avgAx = (float)sumAx / SAMPLES;
  float avgAy = (float)sumAy / SAMPLES;
  float avgAz = (float)sumAz / SAMPLES;
  
  gyroBiasX = (float)sumGx / SAMPLES;
  gyroBiasY = (float)sumGy / SAMPLES;
  
  neutralPitch = atan2(avgAy, sqrt(avgAx * avgAx + avgAz * avgAz)) * 180.0f / PI;
  neutralRoll  = atan2(avgAx, sqrt(avgAy * avgAy + avgAz * avgAz)) * 180.0f / PI;
  
  pitchAngle = neutralPitch;
  rollAngle  = neutralRoll;
  lastMotionTime = millis();
}

// ============================================
// INPUT PROCESSING
// ============================================

void readButtons(unsigned long now) {
  for (int i = 0; i < NUM_BUTTONS; i++) {
    bool reading = digitalRead(buttons[i].pin);
    
    if (reading != buttons[i].lastState) {
      buttons[i].lastDebounce = now;
    }
    
    if (now - buttons[i].lastDebounce > BUTTON_DEBOUNCE) {
      if (reading != buttons[i].currentState) {
        buttons[i].currentState = reading;
        
        // Edge-triggered: emit on press (HIGH -> LOW)
        if (buttons[i].currentState == LOW) {
          sendButtonEvent(buttons[i].name);
          
          digitalWrite(LED_GREEN, HIGH);
          playTone(800, 30);
          delay(20);
          digitalWrite(LED_GREEN, greenLedState ? HIGH : LOW);
        }
      }
    }
    
    buttons[i].lastState = reading;
  }
}

void readJoystick(unsigned long now) {
  if (now - lastJoystickSend < JOYSTICK_SEND_MS) return;
  
  int rawX = analogRead(JOY_X_PIN);
  int rawY = analogRead(JOY_Y_PIN);
  
  // Exponential moving average filter
  filteredRawX = filteredRawX * 0.75f + (float)rawX * 0.25f;
  filteredRawY = filteredRawY * 0.75f + (float)rawY * 0.25f;

  // Sideways mounting axis mapping:
  // - Vertical: JOY_X_PIN (GPIO 34). UP increases rawX (devV > 0 -> outY < 2048)
  // - Horizontal: JOY_Y_PIN (GPIO 35). RIGHT decreases rawY (devH < 0 -> outX > 2048)
  float devV = filteredRawX - (float)centerRawX;
  float devH = filteredRawY - (float)centerRawY;

  bool inDeadzone = (abs(devV) < JOYSTICK_DEADZONE) && (abs(devH) < JOYSTICK_DEADZONE);

  if (!inDeadzone) {
    int outX = JOYSTICK_CENTER;
    int outY = JOYSTICK_CENTER;
    float maxRange = (float)(JOYSTICK_CENTER - JOYSTICK_DEADZONE);

    // Horizontal axis (inverted to correct left/right)
    if (abs(devH) > JOYSTICK_DEADZONE) {
      float magH = abs(devH) - JOYSTICK_DEADZONE;
      float normH = (magH / maxRange) * JOYSTICK_CENTER;
      if (normH > JOYSTICK_CENTER) normH = JOYSTICK_CENTER;
      outX = (devH > 0) ? (JOYSTICK_CENTER + (int)normH) : (JOYSTICK_CENTER - (int)normH);
    }

    // Vertical axis
    if (abs(devV) > JOYSTICK_DEADZONE) {
      float magV = abs(devV) - JOYSTICK_DEADZONE;
      float normV = (magV / maxRange) * JOYSTICK_CENTER;
      if (normV > JOYSTICK_CENTER) normV = JOYSTICK_CENTER;
      outY = (devV > 0) ? (JOYSTICK_CENTER - (int)normV) : (JOYSTICK_CENTER + (int)normV);
    }

    outX = constrain(outX, 0, 4095);
    outY = constrain(outY, 0, 4095);

    joyX = outX;
    joyY = outY;
    joystickAtCenter = false;
    sendJoystickEvent(joyX, joyY);
    lastJoystickSend = now;
  } else if (!joystickAtCenter) {
    // If joystick just returned to center, update joyX/joyY
    joyX = JOYSTICK_CENTER;
    joyY = JOYSTICK_CENTER;
    joystickAtCenter = true;
    
    // If tilt is also neutral, emit center position
    if (tiltAtCenter) {
      sendJoystickEvent(JOYSTICK_CENTER, JOYSTICK_CENTER);
    }
    lastJoystickSend = now;
  }
}

void readMotionControl(unsigned long now) {
  if (now - lastMotionTime < 25) return; // 40Hz sampling
  float dt = (float)(now - lastMotionTime) / 1000.0f;
  if (dt <= 0.0f || dt > 0.1f) dt = 0.025f;
  lastMotionTime = now;

  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  if (Wire.endTransmission(false) != 0) return;
  
  Wire.requestFrom((uint8_t)MPU_ADDR, (uint8_t)14, (uint8_t)true);
  if (Wire.available() < 14) return;
  
  int16_t rawAccX = (Wire.read() << 8) | Wire.read();
  int16_t rawAccY = (Wire.read() << 8) | Wire.read();
  int16_t rawAccZ = (Wire.read() << 8) | Wire.read();
  Wire.read(); Wire.read(); // Skip temp
  int16_t rawGyroX = (Wire.read() << 8) | Wire.read();
  int16_t rawGyroY = (Wire.read() << 8) | Wire.read();
  Wire.read(); Wire.read(); // Skip gyro Z

  // Accelerometer angles
  float pitchAcc = atan2((float)rawAccY, sqrt((float)rawAccX * rawAccX + (float)rawAccZ * rawAccZ)) * 180.0f / PI;
  float rollAcc  = atan2((float)rawAccX, sqrt((float)rawAccY * rawAccY + (float)rawAccZ * rawAccZ)) * 180.0f / PI;

  // Gyroscope angular rate (deg/sec)
  float gyroRateX = (float)(rawGyroX - gyroBiasX) / 65.5f;
  float gyroRateY = (float)(rawGyroY - gyroBiasY) / 65.5f;

  // Complementary filter: fast gyro response anchored to gravity
  pitchAngle = 0.92f * (pitchAngle + gyroRateX * dt) + 0.08f * pitchAcc;
  rollAngle  = 0.92f * (rollAngle  + gyroRateY * dt) + 0.08f * rollAcc;

  // Tilt displacement relative to calibrated resting position
  float devPitch = pitchAngle - neutralPitch;
  float devRoll  = rollAngle - neutralRoll;

  if (TILT_INVERT_Y) devPitch = -devPitch;
  if (TILT_INVERT_X) devRoll  = -devRoll;

  bool inDeadzone = (abs(devPitch) < TILT_DEADZONE_DEG) && (abs(devRoll) < TILT_DEADZONE_DEG);

  // If physical joystick is active, joystick takes priority
  if (!joystickAtCenter) {
    tiltAtCenter = inDeadzone;
    return;
  }

  // Tilt controls character movement when joystick is untouched
  if (!inDeadzone) {
    float normPitch = 0.0f;
    float normRoll  = 0.0f;

    if (abs(devPitch) > TILT_DEADZONE_DEG) {
      float magP = constrain(abs(devPitch) - TILT_DEADZONE_DEG, 0.0f, TILT_MAX_DEG - TILT_DEADZONE_DEG);
      normPitch = (magP / (TILT_MAX_DEG - TILT_DEADZONE_DEG)) * (float)JOYSTICK_CENTER;
      if (devPitch < 0) normPitch = -normPitch; // Tilt forward -> Game UP
    }

    if (abs(devRoll) > TILT_DEADZONE_DEG) {
      float magR = constrain(abs(devRoll) - TILT_DEADZONE_DEG, 0.0f, TILT_MAX_DEG - TILT_DEADZONE_DEG);
      normRoll = (magR / (TILT_MAX_DEG - TILT_DEADZONE_DEG)) * (float)JOYSTICK_CENTER;
      if (devRoll < 0) normRoll = -normRoll;   // Tilt left -> Game LEFT
    }

    int tiltX = constrain(JOYSTICK_CENTER + (int)normRoll, 0, 4095);
    int tiltY = constrain(JOYSTICK_CENTER + (int)normPitch, 0, 4095);

    if (now - lastJoystickSend >= JOYSTICK_SEND_MS) {
      tiltAtCenter = false;
      sendJoystickEvent(tiltX, tiltY);
      lastJoystickSend = now;
    }
  } else if (!tiltAtCenter) {
    tiltAtCenter = true;
    if (now - lastJoystickSend >= JOYSTICK_SEND_MS) {
      sendJoystickEvent(JOYSTICK_CENTER, JOYSTICK_CENTER);
      lastJoystickSend = now;
    }
  }
}

// ============================================
// RFID READING
// ============================================

void checkRFID() {
  selectRFID();
  
  if (!rfid.PICC_IsNewCardPresent()) {
    deselectRFID();
    return;
  }
  if (!rfid.PICC_ReadCardSerial()) {
    deselectRFID();
    return;
  }
  
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (i > 0) uid += " ";
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  
  unsigned long now = millis();
  if (uid == lastRfidUid && (now - lastRfidTime) < 2500) {
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
    deselectRFID();
    return;
  }
  
  lastRfidUid = uid;
  lastRfidTime = now;
  
  sendRfidEvent(uid);
  
  // Feedback
  digitalWrite(LED_GREEN, HIGH);
  playTone(1500, 70);
  delay(30);
  playTone(2000, 80);
  digitalWrite(LED_GREEN, greenLedState ? HIGH : LOW);
  
  statusClue = "Card: " + uid;
  updateDisplay(now);
  
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  deselectRFID();
}

// ============================================
// SERIAL PROTOCOL
// ============================================

void sendButtonEvent(const char* name) {
  StaticJsonDocument<128> doc;
  doc["type"] = "button";
  doc["name"] = name;
  serializeJson(doc, Serial);
  Serial.println();
}

void sendJoystickEvent(int x, int y) {
  StaticJsonDocument<128> doc;
  doc["type"] = "joystick";
  doc["x"] = x;
  doc["y"] = y;
  serializeJson(doc, Serial);
  Serial.println();
}

void sendRfidEvent(String uid) {
  StaticJsonDocument<128> doc;
  doc["type"] = "rfid";
  doc["uid"] = uid;
  serializeJson(doc, Serial);
  Serial.println();
}

void readSerialCommands() {
  while (Serial.available()) {
    String line = Serial.readStringUntil('\n');
    line.trim();
    if (line.length() == 0) continue;
    
    lastSerialReceive = millis();
    
    if (!browserConnected) {
      browserConnected = true;
      playTone(1000, 40);
      delay(30);
      playTone(1500, 50);
    }
    
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, line);
    if (error) continue;
    
    const char* type = doc["type"];
    if (!type) continue;
    
    if (strcmp(type, "led") == 0) {
      const char* color = doc["color"];
      bool state = doc["state"];
      if (strcmp(color, "green") == 0) {
        greenLedState = state;
        digitalWrite(LED_GREEN, state ? HIGH : LOW);
      } else if (strcmp(color, "red") == 0) {
        redLedState = state;
        digitalWrite(LED_RED, state ? HIGH : LOW);
      }
    }
    else if (strcmp(type, "buzzer") == 0) {
      int duration = doc["duration"] | 100;
      int frequency = doc["frequency"] | 1000;
      playTone(frequency, duration);
    }
    else if (strcmp(type, "companion") == 0) {
      const char* loc = doc["loc"];
      const char* quest = doc["quest"];
      const char* obj = doc["obj"];
      const char* clue = doc["clue"];
      
      if (loc) statusLocation = String(loc);
      if (quest) statusQuest = String(quest);
      if (obj) statusObjective = String(obj);
      if (clue) statusClue = String(clue);
      
      updateDisplay(millis());
    }
    else if (strcmp(type, "display") == 0) {
      const char* line1 = doc["line1"];
      const char* line2 = doc["line2"];
      if (line1) statusLocation = String(line1);
      if (line2) statusClue = String(line2);
      updateDisplay(millis());
    }
  }
}

// ============================================
// ST7735 DISPLAY FUNCTIONS
// ============================================

void showDiagnosticStartupScreen(const char* rfidMsg, const char* mpuMsg, const char* joyMsg) {
  selectTFT();
  
  tft.fillScreen(ST77XX_BLACK);
  
  // Header banner
  tft.fillRect(0, 0, 160, 18, 0x18C3); // Dark Navy Blue
  tft.setTextSize(1);
  tft.setTextColor(0xFD20); // Gold
  tft.setCursor(18, 5);
  tft.print("ESPANA EXPLORER");
  
  // Title
  tft.setCursor(8, 24);
  tft.setTextColor(ST77XX_WHITE);
  tft.print("Hardware Diagnostics:");
  
  tft.drawFastHLine(8, 35, 144, 0x4208);
  
  // RFID Status
  tft.setCursor(8, 42);
  tft.setTextColor(0x07FF); // Cyan
  tft.print("RFID: ");
  tft.setTextColor(ST77XX_WHITE);
  tft.print(rfidMsg);
  
  // MPU6050 Status
  tft.setCursor(8, 58);
  tft.setTextColor(0xFD20); // Gold
  tft.print("MPU6050: ");
  tft.setTextColor(ST77XX_WHITE);
  tft.print(mpuMsg);
  
  // Joystick Status
  tft.setCursor(8, 74);
  tft.setTextColor(0x07E0); // Green
  tft.print("Joystick: ");
  tft.setTextColor(ST77XX_WHITE);
  tft.print(joyMsg);
  
  // Tilt Control Mode
  tft.setCursor(8, 90);
  tft.setTextColor(0xAEDC); // Light Green
  tft.print("Tilt Mode: ");
  tft.setTextColor(ST77XX_WHITE);
  tft.print("ACTIVE (40Hz)");
  
  // Footer
  tft.drawFastHLine(8, 106, 144, 0x4208);
  tft.setCursor(8, 114);
  tft.setTextColor(0x7BEF);
  tft.print("Conecta Web USB (115200)");
  
  deselectTFT();
}

void showReadyScreen() {
  selectTFT();
  tft.fillScreen(ST77XX_BLACK);
  deselectTFT();
  updateDisplay(millis());
}

void updateDisplay(unsigned long now) {
  selectTFT();
  
  // Header Bar (0..14)
  tft.fillRect(0, 0, 160, 15, 0x18C3); // Dark Blue
  tft.setTextSize(1);
  tft.setTextColor(0xFD20); // Gold
  tft.setCursor(4, 4);
  tft.print("ESPANA EXPLORER");
  
  // Connection & City (16..26)
  tft.fillRect(0, 16, 160, 11, ST77XX_BLACK);
  tft.setCursor(4, 18);
  if (browserConnected) {
    tft.setTextColor(0x07E0); // Green
    tft.print(">> Online: ");
    tft.setTextColor(ST77XX_WHITE);
    tft.print(statusLocation.substring(0, 14));
  } else {
    tft.setTextColor(0xF800); // Red
    tft.print("-- Desconectado (USB) --");
  }
  
  // Quest Name (28..40)
  tft.fillRect(0, 28, 160, 11, ST77XX_BLACK);
  tft.setCursor(4, 30);
  tft.setTextColor(0xFD20); // Gold
  tft.print("M: ");
  tft.setTextColor(ST77XX_WHITE);
  tft.print(statusQuest.substring(0, 22));
  
  // Current Objective (41..51)
  tft.fillRect(0, 41, 160, 11, ST77XX_BLACK);
  tft.setCursor(4, 43);
  tft.setTextColor(0x07FF); // Cyan
  tft.print("Obj: ");
  tft.setTextColor(0xCE59); // Silver
  tft.print(statusObjective.substring(0, 20));
  
  // Clue / Action Prompt / RFID (53..64)
  tft.fillRect(0, 53, 160, 12, ST77XX_BLACK);
  tft.setCursor(4, 55);
  tft.setTextColor(0xAEDC); // Light Green
  tft.print(">> ");
  tft.print(statusClue.substring(0, 23));
  
  // Joystick & Tilt Status (67..77)
  tft.fillRect(0, 67, 160, 11, ST77XX_BLACK);
  tft.setCursor(4, 69);
  tft.setTextColor(0x7BEF); // Gray
  tft.print("Joy:");
  tft.print(joyX);
  tft.print(",");
  tft.print(joyY);
  tft.print(" Tilt:");
  tft.print((int)pitchAngle);
  tft.print(",");
  tft.print((int)rollAngle);
  
  // Divider (80)
  tft.drawFastHLine(4, 80, 152, 0x4208);
  
  // Button Hints (83..127)
  tft.fillRect(0, 83, 160, 44, ST77XX_BLACK);
  tft.setTextColor(0xFD20); // Gold
  tft.setCursor(4, 85);
  tft.print("SEL: Interact/Avanzar");
  tft.setTextColor(0x7BEF);
  tft.setCursor(4, 97);
  tft.print("BACK: Cancelar/Cerrar");
  tft.setCursor(4, 109);
  tft.print("MAP: Mapa | JRN: Diario");
  
  deselectTFT();
  lastDisplayUpdate = now;
}

// ============================================
// AUDIO UTILITIES
// ============================================

void playTone(int frequency, int duration) {
  if (frequency <= 0 || duration <= 0) return;

  // Arduino-ESP32 core 3.x LEDC API
  if (!ledcAttach(BUZZER_PIN, frequency, 8)) {
    return;
  }

  ledcWrite(BUZZER_PIN, 128);
  delay(duration);
  ledcWrite(BUZZER_PIN, 0);
  ledcDetach(BUZZER_PIN);
}
