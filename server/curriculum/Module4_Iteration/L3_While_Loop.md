# ⏳ The `while` Loop: Repeating Until a Condition

The **`while` loop** is used for indefinite iteration. Unlike the `for` loop, which processes every item in a sequence, the `while` loop continues to run **as long as** a specific Boolean condition remains `True`.

This is perfect for tasks that depend on external factors, user input, or system states—where the end time is unpredictable.

## 1. The Basic `while` Loop Syntax

The syntax is similar to an `if` statement, but the indented code block is executed repeatedly.

### `while condition:`

- **`while`**: The required keyword.
- **`condition`**: Any expression that evaluates to `True` or `False`.
- The loop body must be **indented**.

### The Crucial Need for a Counter

If the condition never becomes `False`, the loop will run forever, creating an **infinite loop**. Therefore, you must include a statement _inside the loop_ that eventually modifies the condition to `False`. This is usually an incrementing or decrementing variable (a counter).

```python
count = 0
while count < 3: # Condition is True when count is 0, 1, 2
    print(f"Loop iteration: {count}")
    count += 1 # Crucial step: increments count to eventually make the condition False

print("Loop finished.")
# Output:
# Loop iteration: 0
# Loop iteration: 1
# Loop iteration: 2
# Loop finished.

```

## 2. Using `while` for User Input

A common, practical use of the while loop is to repeatedly ask a user for input until they provide valid data.

```python
username = ""
# The loop continues as long as the username string is Falsy (empty)
while not username:
    username = input("Enter your username (cannot be empty): ")

print(f"Welcome, {username}!")
```

## 3. The Endless Loop (and how to stop it)

An infinite loop is created when the condition always remains True. While usually a bug, sometimes it's intentional (e.g., in game loops or server processes).

If you accidentally create an infinite loop, you can stop the program execution by pressing `Ctrl + C` in most terminals.

```python
# DANGER: Infinite loop! Do not run without a plan to stop it.
# status = True
# while status == True:
#     print("Processing...")
```
