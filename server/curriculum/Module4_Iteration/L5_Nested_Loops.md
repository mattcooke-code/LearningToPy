# 🧩 Nested Loops: Working with Grids

A **nested loop** is simply a loop placed inside the body of another loop. This structure is used anytime you need to process data in two dimensions, such as rows and columns in a spreadsheet, coordinates on a map, or items within items.

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

## 3. Nested Iteration Over Data Structures

Nested loops are crucial for iterating over a list of lists (a common way to represent a grid).

```python
# A list of lists, where each inner list is a row
matrix = [
    [10, 20],
    [30, 40],
    [50, 60]
]

for row in matrix: # 'row' is a list: [10, 20], then [30, 40], etc.
    for element in row: # 'element' is the number: 10, then 20, etc.
        print(element)
```

## 4. The Classic: Multiplication Table

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
