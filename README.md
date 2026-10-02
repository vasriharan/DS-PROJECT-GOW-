# GOD OF WAR: FATE'S MAZE ᚱ
### College Data Structures & Algorithms (DSA) Project
**Student Details:**
- **Name:** Sriharan V A
- **Class / Section:** CSE A
- **Registration Number:** RA2511003040029
- **Course:** Data Structures and Algorithms Laboratory / Project

---

## 1. Project Overview & Objective
**God of War: Fate's Maze** is an interactive 2D browser game designed to visually demonstrate the **Stack Data Structure (LIFO - Last In, First Out)** through the implementation of an **Undo and Redo** system.

Set against a minimalist Norse mythology backdrop during Ragnarok, the player navigates Kratos through a frozen mountain maze to reach Thor. The core focus of this project is not graphics or complex game mechanics, but rather an unmistakable, real-time visualization of Stack operations (`PUSH`, `POP`, `PEEK`, and `CLEAR`).

---

## 2. DSA Core Concepts Demonstrated

### A. The Stack (LIFO: Last In, First Out)
A Stack is a linear data structure following the principle that the most recently added item is the first one to be removed.
- **`PUSH` Operation ($O(1)$ Time Complexity):**
  When Kratos takes a valid step in the maze, a complete snapshot of the game (`GameState`) is pushed onto the **Undo Stack**.
- **`POP` Operation ($O(1)$ Time Complexity):**
  When the player triggers Undo, the top state is popped from the **Undo Stack** and restored to the active game variables, while the current state is pushed to the **Redo Stack**.
- **`CLEAR` Operation ($O(1)$ Time Complexity):**
  When an Undo is performed and the player subsequently makes a **new divergent movement**, the **Redo Stack** is immediately cleared to prevent paradoxical timeline branching.

### B. Why Two Stacks Are Required
1. **`undoStack`**: Maintains the chronological history of past valid states. Allows the user to backtrack in reverse chronological order.
2. **`redoStack`**: Temporarily stores undone states. Enables the user to step forward back into previously undone actions.
3. **The Divergence Rule**: Once a player deviates from the undone history by taking a fresh step, future redoable states become invalid and are discarded (`redoStack.clear()`).

---

## 3. GameState Snapshot Structure
Each node stored within the Stack contains the following memory footprint:
```javascript
class GameState {
  constructor({
    playerX,       // Kratos grid X coordinate
    playerY,       // Kratos grid Y coordinate
    health,        // Health points (1 to 3)
    keyCollected,  // Boolean flag for Runic Key
    doorOpen,      // Boolean flag for Runic Gate
    wolves,        // Deep-copied array of wolf patrol positions
    actionDesc,    // Readable label (e.g. "MOVE RIGHT")
    actionIcon,    // Directional icon ("▶", "▼", etc.)
    stepIndex      // Cumulative move counter
  }) { ... }
}
```

---

## 4. Game Features & Requirements Checklist
- [x] **Storyline & Dialogue:** Ragnarok prologue with natural, non-intrusive dialogue prompts between Kratos and Thor ("I need to find the key.", "This should open the door.", "You made it.", "The path is complete.").
- [x] **Maze Design:** 15x10 handcrafted grid with dark stone walls, snow caps, open paths.
- [x] **Key & Door:** Golden Valknut key required to unlock the runic gate guarding Thor.
- [x] **Wolves (Obstacles):** 3 frost wolves on deterministic turn-based patrols (costs 1 HP on contact).
- [x] **Health & Reversal:** 3 Hearts (❤️❤️❤️). If health reaches 0, Kratos can use **UNDO** to escape death!
- [x] **Right-Side Stack Monitor:** Shows dynamic cards for both Undo and Redo stacks, highlighting the `[TOP]` element with size counts.
- [x] **Live Trace Log:** Real-time log displaying PUSH, POP, and CLEAR operations with timestamps.
- [x] **C Algorithm Modal:** Dedicated "VIEW C ALGORITHM" popup showing the clean C implementation of Stack, Push, Pop, Undo, and Redo for teacher review.
- [x] **Audio:** Self-contained Web Audio API synthesizers (light/bouncy footstep, sparkly key chime, magical door unlock, retro undo/redo slides, friendly bonk, celebratory fanfare) with a clean Sound ON/OFF toggle.
- [x] **Automated Test Sequence:** Single-click button running the exact evaluation test required by Requirement 24.

---

## 5. Controls & Shortcuts

| Action | Keyboard Key | On-Screen Button |
| :--- | :--- | :--- |
| **Move Up / Down / Left / Right** | `W`, `S`, `A`, `D` or `Arrow Keys` | Virtual D-Pad (▲, ▼, ◀, ▶) |
| **Undo (POP Undo, PUSH Redo)** | `Z` | `[ ↺ UNDO ]` |
| **Redo (POP Redo, PUSH Undo)** | `Y` | `[ ↻ REDO ]` |
| **Restart Maze & Clear Stacks** | `R` | `[ ⟲ RESTART ]` |
| **View C Stack Algorithm** | — | `[ 📜 VIEW C ALGORITHM ]` |
| **Inspect GameState Memory** | — | `[ { } STATE JSON ]` |
| **Run Requirement 24 Test** | — | `[ ▶ RUN TEST SEQUENCE ]` |

---

## 6. How to Run Locally

### Method 1: Direct File Open (Zero Installation)
Simply double-click `index.html` to open it directly in any modern browser (Chrome, Edge, Firefox, Brave). No internet or server required.

### Method 2: Local HTTP Server (Optional)
If running via Node.js:
```bash
node server.js
```
Then visit: `http://localhost:3000`

---

## 7. Requirement 24 Test Sequence Verification

To demonstrate the Stack mechanics for a viva or evaluation, perform this exact sequence (or click the **`▶ RUN TEST SEQUENCE`** button):

1. **MOVE RIGHT** $\rightarrow$ Kratos at $(2, 1)$, Undo Stack has 1 item.
2. **MOVE RIGHT** $\rightarrow$ Kratos at $(3, 1)$, Undo Stack has 2 items.
3. **MOVE DOWN** $\rightarrow$ Kratos at $(3, 2)$, Undo Stack has 3 items.
4. **MOVE LEFT** $\rightarrow$ Kratos at $(2, 2)$, Undo Stack has 4 items.
5. **UNDO** $\rightarrow$ Kratos returns to $(3, 2)$, Undo Stack size becomes 3, Redo Stack size becomes 1.
6. **UNDO** $\rightarrow$ Kratos returns to $(3, 1)$, Undo Stack size becomes 2, Redo Stack size becomes 2.
7. **REDO** $\rightarrow$ Kratos restored forward to $(3, 2)$, Undo Stack size becomes 3, Redo Stack size becomes 1.
8. **NEW MOVE (DOWN)** $\rightarrow$ Kratos steps to $(3, 3)$. Undo Stack pushes new state. **Redo Stack is immediately CLEARED (size: 0)** with notification: `"NEW ACTION → REDO STACK CLEARED"`.
