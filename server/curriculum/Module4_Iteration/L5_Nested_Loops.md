# 🧩 Nested Loops: Working with Grids

A **nested loop** is simply a loop placed inside the body of another loop. This structure is used anytime you need to process data in two dimensions, such as rows and columns in a spreadsheet, coordinates on a map, or items within items.

:::warning
**Performance Alert:** Nested loops have O(n²) complexity (where n is the size). For large datasets, this can get slow quickly. If you're processing 1000x1000 items, that's 1,000,000 iterations! Always consider if there's a more efficient approach for large data.
:::

## 1. The Structure

In a nested loop, we refer to the loops as the **outer loop** and the **inner loop**.

```python
# Outer Loop - Controls the main sequence (e.g., rows)
for item_outer in outer_sequence:
    # Inner Loop - Controls the sub-sequence (e.g., columns)
    for item_inner in inner_sequence:
        # Code block executes for every combination
        print(item_outer, item_inner)
```

## 2. Execution Pattern

The key to understanding nested loops is the order of execution:

• The Outer Loop executes its first iteration.

• The Inner Loop starts and runs to completion (all its iterations finish).

• The Outer Loop moves to its second iteration.

• The Inner Loop starts again and runs to completion.

This repeats until the Outer Loop finishes.

### Example: Dungeon Exploration

```python
# Outer Loop - Exploring dungeon levels
for level in ["Entrance", "Catacombs", "Treasure Room"]:
    print(f"--- Entering {level} ---")

    # Inner Loop - Searching rooms within each level
    for room in range(1, 4):
        print(f"Searching Room {room} in the {level}...")
        if level == "Treasure Room" and room == 3:
            print("🎉 Found the Dragon's Gold!")

print("Exploration complete!")
# Output:
# --- Entering Entrance ---
# Searching Room 1 in the Entrance...
# Searching Room 2 in the Entrance...
# Searching Room 3 in the Entrance...
# --- Entering Catacombs ---
# ... (pattern continues)
# --- Entering Treasure Room ---
# Searching Room 1 in the Treasure Room...
# Searching Room 2 in the Treasure Room...
# Searching Room 3 in the Treasure Room...
# 🎉 Found the Dragon's Gold!
# Exploration complete!
```

## 3. Practical Example: Chess Board

Let's create a chess board using nested loops. A chess board is 8x8 - perfect for demonstrating rows and columns.

```python
print("♟️ Setting up a Chess Board:")

# Outer loop: 8 rows
for row in range(8):
    # Inner loop: 8 columns in each row
    for col in range(8):
        # Determine if square should be black or white
        # Black squares: when row + col is even
        if (row + col) % 2 == 0:
            print("█", end=" ")  # Black square
        else:
            print(" ", end=" ")  # White square (space)
    print()  # New line after each row

print("\nChess board ready! 8 rows × 8 columns.")
```

Output:

♟️ Setting up a Chess Board:
█ █ █ █  
 █ █ █ █
█ █ █ █  
 █ █ █ █
█ █ █ █  
 █ █ █ █
█ █ █ █  
 █ █ █ █

Chess board ready! 8 rows × 8 columns.

What this teaches:

- Outer loop `row` controls which row we're on
- Inner loop `col` draws each square in that row
- We need BOTH coordinates to decide square color
- This is why nested loops are essential for grids

## 4. List of Lists: The Matrix

Sometimes you need to store 2D data. In Python, we use a list of lists (often called a matrix).

```python
# A 3x2 matrix (3 rows, 2 columns)
# Think of it as: row 0 has [10, 20], row 1 has [30, 40], etc.
matrix = [
    [10, 20],  # Row 0
    [30, 40],  # Row 1
    [50, 60]   # Row 2
]

print("Accessing a 3x2 matrix:")
print(f"Element at row 1, column 0: {matrix[1][0]}")  # Output: 30

print("\nPrinting the entire matrix:")
for row in matrix:  # Outer loop: gets each row list
    for element in row:  # Inner loop: gets each element in the row
        print(element, end=" ")
    print()  # New line after each row

# Output:
# 10 20
# 30 40
# 50 60
```

Real-world analogy: This is like a spreadsheet:

- Each row is a list (e.g., student's grades)
- The whole matrix is all students' grades
- `matrix[1][0]` = student 1's first grade

## 5 . The Classic: Multiplication Table

```python
print("📊 Multiplication Table (1-3):")
print("   | 1  2  3")
print("---+---------")

for row in range(1, 4):  # Outer: rows 1, 2, 3
    print(f" {row} |", end=" ")

    for col in range(1, 4):  # Inner: columns 1, 2, 3
        result = row * col
        print(f"{result:2}", end=" ")  # Format to 2 spaces

    print()  # New line after each row

# Output:
# 📊 Multiplication Table (1-3):
#    | 1  2  3
# ---+---------
#  1 |  1  2  3
#  2 |  2  4  6
#  3 |  3  6  9
```

:::tip
**Variable Naming:** In nested loops, use descriptive variable names like `row` and `col` (or `i` and `j`) rather than generic names. This makes it much clearer which loop is which, especially when you have multiple levels of nesting.
:::

## 5. Break in Nested Loops: Escaping the Maze

```python
# Searching for the exit in a maze
maze = [
    ["Wall", "Wall", "Wall", "Exit"],
    ["Wall", "Trap", "Wall", "Trap"],
    ["Start", "Path", "Path", "Path"]
]

print("🧭 Maze Navigation:")
found_exit = False

for row_idx, row in enumerate(maze):
    print(f"Checking Row {row_idx}: {row}")

    for col_idx, cell in enumerate(row):
        print(f"  Cell ({row_idx}, {col_idx}): {cell}")

        if cell == "Exit":
            print("🎯 Found the exit!")
            found_exit = True
            break  # Only breaks the INNER loop!

    if found_exit:
        print("Breaking out of maze search...")
        break  # This breaks the OUTER loop

print("Maze exploration complete!")
```

**Remember:** `break` only exits the innermost loop it's inside. To exit multiple levels, you need additional logic (like our `found_exit` flag).

:::summary

- **Nested loops**: loop inside another loop
- **Outer loop** runs first iteration → **Inner loop** runs completely → repeats
- Essential for **2D data** (grids, matrices, tables)
- Access list of lists: `for row in matrix: for element in row:`
- `break` only exits **innermost** loop it's in
- Use **flags** (like `found_exit = True`) to control outer loops
- Watch performance with large datasets (n² complexity)

:::
