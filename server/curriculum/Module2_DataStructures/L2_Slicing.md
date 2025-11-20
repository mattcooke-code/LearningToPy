# 🔪 The Art of Slicing

While **indexing** allows you to grab a single item from a list, **slicing** allows you to extract a **sequence** of items (a sub-list) from a larger list.

Slicing creates a brand new list, leaving the original list unchanged.

## 1. The Slicing Syntax

The basic syntax for slicing uses the colon (`:`) separator inside the square brackets.

### `list[start:stop]`

- **`start`**: The index where the slice **begins**. This element is **included** in the new list. If omitted, it defaults to **0**.
- **`stop`**: The index where the slice **ends**. This element is **NOT included** in the new list (it stops _before_ this index). If omitted, it defaults to the **end of the list**.

```python
letters = ["A", "B", "C", "D", "E", "F"]
# Index:    0    1    2    3    4    5

# Example 1: Slice from index 1 (B) up to, but not including, index 4 (E)
middle = letters[1:4] # Result: ["B", "C", "D"]

# Example 2: Start from the beginning (default 0) up to index 3 (D)
start_part = letters[:3] # Result: ["A", "B", "C"]

# Example 3: Start from index 3 (D) to the end (default length)
end_part = letters[3:] # Result: ["D", "E", "F"]
```

## 2. Copying a List

A common and useful slice is the full slice [:].

Using `new_list = old_list[:]` creates a shallow copy of the original list. This is the safest way to ensure that changes to `new_list` do not affect `old_list`.

```python
original = [1, 2, 3]
copy = original[:] # A safe copy
copy[0] = 99

print(original) # Output: [1, 2, 3] (Original is unchanged)
print(copy)     # Output: [99, 2, 3]
```

## 3. The Step Value

You can add an optional third value to your slice, the `step`, to skip elements.

list[start:stop:step]
The `step` value dictates how many elements to skip after retrieving the first one.

A step of 2 means it grabs every second element.

A negative step (e.g., -1) is used to reverse the list.

```python
numbers = [10, 20, 30, 40, 50, 60]

# Grab every second number
even_index = numbers[0::2] # Result: [10, 30, 50]

# Reverse the entire list
reversed_list = numbers[::-1] # Result: [60, 50, 40, 30, 20, 10]
```
