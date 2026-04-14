# 🧩 Nested Loops: Working with Grids and Tables

A **nested loop** is simply a loop placed inside another loop. This structure is essential when you need to process data in two dimensions - like rows and columns in a spreadsheet, coordinates on a grid, or creating tables.

## 1. The Structure

In a nested loop, we refer to the loops as the **outer loop** and the **inner loop**.

```python
# Outer Loop - Controls the main sequence (e.g., rows)
for item_outer in outer_sequence:
    # Inner Loop - Controls the sub-sequence (e.g., columns)
    for item_inner in inner_sequence:
        # This code runs for every combination
        print(item_outer, item_inner)
```

## 2. How Nested Loops Execute

The key to understanding nested loops is the order of execution:

1. The Outer Loop executes its **first** iteration.
2. The Inner Loop starts and runs to completion (**all** of its iterations finish).
3. The Outer Loop moves to its **second** iteration.
4. The Inner Loop starts again and runs to completion.
5. This repeats until the Outer Loop finishes.

### Example: Daily Schedule

```python
days = ["Monday", "Tuesday", "Wednesday"]
meals = ["Breakfast", "Lunch", "Dinner"]

print("📅 Weekly Meal Plan:")
for day in days:  # Outer loop: each day
    print(f"\n{day}:")
    for meal in meals:  # Inner loop: each meal
        print(f"  - {meal}")

# Output:
# 📅 Weekly Meal Plan:
#
# Monday:
#   - Breakfast
#   - Lunch
#   - Dinner
#
# Tuesday:
#   - Breakfast
#   - Lunch
#   - Dinner
#
# Wednesday:
#   - Breakfast
#   - Lunch
#   - Dinner
```

Notice how all 3 meals print for Monday before moving to Tuesday. The inner loop completes fully each time!

```python
# The Black Riders are searching Middle-earth for the Ring...
regions = {
    "The Shire": ["Hobbiton", "Farmer Maggot's Field", "Bucklebury Ferry"],
    "Eriador": ["Bree", "Weathertop", "Rivendell"]
}

print("The Nazgûl are hunting...")

for region, locations in regions.items(): # Outer Loop: Regions
    print(f"\nSearching the region of {region}...")

    for spot in locations: # Inner Loop: Specific spots
        print(f"  - Looking in {spot}...")

        if spot == "Rivendell":
            print(" 🌊 THE FORD OF BRUINEN! The Nazgûl are swept away!")
            break # They stop searching Eriador locations

# Output:
# The Nazgûl are hunting...
#
# Searching the region of The Shire...
#   - Looking in Hobbiton...
#   - Looking in Farmer Maggot's Field...
#   - Looking in Bucklebury Ferry...
#
# Searching the region of Eriador...
#   - Looking in Bree...
#   - Looking in Weathertop...
#   - Looking in Rivendell...
#   🌊 THE FORD OF BRUINEN! The Nazgûl are swept away!
```

:::note
🕒 The Clock Analogy

If you're struggling to visualize the flow, think of a digital clock:

- The _Outer Loop_ is the Hour: It only changes once every 60 minutes.
- The _Inner Loop_ is the Minute: It must go from 0 to 59 before the Hour can click forward once.

Just like a clock, the "inner" part of your code must finish its full cycle before the "outer" part can take its next step.
:::

## 3. Building a Multiplication Table

Let's create something practical - a multiplication table. Everyone remembers these from school!

```python
print("📊 Multiplication Table (1-5):")
print()

# Header row
print("   ", end="")
for col in range(1, 6):
    print(f"{col:4}", end="")
print("\n" + "-" * 25)

# Table rows
for row in range(1, 6):
    print(f"{row} |", end="")
    for col in range(1, 6):
        result = row * col
        print(f"{result:4}", end="")
    print()  # New line after each row

# Output:
# 📊 Multiplication Table (1-5):
#
#       1   2   3   4   5
# -------------------------
# 1 |   1   2   3   4   5
# 2 |   2   4   6   8  10
# 3 |   3   6   9  12  15
# 4 |   4   8  12  16  20
# 5 |   5  10  15  20  25
```

### What's happening:

- **_Outer loop_** `row`: Controls which row of the table (1, 2, 3, 4, 5)
- **_Inner loop_** `col`: For each row, calculates all the columns (1×1, 1×2, 1×3, etc.)
- We multiply `row * col` to get each cell's value
- This creates a complete 5×5 grid of multiplication results

## 4. Grid Coordinates

Nested loops are perfect for working with coordinates on a grid.

```python
print("🗺️ Creating a 3x4 coordinate grid:")
print()

for row in range(3):
    for col in range(4):
        print(f"({row},{col})", end=" ")
    print()  # New line after each row

# Output:
# 🗺️ Creating a 3x4 coordinate grid:
#
# (0,0) (0,1) (0,2) (0,3)
# (1,0) (1,1) (1,2) (1,3)
# (2,0) (2,1) (2,2) (2,3)

```

This creates 3 rows and 4 columns - a total of 12 coordinate pairs. You need both `row` and `col` to identify each position!

## 5. Working with Lists of Lists

Sometimes data is organized as a list of lists - like a spreadsheet where each row is a list.

```python
# Student test scores: each row is a student, each column is a test
scores = [
    [85, 92, 78],  # Student 0's scores
    [90, 88, 95],  # Student 1's scores
    [76, 81, 88]   # Student 2's scores
]

print("📝 Student Test Scores:")
for student_num, student_scores in enumerate(scores):
    print(f"\nStudent {student_num}:")
    for test_num, score in enumerate(student_scores):
        print(f"  Test {test_num + 1}: {score}")

# Output:
# 📝 Student Test Scores:
#
# Student 0:
#   Test 1: 85
#   Test 2: 92
#   Test 3: 78
#
# Student 1:
#   Test 1: 90
#   Test 2: 88
#   Test 3: 95
#
# Student 2:
#   Test 1: 76
#   Test 2: 81
#   Test 3: 88
```

**Pattern:**

- Outer loop gets each row (student)
- Inner loop processes items in that row (test scores)

## 6. Break in Nested Loops

:::note
`break` only exits the innermost loop it's in!
:::

```python
print("🔍 Searching a list of lists:")
data = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

target = 5

for row_idx, row in enumerate(data):
    print(f"Checking row {row_idx}: {row}")
    for col_idx, value in enumerate(row):
        if value == target:
            print(f"  Found {target} at position ({row_idx}, {col_idx})!")
            break  # This ONLY breaks the inner loop
    # Outer loop continues here

print("\nSearch complete!")

# Output:
# 🔍 Searching a list of lists:
# Checking row 0: [1, 2, 3]
# Checking row 1: [4, 5, 6]
#   Found 5 at position (1, 1)!
# Checking row 2: [7, 8, 9]
#
# Search complete!
```

Notice how after finding 5, we still check row 2? That's because `break` only stopped the inner loop. The outer loop continued.

To stop both loops, you'd need a flag:

```python
found = False
for row in data:
    for value in row:
        if value == target:
            found = True
            break
    if found:
        break  # Now we break the outer loop too
```

:::note

### Why use a "Flag"?

In our Lord of the Rings example, the Black Riders continued searching for the ring even after they had been swept away by the ford. The `break` forced them to stop searching Eriador (inner loop) but they continued searching Lothlorien, Gondor and Rohan (outer loop).

Imagine if the Black Riders found the Ring in _Hobbiton_. They wouldn't just stop searching the Shire, they would stop searching **all of Middle-earth** and head back to Mordor!

Since a `break` only exits the current loop (the specific region), we use a **Flag** (a variable like `ring_found = False`) to signal to the outer loops that the entire mission is successful and everyone can stop.
:::

```python
ring_found = False
regions = {
    "The Shire": ["Hobbiton", "Farmer Maggot's Field"],
    "Eriador": ["Bree", "Weathertop"]
}

for region, locations in regions.items():
    print(f"Searching {region}...")
    for spot in locations:
        if spot == "Hobbiton":
            print(f"  💍 Found it in {spot}!")
            ring_found = True
            break # This exits the 'locations' loop

    if ring_found:
        print("Mission complete. Returning to Mordor!")
        break # This exits the 'regions' loop

# Output:
# Searching The Shire...
#   💍 Found it in Hobbiton!
# Mission complete. Returning to Mordor!
```

## 7. Practical Example: Star Rating Visualizer

In our previous examples, the inner loop always ran a fixed number of times (like 3 meals or 5 columns). But sometimes, the _inner loop depends on the outer loop_.

One real-world example is displaying star ratings for products. If a product has a 4-star rating, we need the inner loop to run exactly 4 times.

```python
reviews = [5, 3, 4]

print("Customer Feedback Summary:")
for stars in reviews: # Outer loop: Each review
    for i in range(stars): # Inner loop: Print the number of stars
        print("⭐", end="")
    print(f" ({stars} stars)")

# Output:
# ⭐⭐⭐⭐⭐ (5 stars)
# ⭐⭐⭐ (3 stars)
# ⭐⭐⭐⭐ (4 stars)
```

Look at `range(stars)`. Instead of a hardcoded number like `range(5)`, we are using the variable from the outer loop to tell the inner loop how many times to spin.

- When score is 5, the inner loop prints 5 stars.
- When score is 3, the inner loop prints 3 stars.

This is exactly how websites generate those visual bar charts and rating summaries you see every day!

:::summary

- **Nested loops** = loop inside another loop
- **Execution order**: Outer loop → Inner loop completes → Outer loop next iteration → repeat
- Essential for **2D data**: grids, tables, coordinates, spreadsheets
- `break` only exits **innermost** loop it's in
- **Common pattern**: `for row in data: for item in row:` to process lists of lists
  :::

:::tip
Remember the multiplication table! If you can visualize rows and columns in a times table, you understand nested loops. The outer loop picks the row (like "3 times..."), and the inner loop goes through each column ("...1, 2, 3, 4, 5").
:::
