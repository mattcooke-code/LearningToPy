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

The Outer Loop executes its first iteration.

The Inner Loop starts and runs to completion (all its iterations finish).

The Outer Loop moves to its second iteration.

The Inner Loop starts again and runs to completion.

This repeats until the Outer Loop finishes.

### Example: Generating a Grid

Using `range()`, we can easily create a simple grid, where the outer loop controls the rows and the inner loop controls the columns.

```python
for row in range(3): # Outer Loop (0, 1, 2)
    print(f"--- START ROW {row} ---")

    for column in range(2): # Inner Loop (0, 1)
        print(f"Cell ({row}, {column})")

# Output Pattern:
# --- START ROW 0 ---
# Cell (0, 0)
# Cell (0, 1)
# --- START ROW 1 ---
# Cell (1, 0)
# Cell (1, 1)
# ... and so on.
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
