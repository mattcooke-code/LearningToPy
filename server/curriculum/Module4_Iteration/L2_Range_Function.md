# 🔢 The `range()` Function: Counting and Stepping

While a `for` loop is designed to iterate over the contents of a sequence (like a list), the **`range()` function** is used when you want to iterate a specific number of times, or you need to generate a sequence of numbers (e.g., indices) to use in your loop.

`range()` is not a function that creates a list, but rather an **iterable object** that generates numbers on demand, making it very memory efficient.

## 1. `range()` Syntax: Three Forms

The `range()` function has three common forms, all of which use the principle that the stop value is **exclusive** (it stops _before_ the number is reached).

### A. One Argument: `range(stop)`

This is the simplest form. It starts counting at **0** and stops _before_ the `stop` value.

```python
for i in range(5):
    print(i)

# Generates: 0, 1, 2, 3, 4

```

### B. Two Arguments: `range(start, stop)`

This allows you to specify a custom starting point. It counts from start up to, but not including, stop.

```python
for count in range(10, 13):
    print(count)

# Generates: 10, 11, 12
```

### C. Three Arguments: `range(start, stop, step)`

The third argument, step, controls the increment (or decrement) between numbers. A step of 2 means it jumps every other number.

```python
for even in range(0, 10, 2):
    print(even)

# Generates: 0, 2, 4, 6, 8
```

:::tip
**Memory Efficiency:** `range()` doesn't create a list in memory - it generates numbers on demand. This makes `for i in range(1000000):` much more memory efficient than `for i in list(range(1000000)):` for large ranges.
:::

## 2. Counting Backward

To count backward (or reverse a loop), you must:

- Set the start value to be greater than the stop value.
- Set the step value to a negative number (e.g., `-1`).

```python
for countdown in range(5, 0, -1):
    print(countdown)

# Generates: 5, 4, 3, 2, 1
```

## 3. `range()` and List Indexing

You can use `range()` to access the items in a list by their index, particularly if you need to modify the list during iteration (which `enumerate()` doesn't allow cleanly).

```python
data = ["A", "B", "C"]

for i in range(len(data)):
    # Use the index to access the element
    data[i] = data[i].lower()

print(data) # Output: ['a', 'b', 'c']

```

```python
print("🍄 Super Mario - Invincibility Star:")
invincible_time = 10  # seconds

for seconds_left in range(invincible_time, 0, -1):
    print(f"Star Power: {seconds_left} seconds remaining")
    # Game logic would go here

print("The star power has worn off! Watch out for Goombas!")
```

## 4. Practical Example: Building a Pattern

```python
# Build a right-aligned triangle pattern
for i in range(1, 6):
    spaces = " " * (5 - i)
    stars = "*" * i
    print(spaces + stars)
# Output:
#     *
#    **
#   ***
#  ****
# *****
```

:::summary

- `range()` generates number sequences efficiently (no list created)
- **Three forms**:
  - `range(stop)` → 0 to stop-1
  - `range(start, stop)` → start to stop-1
  - `range(start, stop, step)` → with custom increment
- `stop` value is **exclusive** (not included)
- Use **negative step** to count backward: `range(5, 0, -1)`
- Often used with `for` loops for counting/repeating

:::
