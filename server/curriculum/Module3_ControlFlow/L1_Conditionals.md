# 🚦 Decisions, Decisions: The `if` Statement

In programming, **Control Flow** refers to the order in which the program's instructions are executed. The most fundamental way to control the flow is using **conditional statements**, which allow your program to make decisions.

Think of an `if` statement like a fork in the road: the program will only take a path if a certain condition is met.

## 1. The `if` Statement

An `if` statement checks if a **condition** is `True`. If it is, the code indented underneath it runs.

### Syntax Key Points

• The condition ends with a **colon** (`:`).

• The code block to be executed must be **indented** (usually 4 spaces). This is how Python knows which code belongs to the `if` statement.

```python
is_raining = True

if is_raining:
    print("Take an umbrella.")
print("Continue your journey.")

# If is_raining is True, both lines print.
# If is_raining is False, only the last line prints.
```

## 2. The `else` Statement

If you want your program to do something only when the if condition is `False`, you use the _else_ block. An `else` statement is guaranteed to run when the `if` statement immediately preceding it does not.

```python
score = 85

if score >= 90:
    print("You earned an A.")
else:
    print("Keep practicing!")
# Since 85 is not greater than or equal to 90, the 'else' block runs.
```

## 3. The `elif` Statement (Else If)

When you have multiple possible conditions to check, you use `elif` (short for "else if"). Python checks the conditions from top to bottom, and as soon as it finds a condition that is `True`, it executes that block and skips the rest.

```python
temperature = 25 # Celsius

if temperature > 30:
    print("It's a very hot day.")
elif temperature > 20:
    print("It's a pleasant day.") # This block runs!
else:
    print("It's a cold day.")

# Note: If the temperature was 35, the first block would run,
# and the program would skip the elif and else blocks entirely.
```

## 4. Nested Conditionals (Bonus)

You can place `if/elif/else` statements inside other conditional blocks. This is called nesting and is used for complex decision-making. Make sure to watch your indentation!

```python
user_logged_in = True
has_premium = False

if user_logged_in:
    if has_premium:
        print("Welcome, Premium User!")
    else:
        print("Welcome, Standard User. Consider upgrading!")
else:
    print("Please log in to continue.")
```
