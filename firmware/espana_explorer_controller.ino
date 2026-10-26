#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ST7735.h>
#include <MFRC522.h>
#include <ArduinoJson.h>

// =========================
// PIN DEFINITIONS
// =========================

// TFT Display
#define TFT_CS    5
#define TFT_DC    27
#define TFT_RST   4
// SCK = 18, MOSI = 23 (hardware SPI)

// RC522 RFID
#define RFID_SS   16
#define RFID_RST  17
// SCK = 18, MOSI = 23, MISO = 19 (shared SPI)

// MPU6050 (I2C)
#define MPU_SDA   21
#define MPU_SCL   22
#define MPU_ADDR  0x68

// Joystick (mounted sideways - axes corrected below)
#define JOY_X_PIN 34
#define JOY_Y_PIN 35
#define JOY_SW    33

// Buttons (active LOW with internal pullup)
#define BTN_SELECT  25
#define BTN_BACK    26
#define BTN_MAP     14
#define BTN_JOURNAL 32

// LEDs
#define LED_GREEN 13
#define LED_RED   15

// Buzzer
#define BUZZER_PIN 2

// =========================
// CONSTANTS
// =========================

#define SERIAL_BAUD       115200
#define JOYSTICK_DEADZONE 300
#define JOYSTICK_CENTER   2048
#define JOYSTICK_SEND_MS  50
#define BUTTON_DEBOUNCE   50
#define SHAKE_THRESHOLD   15000
#define SHAKE_COOLDOWN    2000
#define RFID_CHECK_MS     500
#define DISPLAY_UPDATE_MS 1000
#define SERIAL_TIMEOUT_MS 5000

// =========================
// OBJECTS
// =========================

Adafruit_ST7735 tft = Adafruit_ST7735(TFT_CS, TFT_DC, TFT_RST);
MFRC522 rfid(RFID_SS, RFID_RST);

// =========================
// STATE
// =========================

// Button states
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

// Joystick state & calibrated neutral centers
int joyX = JOYSTICK_CENTER;
int joyY = JOYSTICK_CENTER;
int centerRawX = JOYSTICK_CENTER;
int centerRawY = JOYSTICK_CENTER;
float filteredRawX = (float)JOYSTICK_CENTER;
float filteredRawY = (float)JOYSTICK_CENTER;
bool joystickAtCenter = true;
unsigned long lastJoystickSend = 0;

// MPU6050
int16_t accelX, accelY, accelZ;
unsigned long lastShakeTime = 0;

// RFID
unsigned long lastRfidCheck = 0;
String lastRfidUid = "";
unsigned long lastRfidTime = 0;

// Display
unsigned long lastDisplayUpdate = 0;
bool browserConnected = false;
unsigned long lastSerialReceive = 0;

// Status
String statusLine1 = "ESPANA EXPLORER";
String statusLine2 = "Controller Ready";
int displayPage = 0;

// LED states
bool greenLedState = false;
bool redLedState = false;

// =========================
// JOYSTICK CALIBRATION
// =========================

void calibrateJoystick() {
  long sumX = 0;
  long sumY = 0;
  const int CAL_SAMPLES = 64;
  for (int i = 0; i < CAL_SAMPLES; i++) {
    sumX += analogRead(JOY_X_PIN);
    sumY += analogRead(JOY_Y_PIN);
    delay(5);
  }
  centerRawX = sumX / CAL_SAMPLES;
  centerRawY = sumY / CAL_SAMPLES;

  // Guard against extreme floating readings
  if (centerRawX < 400 || centerRawX > 3700) centerRawX = JOYSTICK_CENTER;
  if (centerRawY < 400 || centerRawY > 3700) centerRawY = JOYSTICK_CENTER;

  filteredRawX = (float)centerRawX;
  filteredRawY = (float)centerRawY;
}

// =========================
// SETUP
// =========================

void setup() {
  Serial.begin(SERIAL_BAUD);
  
  // Initialize pins
  for (int i = 0; i < NUM_BUTTONS; i++) {
    pinMode(buttons[i].pin, INPUT_PULLUP);
  }
  
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_RED, LOW);
  digitalWrite(BUZZER_PIN, LOW);
  
  // Initialize I2C for MPU6050
  Wire.begin(MPU_SDA, MPU_SCL);
  
  // Initialize SPI devices
  SPI.begin(18, 19, 23); // SCK, MISO, MOSI
  
  // Initialize TFT
  tft.initR(INITR_BLACKTAB);
  tft.setRotation(1); // Landscape
  tft.fillScreen(ST77XX_BLACK);
  tft.setTextColor(ST77XX_WHITE);
  tft.setTextSize(1);
  
  // Show splash screen
  showSplashScreen();
  
  // Calibrate neutral joystick readings (auto-zero while untouched)
  calibrateJoystick();

  // Initialize RFID
  rfid.PCD_Init();
  delay(100);
  
  // Initialize MPU6050
  initMPU6050();
  
  // Startup feedback
  playTone(1000, 100);
  delay(100);
  playTone(1500, 100);
  
  digitalWrite(LED_GREEN, HIGH);
  delay(500);
  digitalWrite(LED_GREEN, LOW);
  
  // Show ready screen
  showReadyScreen();
}

// =========================
// MAIN LOOP
// =========================

void loop() {
  unsigned long now = millis();
  
  // Read buttons (on state transitions only)
  readButtons(now);
  
  // Read joystick
  readJoystick(now);
  
  // Read MPU6050 / detect shake
  readAccelerometer(now);
  
  // Check RFID
  if (now - lastRfidCheck >= RFID_CHECK_MS) {
    lastRfidCheck = now;
    checkRFID();
  }
  
  // Read incoming serial commands
  readSerialCommands();
  
  // Update connection status
  if (lastSerialReceive > 0 && now - lastSerialReceive > SERIAL_TIMEOUT_MS) {
    if (browserConnected) {
      browserConnected = false;
      statusLine2 = "Disconnected";
      updateDisplay(now);
    }
  }
  
  // Update display periodically
  if (now - lastDisplayUpdate >= DISPLAY_UPDATE_MS) {
    lastDisplayUpdate = now;
    updateDisplay(now);
  }
  
  // Small delay to prevent watchdog issues
  delay(1);
}

// =========================
// BUTTON READING
// =========================

void readButtons(unsigned long now) {
  for (int i = 0; i < NUM_BUTTONS; i++) {
    bool reading = digitalRead(buttons[i].pin);
    
    if (reading != buttons[i].lastState) {
      buttons[i].lastDebounce = now;
    }
    
    if (now - buttons[i].lastDebounce > BUTTON_DEBOUNCE) {
      if (reading != buttons[i].currentState) {
        buttons[i].currentState = reading;
        
        // Emit on press (HIGH -> LOW transition for pullup buttons)
        if (buttons[i].currentState == LOW) {
          sendButtonEvent(buttons[i].name);
          
          // Visual feedback
          digitalWrite(LED_GREEN, HIGH);
          playTone(800, 30);
          delay(30);
          digitalWrite(LED_GREEN, greenLedState ? HIGH : LOW);
        }
      }
    }
    
    buttons[i].lastState = reading;
  }
}

// =========================
// JOYSTICK READING
// =========================

void readJoystick(unsigned long now) {
  if (now - lastJoystickSend < JOYSTICK_SEND_MS) return;
  
  // Read raw values
  int rawX = analogRead(JOY_X_PIN);
  int rawY = analogRead(JOY_Y_PIN);
  
  // Exponential moving average filter to eliminate ADC jitter
  filteredRawX = filteredRawX * 0.75f + (float)rawX * 0.25f;
  filteredRawY = filteredRawY * 0.75f + (float)rawY * 0.25f;

  // Deviations from auto-calibrated neutral centers:
  // KY-023 mounted sideways with right side facing UP (rotated 90° CCW):
  // - Physical vertical (UP/DOWN) is on JOY_X_PIN (GPIO 34).
  //   Pushing UP moves toward module right side (rawX increases -> devV > 0).
  //   Game UP requires Y < 2048.
  //   Pushing DOWN moves toward module left side (rawX decreases -> devV < 0).
  //   Game DOWN requires Y > 2048.
  // - Physical horizontal (LEFT/RIGHT) is on JOY_Y_PIN (GPIO 35).
  //   Pushing RIGHT moves toward module bottom/pins (rawY decreases -> devH < 0).
  //   Game RIGHT requires X > 2048.
  //   Pushing LEFT moves toward module top (rawY increases -> devH > 0).
  //   Game LEFT requires X < 2048.
  float devV = filteredRawX - (float)centerRawX;
  float devH = filteredRawY - (float)centerRawY;

  bool inDeadzone = (abs(devV) < JOYSTICK_DEADZONE) && (abs(devH) < JOYSTICK_DEADZONE);

  if (!inDeadzone) {
    int outX = JOYSTICK_CENTER;
    int outY = JOYSTICK_CENTER;
    float maxRange = (float)(JOYSTICK_CENTER - JOYSTICK_DEADZONE);

    // Compute outX from devH:
    if (abs(devH) > JOYSTICK_DEADZONE) {
      float magH = abs(devH) - JOYSTICK_DEADZONE;
      float normH = (magH / maxRange) * JOYSTICK_CENTER;
      if (normH > JOYSTICK_CENTER) normH = JOYSTICK_CENTER;
      // devH > 0 is physical LEFT (outX < 2048), devH < 0 is physical RIGHT (outX > 2048)
      outX = (devH > 0) ? (JOYSTICK_CENTER - (int)normH) : (JOYSTICK_CENTER + (int)normH);
    }

    // Compute outY from devV:
    if (abs(devV) > JOYSTICK_DEADZONE) {
      float magV = abs(devV) - JOYSTICK_DEADZONE;
      float normV = (magV / maxRange) * JOYSTICK_CENTER;
      if (normV > JOYSTICK_CENTER) normV = JOYSTICK_CENTER;
      // devV > 0 is physical UP (outY < 2048), devV < 0 is physical DOWN (outY > 2048)
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
    // Send center position once when returning to center deadzone
    joyX = JOYSTICK_CENTER;
    joyY = JOYSTICK_CENTER;
    joystickAtCenter = true;
    sendJoystickEvent(JOYSTICK_CENTER, JOYSTICK_CENTER);
    lastJoystickSend = now;
  }
}

// =========================
// ACCELEROMETER (MPU6050)
// =========================

void initMPU6050() {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B); // PWR_MGMT_1
  Wire.write(0);    // Wake up
  Wire.endTransmission(true);
  
  // Set accelerometer range to ±8g
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x1C); // ACCEL_CONFIG
  Wire.write(0x10); // ±8g
  Wire.endTransmission(true);
}

void readAccelerometer(unsigned long now) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B); // ACCEL_XOUT_H
  Wire.endTransmission(false);
  Wire.requestFrom((uint8_t)MPU_ADDR, (uint8_t)6, (uint8_t)true);
  
  if (Wire.available() >= 6) {
    accelX = (Wire.read() << 8) | Wire.read();
    accelY = (Wire.read() << 8) | Wire.read();
    accelZ = (Wire.read() << 8) | Wire.read();
    
    // Shake detection
    int totalAccel = abs(accelX) + abs(accelY) + abs(accelZ);
    
    if (totalAccel > SHAKE_THRESHOLD && (now - lastShakeTime > SHAKE_COOLDOWN)) {
      lastShakeTime = now;
      sendShakeEvent();
      
      // Feedback
      playTone(1200, 50);
      digitalWrite(LED_RED, HIGH);
      delay(50);
      digitalWrite(LED_RED, redLedState ? HIGH : LOW);
    }
  }
}

// =========================
// RFID READING
// =========================

void checkRFID() {
  if (!rfid.PICC_IsNewCardPresent()) return;
  if (!rfid.PICC_ReadCardSerial()) return;
  
  // Build UID string
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (i > 0) uid += " ";
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  
  // Prevent rapid re-reads of the same card
  unsigned long now = millis();
  if (uid == lastRfidUid && (now - lastRfidTime) < 3000) {
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
    return;
  }
  
  lastRfidUid = uid;
  lastRfidTime = now;
  
  sendRfidEvent(uid);
  
  // Feedback
  playTone(1500, 100);
  delay(50);
  playTone(2000, 100);
  
  digitalWrite(LED_GREEN, HIGH);
  delay(200);
  digitalWrite(LED_GREEN, greenLedState ? HIGH : LOW);
  
  // Update display
  statusLine2 = "Card: " + uid;
  
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

// =========================
// SERIAL COMMUNICATION
// =========================

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

void sendShakeEvent() {
  StaticJsonDocument<64> doc;
  doc["type"] = "gesture";
  doc["name"] = "SHAKE";
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
      statusLine2 = "Connected!";
      playTone(1000, 50);
      delay(50);
      playTone(1500, 50);
    }
    
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, line);
    
    if (error) {
      continue; // Ignore malformed commands
    }
    
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
    else if (strcmp(type, "display") == 0) {
      const char* line1 = doc["line1"];
      const char* line2 = doc["line2"];
      
      if (line1) statusLine1 = String(line1);
      if (line2) statusLine2 = String(line2);
      
      updateDisplay(millis());
    }
  }
}

// =========================
// DISPLAY
// =========================

void showSplashScreen() {
  tft.fillScreen(ST77XX_BLACK);
  
  // Title
  tft.setTextSize(2);
  tft.setTextColor(0xFD20); // Gold color
  tft.setCursor(20, 20);
  tft.print("ESPANA");
  
  tft.setCursor(14, 45);
  tft.setTextColor(ST77XX_WHITE);
  tft.print("EXPLORER");
  
  // Divider
  tft.drawFastHLine(10, 70, 140, 0xFD20);
  
  // Subtitle
  tft.setTextSize(1);
  tft.setTextColor(0x7BEF); // Light gray
  tft.setCursor(15, 80);
  tft.print("Controller v1.0");
  
  tft.setCursor(15, 95);
  tft.print("Initializing...");
  
  delay(1500);
}

void showReadyScreen() {
  tft.fillScreen(ST77XX_BLACK);
  updateDisplay(millis());
}

void updateDisplay(unsigned long now) {
  // Header bar
  tft.fillRect(0, 0, 160, 16, 0x18C3); // Dark blue
  tft.setTextSize(1);
  tft.setTextColor(0xFD20); // Gold
  tft.setCursor(4, 4);
  tft.print("ESPANA EXPLORER");
  
  // Connection status
  tft.fillRect(0, 18, 160, 12, ST77XX_BLACK);
  tft.setCursor(4, 20);
  if (browserConnected) {
    tft.setTextColor(0x07E0); // Green
    tft.print(">> Connected");
  } else {
    tft.setTextColor(0xF800); // Red
    tft.print("-- Waiting...");
  }
  
  // Status info
  tft.fillRect(0, 34, 160, 30, ST77XX_BLACK);
  tft.setTextColor(ST77XX_WHITE);
  tft.setCursor(4, 36);
  tft.print(statusLine1.substring(0, 25));
  tft.setCursor(4, 48);
  tft.setTextColor(0x7BEF);
  tft.print(statusLine2.substring(0, 25));
  
  // Joystick display
  tft.fillRect(0, 68, 160, 20, ST77XX_BLACK);
  tft.setTextColor(0xAEDC); // Light green
  tft.setCursor(4, 70);
  tft.print("Joy: ");
  tft.print(joyX);
  tft.print(",");
  tft.print(joyY);
  
  // Divider
  tft.drawFastHLine(4, 92, 152, 0x4208); // Dark gray
  
  // Button hints
  tft.fillRect(0, 96, 160, 32, ST77XX_BLACK);
  tft.setTextSize(1);
  tft.setTextColor(0x7BEF);
  tft.setCursor(4, 98);
  tft.print("SEL=Interact BACK=Cancel");
  tft.setCursor(4, 110);
  tft.print("MAP=WorldMap JRN=Notes");
  
  lastDisplayUpdate = now;
}

// =========================
// UTILITIES
// =========================

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
