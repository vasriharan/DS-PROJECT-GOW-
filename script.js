/**
 * GOD OF WAR: FATE'S MAZE
 * College DSA Project — Demonstrating the STACK Data Structure (LIFO) via Undo and Redo
 * 
 * Student: Sriharan V A
 * Class:   CSE A
 * Reg No:  RA2511003040029
 */

// ==========================================================================
// 1. DATA STRUCTURE: STACK IMPLEMENTATION
// ==========================================================================

/**
 * Standard Stack implementation adhering to LIFO (Last In, First Out) principle.
 */
class Stack {
  constructor(name) {
    this.name = name;
    this.items = [];
  }

  /**
   * PUSH: Adds a new GameState to the top of the stack.
   * Time Complexity: O(1)
   */
  push(element) {
    this.items.push(element);
  }

  /**
   * POP: Removes and returns the top GameState from the stack.
   * Time Complexity: O(1)
   */
  pop() {
    if (this.isEmpty()) return null;
    return this.items.pop();
  }

  /**
   * PEEK: Returns the top element without removing it.
   * Time Complexity: O(1)
   */
  peek() {
    if (this.isEmpty()) return null;
    return this.items[this.items.length - 1];
  }

  /**
   * Check if stack has 0 elements.
   */
  isEmpty() {
    return this.items.length === 0;
  }

  /**
   * Current number of elements in the stack.
   */
  size() {
    return this.items.length;
  }

  /**
   * Clear all elements from the stack.
   */
  clear() {
    this.items = [];
  }

  /**
   * Returns shallow clone array for rendering / inspection.
   */
  toArray() {
    return [...this.items];
  }
}

/**
 * GameState: Represents a complete snapshot of the game world at an instant.
 * Saved onto the Undo / Redo Stacks.
 */
class GameState {
  constructor({
    playerX,
    playerY,
    health,
    keyCollected,
    doorOpen,
    wolves,
    actionDesc,
    actionIcon,
    stepIndex
  }) {
    this.playerX = playerX;
    this.playerY = playerY;
    this.health = health;
    this.keyCollected = keyCollected;
    this.doorOpen = doorOpen;
    // Deep clone wolf states so enemy patrols restore deterministically
    this.wolves = wolves ? wolves.map(w => ({ ...w })) : [];
    this.actionDesc = actionDesc || 'INITIAL STATE';
    this.actionIcon = actionIcon || '⚔️';
    this.stepIndex = stepIndex || 0;
    this.timestamp = new Date().toLocaleTimeString();
  }
}

// ==========================================================================
// 2. AUDIO SYNTHESIZER (Pure Web Audio API — No External Files Needed)
// ==========================================================================
class SoundSynth {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.ambientGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.startAmbient();
      }
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startAmbient() {
    if (!this.ctx || this.muted) return;
    try {
      // Very soft, low-frequency atmospheric drone representing Norse frozen winds
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      this.ambientGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, this.ctx.currentTime);

      this.ambientGain.gain.setValueAtTime(0.015, this.ctx.currentTime); // Very quiet

      osc.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);
      osc.start();
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.muted ? 0 : 0.015, this.ctx.currentTime);
    }
    return this.muted;
  }

  playFootstep() {
    if (!this.ctx || this.muted) return;
    try {
      // Cheerful subtle alternating micro-step / cartoon bounce
      this.stepPitchCount = (this.stepPitchCount || 0) + 1;
      const baseFreq = (this.stepPitchCount % 2 === 0) ? 320 : 365;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.055);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (e) {}
  }

  playPush() {
    if (!this.ctx || this.muted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  playUndo() {
    if (!this.ctx || this.muted) return;
    try {
      // Fun retro reverse-boop slide (rewind sound)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(560, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(210, this.ctx.currentTime + 0.14);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {}
  }

  playRedo() {
    if (!this.ctx || this.muted) return;
    try {
      // Fun springy forward-zip slide
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(580, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch (e) {}
  }

  playPop() {
    // Alias for playUndo
    this.playUndo();
  }

  playKey() {
    if (!this.ctx || this.muted) return;
    try {
      // Lively sparkling celebration arpeggio (C5 -> E5 -> G5 -> C6)
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.05);

        gain.gain.setValueAtTime(0.07, this.ctx.currentTime + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.05 + 0.32);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.05);
        osc.stop(this.ctx.currentTime + i * 0.05 + 0.33);
      });
    } catch (e) {}
  }

  playDoorOpen() {
    if (!this.ctx || this.muted) return;
    try {
      // Cheerful unlatch click followed by magical rising whoosh
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.08);
      gain1.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start();
      osc1.stop(this.ctx.currentTime + 0.09);

      // Rising whoosh
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(320, this.ctx.currentTime + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(740, this.ctx.currentTime + 0.22);
      gain2.gain.setValueAtTime(0.06, this.ctx.currentTime + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(this.ctx.currentTime + 0.05);
      osc2.stop(this.ctx.currentTime + 0.23);
    } catch (e) {}
  }

  playBonk() {
    if (!this.ctx || this.muted) return;
    try {
      // Lighthearted cartoonish "bonk" / "boof" (springy rubbery bounce)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(85, this.ctx.currentTime + 0.16);

      gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.17);
    } catch (e) {}
  }

  playHit() {
    this.playBonk();
  }

  playVictory() {
    if (!this.ctx || this.muted) return;
    try {
      // Cheerful triumphant fanfare chord (C4, E4, G4, C5)
      [261.63, 329.63, 392.00, 523.25, 659.25].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.55);
      });
    } catch (e) {}
  }
}

// ==========================================================================
// 3. MAZE DEFINITIONS & CONSTANTS
// ==========================================================================

const COLS = 15;
const ROWS = 10;
const TILE_SIZE = 50; // 750 / 15 = 50, 500 / 10 = 50

// Grid values:
// 0 = Open path (Snow-covered dark stone floor)
// 1 = Stone wall with snow caps
// 2 = Runic Locked Door
const MAZE_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Row 0
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // Row 1 (Start at 1,1; Key at 13,1)
  [1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1], // Row 2 (Walkable 2,2 for test sequence)
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1], // Row 3
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1], // Row 4
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1], // Row 5
  [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1], // Row 6
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1], // Row 7
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 2, 0, 0, 0, 1], // Row 8 (Door at 10,8; Thor at 13,8)
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // Row 9
];

const START_POS = { x: 1, y: 1 };
const KEY_POS = { x: 13, y: 1 };
const DOOR_POS = { x: 10, y: 8 };
const THOR_POS = { x: 13, y: 8 };

// Initial Wolves: 3 simple patrolling wolves
const INITIAL_WOLVES = [
  { id: 1, x: 6, y: 3, dir: 1, minX: 4, maxX: 7, axis: 'x' },  // Patrols row 3 horizontally
  { id: 2, x: 8, y: 5, dir: 1, minX: 7, maxX: 10, axis: 'x' }, // Patrols row 5 horizontally
  { id: 3, x: 3, y: 7, dir: 1, minX: 2, maxX: 5, axis: 'x' }   // Patrols row 7 horizontally
];

// ==========================================================================
// 4. GAME ENGINE & DSA STACK COORDINATOR
// ==========================================================================

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.sound = new SoundSynth();

    // Two Stacks — the core DSA requirement
    this.undoStack = new Stack('Undo Stack');
    this.redoStack = new Stack('Redo Stack');

    // Live Game State variables
    this.playerX = START_POS.x;
    this.playerY = START_POS.y;
    this.playerFacing = 'right'; // 'left' or 'right'
    this.health = 3;
    this.keyCollected = false;
    this.doorOpen = false;
    this.wolves = INITIAL_WOLVES.map(w => ({ ...w }));
    this.stepIndex = 0;
    this.isGameOver = false;
    this.isVictory = false;

    // Visual effect states
    this.screenShakeTime = 0;
    this.hitFlashTime = 0;
    this.snowflakes = this.initSnowflakes(35);
    this.lastFrameTime = performance.now();
    this.doorGlow = 0;

    // Cache DOM Elements
    this.initDomReferences();

    // Bind event listeners
    this.bindEvents();

    // Push initial starting state to log
    this.logOperation('info', 'Maze initialized. Ready for demonstration.');
    this.updateUI();

    // Start 60fps render loop
    requestAnimationFrame(this.renderLoop.bind(this));
  }

  initDomReferences() {
    this.heartsEl = document.getElementById('hearts-container');
    this.keyBadge = document.getElementById('key-badge');
    this.keyText = document.getElementById('key-text');
    this.doorBadge = document.getElementById('door-badge');
    this.doorText = document.getElementById('door-text');
    this.btnAudio = document.getElementById('btn-audio');
    this.audioIcon = document.getElementById('audio-icon');

    this.toastEl = document.getElementById('game-toast');
    this.toastMsg = document.getElementById('toast-msg');
    this.toastIcon = document.getElementById('toast-icon');

    this.btnUndo = document.getElementById('btn-undo');
    this.btnRedo = document.getElementById('btn-redo');
    this.btnRestart = document.getElementById('btn-restart');
    this.btnRunTest = document.getElementById('btn-run-test');
    this.btnInspectState = document.getElementById('btn-inspect-state');

    this.undoSizeBadge = document.getElementById('undo-size-badge');
    this.redoSizeBadge = document.getElementById('redo-size-badge');
    this.undoItemsContainer = document.getElementById('undo-items-container');
    this.redoItemsContainer = document.getElementById('redo-items-container');

    this.liveOpName = document.getElementById('live-op-name');
    this.logFeed = document.getElementById('log-feed');
    this.btnClearLog = document.getElementById('btn-clear-log');

    // Modals
    this.modalBackdrop = document.getElementById('game-modal');
    this.modalCard = document.getElementById('modal-card');
    this.modalRune = document.getElementById('modal-rune');
    this.modalTitle = document.getElementById('modal-title');
    this.modalQuote = document.getElementById('modal-quote');
    this.modalDesc = document.getElementById('modal-desc');
    this.modalBtnPrimary = document.getElementById('modal-btn-primary');
    this.modalBtnUndo = document.getElementById('modal-btn-undo');

    this.inspectorModal = document.getElementById('inspector-modal');
    this.stateJsonDisplay = document.getElementById('state-json-display');
    this.btnCloseInspector = document.getElementById('btn-close-inspector');

    // Dialogue Elements
    this.dialogueEl = document.getElementById('game-dialogue');
    this.dialogueAvatar = document.getElementById('dialogue-avatar');
    this.dialogueSpeaker = document.getElementById('dialogue-speaker');
    this.dialogueText = document.getElementById('dialogue-text');
    this.nearThorDialogueShown = false;

    // C Algorithm Modal Elements
    this.btnCAlgorithm = document.getElementById('btn-c-algorithm');
    this.cAlgoModal = document.getElementById('c-algo-modal');
    this.btnCloseCAlgo = document.getElementById('btn-close-c-algo');
    this.btnCopyCCode = document.getElementById('btn-copy-c-code');
    this.cCodeDisplay = document.getElementById('c-code-display');
  }

  bindEvents() {
    // Keyboard inputs
    window.addEventListener('keydown', (e) => {
      // Audio context needs a user gesture to start
      this.sound.init();

      if (this.isVictory) return;

      const key = e.key.toUpperCase();
      if (key === 'W' || key === 'ARROWUP') {
        e.preventDefault();
        this.attemptMove(0, -1, 'MOVE UP', '▲');
      } else if (key === 'S' || key === 'ARROWDOWN') {
        e.preventDefault();
        this.attemptMove(0, 1, 'MOVE DOWN', '▼');
      } else if (key === 'A' || key === 'ARROWLEFT') {
        e.preventDefault();
        this.attemptMove(-1, 0, 'MOVE LEFT', '◀');
      } else if (key === 'D' || key === 'ARROWRIGHT') {
        e.preventDefault();
        this.attemptMove(1, 0, 'MOVE RIGHT', '▶');
      } else if (key === 'Z') {
        e.preventDefault();
        this.undo();
      } else if (key === 'Y') {
        e.preventDefault();
        this.redo();
      } else if (key === 'R') {
        e.preventDefault();
        this.restart();
      }
    });

    // Control Toolbar Buttons
    this.btnUndo.addEventListener('click', () => { this.sound.init(); this.undo(); });
    this.btnRedo.addEventListener('click', () => { this.sound.init(); this.redo(); });
    this.btnRestart.addEventListener('click', () => { this.sound.init(); this.restart(); });
    this.btnRunTest.addEventListener('click', () => { this.sound.init(); this.runTestSequence(); });
    this.btnInspectState.addEventListener('click', () => { this.showStateInspector(); });
    this.btnCloseInspector.addEventListener('click', () => { this.inspectorModal.classList.add('hidden'); });

    // Audio Toggle
    this.btnAudio.addEventListener('click', () => {
      this.sound.init();
      const isMuted = this.sound.toggleMute();
      this.audioIcon.textContent = isMuted ? '🔇' : '🔊';
      this.showToast(isMuted ? 'Audio Muted' : 'Audio Active', '🔊');
    });

    // Virtual D-pad
    document.querySelectorAll('.dpad-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.sound.init();
        const dir = btn.getAttribute('data-dir');
        if (dir === 'UP') this.attemptMove(0, -1, 'MOVE UP', '▲');
        if (dir === 'DOWN') this.attemptMove(0, 1, 'MOVE DOWN', '▼');
        if (dir === 'LEFT') this.attemptMove(-1, 0, 'MOVE LEFT', '◀');
        if (dir === 'RIGHT') this.attemptMove(1, 0, 'MOVE RIGHT', '▶');
      });
    });

    // Modal buttons
    this.modalBtnPrimary.addEventListener('click', () => {
      this.modalBackdrop.classList.add('hidden');
      this.restart();
    });
    this.modalBtnUndo.addEventListener('click', () => {
      this.modalBackdrop.classList.add('hidden');
      this.undo();
    });

    // Clear log
    this.btnClearLog.addEventListener('click', () => {
      this.logFeed.innerHTML = '';
      this.logOperation('info', 'Trace log cleared.');
    });

    // C Algorithm Modal Events
    if (this.btnCAlgorithm) {
      this.btnCAlgorithm.addEventListener('click', () => {
        this.sound.init();
        this.cAlgoModal.classList.remove('hidden');
      });
    }

    if (this.btnCloseCAlgo) {
      this.btnCloseCAlgo.addEventListener('click', () => {
        this.cAlgoModal.classList.add('hidden');
      });
    }

    if (this.cAlgoModal) {
      this.cAlgoModal.addEventListener('click', (e) => {
        if (e.target === this.cAlgoModal) {
          this.cAlgoModal.classList.add('hidden');
        }
      });
    }

    if (this.btnCopyCCode) {
      this.btnCopyCCode.addEventListener('click', () => {
        const codeText = this.cCodeDisplay.textContent;
        navigator.clipboard.writeText(codeText).then(() => {
          const originalText = this.btnCopyCCode.textContent;
          this.btnCopyCCode.textContent = '✓ Copied to Clipboard!';
          this.btnCopyCCode.style.color = '#80deea';
          setTimeout(() => {
            this.btnCopyCCode.textContent = originalText;
            this.btnCopyCCode.style.color = '';
          }, 2000);
        }).catch(() => {
          this.showToast('Copied to Clipboard!', '📋');
        });
      });
    }

    // Trigger initial Kratos dialogue on start
    setTimeout(() => {
      this.triggerDialogue('KRATOS', '🪓', 'I need to find the key.', false);
    }, 600);
  }

  /**
   * Natural, non-intrusive dialogue prompt between Kratos and Thor.
   */
  triggerDialogue(speaker, avatar, message, isThor = false, durationMs = 3400) {
    if (!this.dialogueEl) return;
    this.dialogueSpeaker.textContent = speaker;
    this.dialogueAvatar.textContent = avatar;
    this.dialogueText.textContent = `"${message}"`;

    if (isThor) {
      this.dialogueEl.classList.add('thor');
    } else {
      this.dialogueEl.classList.remove('thor');
    }

    this.dialogueEl.classList.remove('hidden');

    clearTimeout(this.dialogueTimer);
    this.dialogueTimer = setTimeout(() => {
      this.dialogueEl.classList.add('hidden');
    }, durationMs);
  }

  // ========================================================================
  // 5. STACK OPERATIONS: PUSH, POP, UNDO, REDO
  // ========================================================================

  /**
   * Captures current game state as a GameState object.
   */
  captureCurrentState(actionDesc = 'STATE', actionIcon = '•') {
    return new GameState({
      playerX: this.playerX,
      playerY: this.playerY,
      health: this.health,
      keyCollected: this.keyCollected,
      doorOpen: this.doorOpen,
      wolves: this.wolves,
      actionDesc: actionDesc,
      actionIcon: actionIcon,
      stepIndex: this.stepIndex
    });
  }

  /**
   * Restores a given GameState snapshot into active variables.
   */
  restoreState(state) {
    if (!state) return;
    this.playerX = state.playerX;
    this.playerY = state.playerY;
    this.health = state.health;
    this.keyCollected = state.keyCollected;
    this.doorOpen = state.doorOpen;
    this.wolves = state.wolves.map(w => ({ ...w }));
    this.stepIndex = state.stepIndex;

    // Reset game over if player undid out of death
    if (this.health > 0 && this.isGameOver) {
      this.isGameOver = false;
      this.modalBackdrop.classList.add('hidden');
    }
  }

  /**
   * Handles player attempt to move in direction (dx, dy).
   * Validates collisions, locked doors, saves previous state to Undo Stack,
   * clears Redo Stack, steps wolves, checks pickups and hazards.
   */
  attemptMove(dx, dy, actionDesc, actionIcon) {
    if (this.isGameOver || this.isVictory) return false;

    const nextX = this.playerX + dx;
    const nextY = this.playerY + dy;

    // Check maze boundaries
    if (nextX < 0 || nextX >= COLS || nextY < 0 || nextY >= ROWS) {
      return false;
    }

    const tile = MAZE_MAP[nextY][nextX];

    // Stone wall collision
    if (tile === 1) {
      return false;
    }

    // Locked Runic Door collision
    if (tile === 2 && !this.doorOpen) {
      if (!this.keyCollected) {
        this.showToast('Find the key first.', '🔒', 'danger');
        this.triggerDialogue('KRATOS', '🪓', 'Find the key first... it must be around here.', false);
        this.sound.playFootstep();
        return false;
      } else {
        // Player has the key! Door unlocks!
        this.doorOpen = true;
        this.showToast('Runic Door Unlocked!', '🔓', 'gold');
        this.triggerDialogue('KRATOS', '🪓', 'The path opens. Thor awaits.', false);
        this.sound.playDoorOpen();
      }
    }

    // Direction facing
    if (dx > 0) this.playerFacing = 'right';
    if (dx < 0) this.playerFacing = 'left';

    // ----------------------------------------------------------------------
    // DSA STACK RULE 1:
    // When the player performs a valid move:
    // 1. Save current state.
    // 2. Push it into undoStack.
    // 3. Clear redoStack.
    // 4. Perform the new move.
    // ----------------------------------------------------------------------

    const stateBeforeMove = this.captureCurrentState(actionDesc, actionIcon);

    // 1 & 2. Push state to Undo Stack
    this.undoStack.push(stateBeforeMove);
    this.sound.playPush();

    // 3. Clear Redo Stack if it had items
    let redoClearedNotice = false;
    if (this.redoStack.size() > 0) {
      const discardedCount = this.redoStack.size();
      this.redoStack.clear();
      redoClearedNotice = true;
      this.logOperation('clear', `NEW ACTION → REDO STACK CLEARED (${discardedCount} item${discardedCount > 1 ? 's' : ''} discarded)`);
      this.showToast('NEW ACTION → REDO STACK CLEARED', '⚡', 'gold');
    }

    // 4. Perform new move
    this.playerX = nextX;
    this.playerY = nextY;
    this.stepIndex++;

    this.sound.playFootstep();

    // Set Live Op display
    this.setLiveOp(`PUSH (${actionDesc})`, 'push');
    this.logOperation('push', `PUSH → Saved state #${stateBeforeMove.stepIndex} into Undo Stack (x:${stateBeforeMove.playerX}, y:${stateBeforeMove.playerY})`);

    // Step Wolves (Turn-based deterministic patrol)
    this.stepWolves();

    // Check hazards: Wolves collision
    this.checkWolfCollisions();

    // Check Key Pickup
    if (!this.keyCollected && this.playerX === KEY_POS.x && this.playerY === KEY_POS.y) {
      this.keyCollected = true;
      this.showToast('KEY COLLECTED', '🔑', 'gold');
      this.triggerDialogue('KRATOS', '🪓', 'This should open the door.', false);
      this.sound.playKey();
      this.logOperation('info', '🔑 Rune Key collected! Runic gate can now be unlocked.');
    }

    // Near Thor dialogue trigger (when stepping into final corridor)
    if (!this.nearThorDialogueShown && this.playerX >= 11 && this.playerY === 8) {
      this.nearThorDialogueShown = true;
      this.triggerDialogue('THOR', '⚡', 'You made it.', true);
    }

    // Check Victory (Thor reached)
    if (this.playerX === THOR_POS.x && this.playerY === THOR_POS.y) {
      this.triggerVictory();
    }

    // Refresh UI & Stacks
    this.updateUI();
    return true;
  }

  /**
   * UNDO OPERATION
   * 1. Check whether undoStack is empty.
   * 2. Save current state into redoStack.
   * 3. POP top state from undoStack.
   * 4. Restore that state.
   */
  undo() {
    if (this.undoStack.isEmpty()) {
      this.showToast('Undo Stack is Empty!', 'ℹ️');
      this.logOperation('info', 'UNDO attempted, but Undo Stack is EMPTY (Underflow guard)');
      return false;
    }

    // 2. Save current state into redoStack
    const currentState = this.captureCurrentState(`BEFORE UNDO #${this.stepIndex}`, '↺');
    this.redoStack.push(currentState);

    // 3. POP top state from undoStack
    const previousState = this.undoStack.pop();

    // 4. Restore that state
    this.restoreState(previousState);

    this.sound.playUndo();
    this.setLiveOp('UNDO → POP', 'pop');
    this.logOperation('pop', `UNDO → POP: Restored to state #${previousState.stepIndex} (x:${previousState.playerX}, y:${previousState.playerY}). Pushed previous to Redo Stack.`);
    this.showToast('UNDO → POP', '↺');

    this.updateUI();
    return true;
  }

  /**
   * REDO OPERATION
   * 1. Check whether redoStack is empty.
   * 2. Save current state into undoStack.
   * 3. POP top state from redoStack.
   * 4. Restore that state.
   */
  redo() {
    if (this.redoStack.isEmpty()) {
      this.showToast('Redo Stack is Empty!', 'ℹ️');
      this.logOperation('info', 'REDO attempted, but Redo Stack is EMPTY');
      return false;
    }

    // 2. Save current state into undoStack
    const currentState = this.captureCurrentState(`BEFORE REDO #${this.stepIndex}`, '↻');
    this.undoStack.push(currentState);

    // 3. POP top state from redoStack
    const nextState = this.redoStack.pop();

    // 4. Restore that state
    this.restoreState(nextState);

    this.sound.playRedo();
    this.setLiveOp('REDO → POP', 'push');
    this.logOperation('pop', `REDO → POP: Restored forward to state #${nextState.stepIndex} (x:${nextState.playerX}, y:${nextState.playerY}).`);
    this.showToast('REDO → POP', '↻');

    this.updateUI();
    return true;
  }

  /**
   * RESTART
   * Resets maze, Kratos, HP, keys, and clears both stacks.
   */
  restart() {
    this.playerX = START_POS.x;
    this.playerY = START_POS.y;
    this.playerFacing = 'right';
    this.health = 3;
    this.keyCollected = false;
    this.doorOpen = false;
    this.wolves = INITIAL_WOLVES.map(w => ({ ...w }));
    this.stepIndex = 0;
    this.isGameOver = false;
    this.isVictory = false;
    this.nearThorDialogueShown = false;

    this.undoStack.clear();
    this.redoStack.clear();

    this.modalBackdrop.classList.add('hidden');
    this.setLiveOp('RESET / CLEARED', 'clear');
    this.logOperation('info', 'RESTART: Player reset to starting point. Both Undo and Redo Stacks cleared.');
    this.showToast('GAME RESTARTED', '⟲');

    setTimeout(() => {
      this.triggerDialogue('KRATOS', '🪓', 'I need to find the key.', false);
    }, 500);

    this.updateUI();
  }

  // ========================================================================
  // 6. ENEMY / WOLVES LOGIC
  // ========================================================================

  /**
   * Turn-based patrol: Wolves advance 1 tile when Kratos moves.
   * This guarantees deterministic state restoration upon UNDO/REDO.
   */
  stepWolves() {
    this.wolves.forEach(wolf => {
      if (wolf.axis === 'x') {
        wolf.x += wolf.dir;
        if (wolf.x >= wolf.maxX) {
          wolf.x = wolf.maxX;
          wolf.dir = -1;
        } else if (wolf.x <= wolf.minX) {
          wolf.x = wolf.minX;
          wolf.dir = 1;
        }
      }
    });
  }

  checkWolfCollisions() {
    const collidedWolf = this.wolves.find(w => w.x === this.playerX && w.y === this.playerY);
    if (collidedWolf) {
      this.health = Math.max(0, this.health - 1);
      this.screenShakeTime = 12; // Frames of shake
      this.hitFlashTime = 15;   // Red hit flash
      this.sound.playBonk();
      this.showToast('OUCH! -1 HEALTH', '🐺', 'danger');
      this.triggerDialogue('KRATOS', '🪓', 'Just a scratch! I can Undo that.', false);
      this.logOperation('pop', `Wolf collision! Health decreased to ${this.health}/3. You can UNDO to reverse this!`);

      if (this.health <= 0) {
        this.triggerGameOver();
      }
    }
  }

  triggerGameOver() {
    this.isGameOver = true;
    this.modalCard.className = 'modal-card defeat';
    this.modalRune.textContent = 'ᛏ';
    this.modalTitle.textContent = 'KRATOS FALLS';
    this.modalQuote.textContent = '"Death can have me when it earns me."';
    this.modalDesc.textContent = 'Health dropped to zero. Use the UNDO button to reverse time and restore your state!';
    this.modalBtnPrimary.textContent = 'RESTART (R)';
    this.modalBtnUndo.classList.remove('hidden');
    this.modalBackdrop.classList.remove('hidden');
    this.logOperation('clear', 'KRATOS FALLS: Zero health reached. Undo is available.');
  }

  triggerVictory() {
    this.isVictory = true;
    this.sound.playVictory();
    this.triggerDialogue('THOR', '⚡', 'The path is complete.', true);
    this.modalCard.className = 'modal-card';
    this.modalRune.textContent = 'ᚦ';
    this.modalTitle.textContent = 'MISSION COMPLETE';
    this.modalQuote.textContent = '"YOU HAVE REACHED ME."';
    this.modalDesc.textContent = `Thor acknowledges your might! You navigated the frozen maze in ${this.stepIndex} steps using the power of the Stack data structure.`;
    this.modalBtnPrimary.textContent = 'PLAY AGAIN';
    this.modalBtnUndo.classList.add('hidden');
    this.modalBackdrop.classList.remove('hidden');
    this.logOperation('info', '🏆 MISSION COMPLETE: Thor reached! Maze solved successfully.');
  }

  // ========================================================================
  // 7. AUTOMATED TEST SEQUENCE (Requirement 24)
  // Sequence: RIGHT -> RIGHT -> DOWN -> LEFT -> UNDO -> UNDO -> REDO -> NEW MOVE
  // ========================================================================
  async runTestSequence() {
    if (this.testRunning) return;
    this.testRunning = true;
    this.btnRunTest.disabled = true;

    this.showToast('RUNNING DSA TEST SEQUENCE...', '⚡', 'gold');
    this.logOperation('info', '═══ STARTING DSA TEST SEQUENCE (Req #24) ═══');

    // 1. Restart to clean state first
    this.restart();
    await this.sleep(400);

    // Step 1: MOVE RIGHT
    this.attemptMove(1, 0, 'MOVE RIGHT', '▶');
    await this.sleep(450);

    // Step 2: MOVE RIGHT
    this.attemptMove(1, 0, 'MOVE RIGHT', '▶');
    await this.sleep(450);

    // Step 3: MOVE DOWN
    this.attemptMove(0, 1, 'MOVE DOWN', '▼');
    await this.sleep(450);

    // Step 4: MOVE LEFT
    this.attemptMove(-1, 0, 'MOVE LEFT', '◀');
    await this.sleep(550);

    // Step 5: UNDO (Left move undone, returns to 3,2)
    this.undo();
    await this.sleep(550);

    // Step 6: UNDO (Down move undone, returns to 3,1)
    this.undo();
    await this.sleep(550);

    // Step 7: REDO (Restores down move to 3,2)
    this.redo();
    await this.sleep(550);

    // Step 8: NEW MOVE (Move Down to 3,3 -> Clears Redo Stack!)
    this.attemptMove(0, 1, 'MOVE DOWN (NEW)', '▼');
    await this.sleep(400);

    this.logOperation('info', '═══ TEST SEQUENCE COMPLETE: All Stack Rules Verified! ═══');
    this.showToast('TEST SEQUENCE COMPLETE: ALL STACK RULES VERIFIED', '✓', 'gold');

    this.testRunning = false;
    this.btnRunTest.disabled = false;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ========================================================================
  // 8. UI & STACK VISUALIZATION RENDERING
  // ========================================================================

  updateUI() {
    // 1. Health Hearts
    for (let i = 1; i <= 3; i++) {
      const heartEl = document.getElementById(`heart-${i}`);
      if (heartEl) {
        if (i <= this.health) {
          heartEl.className = 'heart full';
          heartEl.textContent = '❤️';
        } else {
          heartEl.className = 'heart hit';
          heartEl.textContent = '🖤';
        }
      }
    }

    // 2. Key Status
    if (this.keyCollected) {
      this.keyBadge.className = 'key-status-badge found';
      this.keyText.textContent = 'OBTAINED';
    } else {
      this.keyBadge.className = 'key-status-badge not-found';
      this.keyText.textContent = 'NOT FOUND';
    }

    // 3. Door Status
    if (this.doorOpen) {
      this.doorBadge.className = 'door-status-badge unlocked';
      this.doorText.textContent = 'OPEN';
    } else {
      this.doorBadge.className = 'door-status-badge locked';
      this.doorText.textContent = 'LOCKED';
    }

    // 4. Button enabled states
    this.btnUndo.disabled = this.undoStack.isEmpty();
    this.btnRedo.disabled = this.redoStack.isEmpty();

    // 5. Render Stacks in Right Panel
    this.renderStackColumn(this.undoStack, this.undoItemsContainer, this.undoSizeBadge, 'undo');
    this.renderStackColumn(this.redoStack, this.redoItemsContainer, this.redoSizeBadge, 'redo');
  }

  renderStackColumn(stack, container, sizeBadge, type) {
    sizeBadge.textContent = `Size: ${stack.size()}`;
    container.innerHTML = '';

    if (stack.isEmpty()) {
      container.innerHTML = '<div class="stack-empty-placeholder">Stack is Empty</div>';
      return;
    }

    // In a stack, elements enter and exit from the TOP.
    // We display items from TOP (index = length - 1) down to BOTTOM (index = 0).
    const arr = stack.toArray();
    for (let i = arr.length - 1; i >= 0; i--) {
      const state = arr[i];
      const isTop = (i === arr.length - 1);

      const itemDiv = document.createElement('div');
      itemDiv.className = `stack-item ${isTop ? 'is-top' : ''}`;
      itemDiv.title = 'Click to inspect this GameState object';

      itemDiv.innerHTML = `
        <div class="item-row-top">
          <span class="item-action-icon">${state.actionIcon}</span>
          <span class="item-action-name">${state.actionDesc}</span>
        </div>
        <div class="item-row-details">
          <span>Pos: (${state.playerX}, ${state.playerY})</span>
          <span>HP: ${state.health}/3</span>
          <span>Key: ${state.keyCollected ? 'Yes' : 'No'}</span>
        </div>
      `;

      itemDiv.addEventListener('click', () => {
        this.showStateInspector(state, `${stack.name} [Index: ${i}] ${isTop ? '(TOP)' : ''}`);
      });

      container.appendChild(itemDiv);
    }
  }

  setLiveOp(text, type = 'push') {
    this.liveOpName.textContent = text;
    this.liveOpName.className = `op-name ${type}`;
  }

  logOperation(type, message) {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;

    const now = new Date();
    const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    entry.innerHTML = `
      <span class="log-time">${timeStr}</span>
      <span class="log-msg">${message}</span>
    `;

    this.logFeed.appendChild(entry);
    this.logFeed.scrollTop = this.logFeed.scrollHeight;
  }

  showToast(message, icon = '⚡', variant = '') {
    this.toastMsg.textContent = message;
    this.toastIcon.textContent = icon;
    this.toastEl.className = `game-toast ${variant}`;

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastEl.classList.add('hidden');
    }, 2400);
  }

  showStateInspector(targetState = null, label = 'ACTIVE GAMESTATE') {
    const stateObj = targetState || this.captureCurrentState('CURRENT FRAME', '•');
    this.stateJsonDisplay.textContent = JSON.stringify(stateObj, null, 2);
    document.querySelector('.inspector-header h3').textContent = label;
    this.inspectorModal.classList.remove('hidden');
  }

  // ========================================================================
  // 9. HIGH-DPI CANVAS RENDERING & NORSE GRAPHICS
  // ========================================================================

  initSnowflakes(count) {
    const flakes = [];
    for (let i = 0; i < count; i++) {
      flakes.push({
        x: Math.random() * 750,
        y: Math.random() * 500,
        radius: 1 + Math.random() * 2,
        speedY: 0.4 + Math.random() * 0.9,
        speedX: -0.3 + Math.random() * 0.6,
        alpha: 0.3 + Math.random() * 0.5
      });
    }
    return flakes;
  }

  renderLoop(timestamp) {
    const dt = (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;

    this.ctx.save();

    // Screen Shake effect on damage
    if (this.screenShakeTime > 0) {
      const shakeAmt = 4;
      const rx = (Math.random() - 0.5) * shakeAmt;
      const ry = (Math.random() - 0.5) * shakeAmt;
      this.ctx.translate(rx, ry);
      this.screenShakeTime--;
    }

    // Clear Canvas
    this.ctx.fillStyle = '#0a0e14';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw Maze Tiles (Floors and Walls)
    this.drawMazeTiles();

    // 2. Draw Key (if uncollected)
    if (!this.keyCollected) {
      this.drawRunicKey(KEY_POS.x * TILE_SIZE, KEY_POS.y * TILE_SIZE, timestamp);
    }

    // 3. Draw Door (Locked or Open)
    this.drawRunicDoor(DOOR_POS.x * TILE_SIZE, DOOR_POS.y * TILE_SIZE, timestamp);

    // 4. Draw Thor at the Final Sanctuary
    this.drawThor(THOR_POS.x * TILE_SIZE, THOR_POS.y * TILE_SIZE, timestamp);

    // 5. Draw Wolves
    this.wolves.forEach(wolf => {
      this.drawWolf(wolf.x * TILE_SIZE, wolf.y * TILE_SIZE, wolf.dir, timestamp);
    });

    // 6. Draw Kratos
    this.drawKratos(this.playerX * TILE_SIZE, this.playerY * TILE_SIZE, this.playerFacing);

    // 7. Ambient Drifting Snow Particles
    this.drawSnowflakes(dt);

    // 8. Hit Flash overlay
    if (this.hitFlashTime > 0) {
      this.ctx.fillStyle = `rgba(196, 30, 58, ${this.hitFlashTime / 30})`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.hitFlashTime--;
    }

    this.ctx.restore();

    requestAnimationFrame(this.renderLoop.bind(this));
  }

  drawMazeTiles() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;
        const tile = MAZE_MAP[r][c];

        if (tile === 1) {
          // Stone Wall with Snow Caps
          this.ctx.fillStyle = '#171f2b';
          this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

          // Brick pattern
          this.ctx.strokeStyle = '#101620';
          this.ctx.lineWidth = 1.5;
          this.ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);

          // Snow Frost Cap on top edge
          this.ctx.fillStyle = '#cfd8dc';
          this.ctx.fillRect(x, y, TILE_SIZE, 5);
          this.ctx.fillStyle = '#90a4ae';
          this.ctx.fillRect(x, y + 5, TILE_SIZE, 2);
        } else {
          // Floor (Dark slate flagstone with frost seams)
          this.ctx.fillStyle = '#0f151d';
          this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

          this.ctx.strokeStyle = '#141d28';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

          // Subtle start marker rune
          if (c === START_POS.x && r === START_POS.y) {
            this.ctx.font = '16px "Cinzel", serif';
            this.ctx.fillStyle = 'rgba(128, 222, 234, 0.25)';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('ᚱ', x + 25, y + 25);
          }
        }
      }
    }
  }

  drawRunicKey(x, y, t) {
    const bob = Math.sin(t / 250) * 3;
    const cx = x + 25;
    const cy = y + 25 + bob;

    // Glowing aura
    const grad = this.ctx.createRadialGradient(cx, cy, 4, cx, cy, 22);
    grad.addColorStop(0, 'rgba(255, 213, 79, 0.6)');
    grad.addColorStop(1, 'rgba(255, 213, 79, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    this.ctx.fill();

    // Key stem and head
    this.ctx.strokeStyle = '#ffd54f';
    this.ctx.fillStyle = '#ffb300';
    this.ctx.lineWidth = 3;

    // Bow (Ring)
    this.ctx.beginPath();
    this.ctx.arc(cx - 8, cy - 6, 6, 0, Math.PI * 2);
    this.ctx.stroke();

    // Stem
    this.ctx.beginPath();
    this.ctx.moveTo(cx - 3, cy - 2);
    this.ctx.lineTo(cx + 10, cy + 9);
    this.ctx.stroke();

    // Teeth
    this.ctx.beginPath();
    this.ctx.moveTo(cx + 6, cy + 5);
    this.ctx.lineTo(cx + 9, cy + 2);
    this.ctx.moveTo(cx + 9, cy + 8);
    this.ctx.lineTo(cx + 12, cy + 5);
    this.ctx.stroke();
  }

  drawRunicDoor(x, y, t) {
    if (this.doorOpen) {
      // Open Doorway: Glowing cyan mystic portal archway
      this.ctx.fillStyle = '#061622';
      this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

      this.ctx.strokeStyle = 'rgba(128, 222, 234, 0.7)';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x + 6, y + 4, TILE_SIZE - 12, TILE_SIZE - 4);

      this.ctx.font = '14px "Cinzel", serif';
      this.ctx.fillStyle = '#80deea';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('ᚦ', x + 25, y + 25);
    } else {
      // Locked Door: Heavy iron and timber
      this.ctx.fillStyle = '#261c14';
      this.ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);

      // Iron studs & bands
      this.ctx.fillStyle = '#37474f';
      this.ctx.fillRect(x + 4, y + 10, TILE_SIZE - 8, 5);
      this.ctx.fillRect(x + 4, y + 35, TILE_SIZE - 8, 5);

      // Padlock
      this.ctx.fillStyle = '#ef5350';
      this.ctx.fillRect(x + 20, y + 22, 10, 10);
      this.ctx.strokeStyle = '#cfd8dc';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(x + 25, y + 22, 4, Math.PI, 0);
      this.ctx.stroke();
    }
  }

  drawThor(x, y, t) {
    const cx = x + 25;
    const cy = y + 25;

    // Sanctuary glow (Norse lightning blue)
    const pulse = (Math.sin(t / 200) + 1) * 0.15 + 0.1;
    this.ctx.fillStyle = `rgba(128, 222, 234, ${pulse})`;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    this.ctx.fill();

    // Thor Cape (Crimson)
    this.ctx.fillStyle = '#b71c1c';
    this.ctx.beginPath();
    this.ctx.moveTo(cx - 10, cy - 6);
    this.ctx.lineTo(cx + 10, cy - 6);
    this.ctx.lineTo(cx + 14, cy + 18);
    this.ctx.lineTo(cx - 14, cy + 18);
    this.ctx.closePath();
    this.ctx.fill();

    // Armor Body
    this.ctx.fillStyle = '#37474f';
    this.ctx.fillRect(cx - 8, cy - 6, 16, 16);

    // Golden Beard / Hair
    this.ctx.fillStyle = '#ffb300';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy - 10, 8, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillRect(cx - 6, cy - 8, 12, 10);

    // Winged Helm
    this.ctx.fillStyle = '#cfd8dc';
    this.ctx.fillRect(cx - 7, cy - 16, 14, 6);

    // Mjolnir Hammer (Held in right hand)
    this.ctx.fillStyle = '#78909c';
    this.ctx.fillRect(cx + 10, cy - 4, 10, 8);
    this.ctx.fillStyle = '#455a64';
    this.ctx.fillRect(cx + 14, cy + 4, 3, 10);

    // Lightning spark from Mjolnir
    if (Math.random() < 0.25) {
      this.ctx.strokeStyle = '#80deea';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(cx + 15, cy - 4);
      this.ctx.lineTo(cx + 18 + (Math.random() * 6 - 3), cy - 10);
      this.ctx.lineTo(cx + 22, cy - 8);
      this.ctx.stroke();
    }
  }

  drawWolf(x, y, dir, t) {
    const cx = x + 25;
    const cy = y + 25;
    const bob = Math.sin(t / 150) * 1.5;

    this.ctx.save();
    this.ctx.translate(cx, cy + bob);
    if (dir < 0) this.ctx.scale(-1, 1);

    // Wolf Body (Dark silver-blue fur)
    this.ctx.fillStyle = '#37474f';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 2, 14, 9, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Head
    this.ctx.fillStyle = '#455a64';
    this.ctx.beginPath();
    this.ctx.ellipse(10, -2, 8, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Snout
    this.ctx.beginPath();
    this.ctx.moveTo(14, -4);
    this.ctx.lineTo(19, 0);
    this.ctx.lineTo(14, 2);
    this.ctx.closePath();
    this.ctx.fill();

    // Ears
    this.ctx.beginPath();
    this.ctx.moveTo(7, -8);
    this.ctx.lineTo(9, -15);
    this.ctx.lineTo(12, -7);
    this.ctx.closePath();
    this.ctx.fill();

    // Glowing Frost Eye
    this.ctx.fillStyle = '#80deea';
    this.ctx.fillRect(12, -4, 2.5, 2.5);

    // Bushy Tail
    this.ctx.fillStyle = '#263238';
    this.ctx.beginPath();
    this.ctx.moveTo(-12, 0);
    this.ctx.lineTo(-18, -6);
    this.ctx.lineTo(-14, 4);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  drawKratos(x, y, facing) {
    const cx = x + 25;
    const cy = y + 25;

    this.ctx.save();
    this.ctx.translate(cx, cy);
    if (facing === 'left') this.ctx.scale(-1, 1);

    // Shadow on ground
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 18, 12, 5, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Spartan Torso / Armor (Dark leather & fur)
    this.ctx.fillStyle = '#2d2218';
    this.ctx.fillRect(-7, -4, 14, 16);

    // Golden Waist Buckle
    this.ctx.fillStyle = '#ffd54f';
    this.ctx.fillRect(-3, 10, 6, 3);

    // Head (Pale Ash Skin of Sparta)
    this.ctx.fillStyle = '#d9dadc';
    this.ctx.beginPath();
    this.ctx.arc(0, -10, 8, 0, Math.PI * 2);
    this.ctx.fill();

    // Signature Red War Tattoo (Curves across torso and over head)
    this.ctx.strokeStyle = '#c41e3a';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.moveTo(-4, -16);
    this.ctx.lineTo(-1, -9);
    this.ctx.lineTo(4, 4);
    this.ctx.stroke();

    // Dark Trimmed Beard
    this.ctx.fillStyle = '#1c1b1a';
    this.ctx.beginPath();
    this.ctx.moveTo(-6, -8);
    this.ctx.lineTo(6, -8);
    this.ctx.lineTo(4, -1);
    this.ctx.lineTo(0, 2);
    this.ctx.lineTo(-4, -1);
    this.ctx.closePath();
    this.ctx.fill();

    // Fur Pauldron on shoulder
    this.ctx.fillStyle = '#8d6e63';
    this.ctx.fillRect(-9, -6, 5, 7);

    // Leviathan Axe held on back / side
    this.ctx.fillStyle = '#5d4037'; // Ash wood haft
    this.ctx.fillRect(8, -12, 3, 24);

    // Axe Blade (Forged Steel with Frost Rune Glow)
    this.ctx.fillStyle = '#90a4ae';
    this.ctx.beginPath();
    this.ctx.moveTo(9, -12);
    this.ctx.lineTo(17, -15);
    this.ctx.lineTo(16, -6);
    this.ctx.lineTo(9, -4);
    this.ctx.closePath();
    this.ctx.fill();

    // Frost Glow Line on Blade
    this.ctx.strokeStyle = '#80deea';
    this.ctx.lineWidth = 1.2;
    this.ctx.beginPath();
    this.ctx.moveTo(11, -12);
    this.ctx.lineTo(15, -11);
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawSnowflakes(dt) {
    this.ctx.fillStyle = '#ffffff';
    this.snowflakes.forEach(flake => {
      flake.y += flake.speedY;
      flake.x += flake.speedX;

      if (flake.y > 500) {
        flake.y = -5;
        flake.x = Math.random() * 750;
      }
      if (flake.x < 0) flake.x = 750;
      if (flake.x > 750) flake.x = 0;

      this.ctx.globalAlpha = flake.alpha;
      this.ctx.beginPath();
      this.ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1.0;
  }
}

// Start Game once DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.gameInstance = new Game();
});
