# ⏳ The `while` Loop: Repeating Until a Condition

The **`while` loop** is used for indefinite iteration. Unlike the `for` loop, which processes every item in a sequence, the `while` loop continues to run **as long as** a specific Boolean condition remains `True`.

This is perfect for tasks that depend on external factors, user input, or system states—where the end time is unpredictable.

## 1. The Basic `while` Loop Syntax

The syntax is similar to an `if` statement, but the indented code block is executed repeatedly.

### `while condition:`

• **`while`**: The required keyword.

• **`condition`**: Any expression that evaluates to `True` or `False`.

• The loop body must be **indented**.

:::note

### The Crucial Need for a Counter

If the condition never becomes `False`, the loop will run forever, creating an **infinite loop**. Therefore, you must include a statement _inside the loop_ that eventually modifies the condition to `False`. This is usually an incrementing or decrementing variable (a counter).
:::

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

```python
delorean_speed = 80
while delorean_speed < 88:
    print(f"If my calculations are correct, when this baby hits 88 miles per hour..."
          f"you're gonna see some serious {flux_capacitor}")
    delorean_speed += 8

print("1.21 gigawatts!!! Great Scott!")
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

:::note
**Input Validation Pattern:** The `while not valid_input:` pattern is so common it has a name: "validation loop." Remember this structure - you'll use it often when getting user input that must meet certain criteria.
:::

## 3. The Endless Loop (and how to stop it)

An _infinite loop_ is created when the condition always remains `True`. While usually a bug, sometimes it's intentional (e.g., in game loops or server processes).

If you accidentally create an infinite loop, you can stop the program execution by pressing `Ctrl + C` in most terminals.

```python
# DANGER: Infinite loop! Do not run without a plan to stop it.
# status = True
# while status == True:
#     print("Processing...")
```

:::warning
**Common Infinite Loop Bug:** Forgetting to increment/decrement your counter is the most common cause of infinite `while` loops. Always double-check that your loop condition will eventually become `False`.
:::

## 4. Practical Example: Guess the Number

```python
secret_number = 7
guess = 0

while guess != secret_number:
    # In a real program, this would be input()
    guess = 5  # Simulated first guess
    print("Guessing:", guess)
    if guess < secret_number:
        print("Too low!")
    elif guess > secret_number:
        print("Too high!")

print("You guessed it! The number was", secret_number)
# Output:
# Guessing: 5
# Too low!
# Guessing: 7
# You guessed it! The number was 7
```

:::summary

- `while` loops run **while** a condition is `True`
- Syntax: `while condition:` with indented code block
- **Crucial**: Must modify condition inside loop to avoid infinite loops
- Perfect for **indefinite iteration** (user input, game loops)
- Use `Ctrl + C` to stop accidental infinite loops
- Check for empty values: `while not username:`

:::
