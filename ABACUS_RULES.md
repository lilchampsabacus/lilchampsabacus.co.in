# ABACUS RULES & LOGIC DOCUMENTATION
**Project:** Li'l Champs Abacus Academy Website (lilchampsabacus.co.in)
**Purpose:** Source of truth for logical validation, finger technique hints, and formula verification.

---

## 1. FINGER TECHNIQUES (CRITICAL FOR UI HINTS)
The application must reinforce these specific finger movements.

### Right Hand (Units Rod)
* **Adding Lower Beads (+1, +2, +3, +4):** Use **Thumb**.
* **Subtracting Lower Beads (-1, -2, -3, -4):** Use **Index Finger**.
* **Upper Bead Operations (+5, -5):** Use **Middle Finger**.
* **Adding Upper & Lower (+6, +7, +8, +9):** Use **Pinch Action** (Middle + Thumb simultaneously).
* **Subtracting Upper & Lower (-6, -7, -8, -9):** Use **Scissor Action** (Middle + Index simultaneously).

### Left Hand (Tens Rod)
* **Adding Tens (+10):** Use **Left Hand Thumb**.
* **Subtracting Tens (-10):** Use **Left Hand Index**.

---

## 2. WORKFLOW RULES
* **Long Clear:** Performed before starting the first sum of a set.
* **Short Clear:** Performed before writing the answer for a specific sum.
* **Verbal Cue:** After finishing the sum, before stating the answer, the phrase "That is..." is used.
* **Layout:**
    * Addition/Subtraction sums: Displayed in **Vertical Grids**.
    * Multiplication/Division sums: Displayed in **Horizontal lines**.
* **Notation:** * **1D5R:** 1 Digit, 5 Rows (5 numbers).
    * **2D10R:** 2 Digits, 10 Rows.

---

## 3. FORMULA LOGIC (FOR ERROR DETECTION)
When validating a student's move, check if the bead movement corresponds to the correct formula category based on the current state of the abacus.

### A. Small Friends (Base 5)
*Use when there are not enough lower beads to add/subtract directly, but the Upper Bead (5) is available.*
* **+4** = +5 - 1
* **+3** = +5 - 2
* **+2** = +5 - 3
* **+1** = +5 - 4
* **-4** = +1 - 5
* **-3** = +2 - 5
* **-2** = +3 - 5
* **-1** = +4 - 5

### B. Big Friends (Base 10)
*Use when Small Friends cannot be used and the operation crosses into the next rod.*
* **+9** = -1 + 10
* **+8** = -2 + 10
* **+7** = -3 + 10
* **+6** = -4 + 10
* **+5** = -5 + 10
* **+4** = -6 + 10
* **+3** = -7 + 10
* **+2** = -8 + 10
* **+1** = -9 + 10
* **-9** = -10 + 1
* **-8** = -10 + 2
* **-7** = -10 + 3
* **-6** = -10 + 4
* **-5** = -10 + 5
* **-4** = -10 + 6
* **-3** = -10 + 7
* **-2** = -10 + 8
* **-1** = -10 + 9

### C. Combination / Mix Friends
*Use when neither Direct, Small Friend, nor Big Friend moves are possible (e.g., trying to add 6 when 5 is already added and no lower beads are free).*
* **+9** = +4 - 5 + 10
* **+8** = +3 - 5 + 10
* **+7** = +2 - 5 + 10
* **+6** = +1 - 5 + 10
* **-9** = -10 + 5 - 4
* **-8** = -10 + 5 - 3
* **-7** = -10 + 5 - 2
* **-6** = -10 + 5 - 1

---

## 4. ERROR DETECTION LOGIC
**Goal:** Detect "Formula Mistakes" even if the result is numerically correct.

**Logic Check:**
1.  **State Check:** Before the user executes a move (e.g., -6), calculate the required beads.
2.  **Constraint:**
    * IF Current Value on Rod allows Direct Move -> Require Direct Move.
    * IF Direct Move impossible -> Check Small Friend.
    * IF Small Friend impossible -> Check Big Friend.
    * IF Big Friend impossible -> Check Combination Friend.
3.  **Flagging:** If the user attempts a move that doesn't match the *priority formula* listed above, flag as `ErrorType: Wrong_Formula` in the report generation.
