# 🔄 The `for` Loop: Iterating Over Sequences

**Iteration** is the process of repeating a sequence of instructions for every item in a collection. The **`for` loop** is Python's most common tool for this job. It's designed to loop through all elements of any sequence (like a list, tuple, or string) and stop automatically when the last element is reached.

## 1. The Basic `for` Loop Syntax

The `for` loop works by assigning a **temporary variable** to each item in the sequence, one at a time, until the sequence is exhausted.

### `for item_variable in sequence:`

- **`for` and `in`**: Required keywords.
- **`item_variable`**: A temporary variable (you name this) that holds the _current_ item being processed in the loop.
- **`sequence`**: The list, tuple, or string you want to iterate over.
- The code block must be **indented**.

```python
fruits = ["Apple", "Banana", "Cherry"]

# 'fruit' is the temporary variable
for fruit in fruits:
    print(f"I like eating {fruit}.")

# Output:
# I like eating Apple.
# I like eating Banana.
# I like eating Cherry.

```

## 2. Looping Over Different Sequences

The `for` loop is universally applicable to any iterable in Python.

### A. Looping Over Strings

A loop can process a string, treating each individual character as the item_variable.

```python
word = "Code"
for letter in word:
    print(letter)

# Output: C, o, d, e (each on a new line)
```

### B. Accessing Elements and Index

Sometimes you need both the item and its index within the loop. You can achieve this using the built-in `enumerate()` function.

The `enumerate()` function returns two values per iteration: the index and the item.

```python
colors = ["Red", "Green", "Blue"]

# item_variable now has two parts: index and value
for index, color in enumerate(colors):
    print(f"Color #{index + 1} is {color}.")

# Output:
# Color #1 is Red.
# Color #2 is Green.
# Color #3 is Blue.
```
