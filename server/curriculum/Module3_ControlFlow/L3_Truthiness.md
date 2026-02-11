# ✨ Checking if Things Are Empty

So far, you've used comparison operators like `==` and `>` in your `if` statements. But Python has a helpful shortcut: you can check if something is empty or has content without any comparison operators at all!

This works because Python treats empty things as `False` and things with content as `True` when used in conditions. You may hear programmers refer to this concept as **"Truthiness"** and **"Falsiness"** - these are just informal terms describing how Python decides what counts as True or False in conditional statements.

## 1. Understanding Empty vs. Not Empty

In Python, these values are treated as **False** (or _Falsy_) when used in an `if` statement:

**Empty values:**

- Empty strings: `""`
- Empty lists: `[]`
- The number zero: `0`
- The special value: `None`
- The boolean: `False`

**Everything else** (non-empty values) is treated as **True**:

- Strings with text: `"Hello"`, `"Python"`
- Lists with items: `[1, 2, 3]`, `["apple"]`
- Any number except zero: `1`, `-5`, `3.14`
- The boolean: `True`

## 2. Checking Lists

You can check if a list has items by using the list directly in an `if` statement:

```python
shopping_basket = ["Milk", "Eggs"]

if shopping_basket:
    print("You have items in your basket.")
else:
    print("Your basket is empty.")
# Prints: "You have items in your basket."
```

```python
shopping_basket = []

if shopping_basket:
    print("You have items in your basket.")
else:
    print("Your basket is empty.")
# Prints: "Your basket is empty."
```

**Why this works:** When the list has items, it's treated as `True`. When it's empty `[]`, it's treated as `False`.

## 3. Checking Strings

The same principle works for checking if a string is empty:

```python
username = "Spock"

if username:
    print(f"Welcome, {username}!")
else:
    print("Please enter a username.")
# Prints: "Welcome, Spock!"
```

```python
username = ""

if username:
    print(f"Welcome, {username}!")
else:
    print("Please enter a username.")
# Prints: "Please enter a username."
```

**Why this works:** A string with text is `True`, but an empty string `""` is `False`.

## 4. Checking Numbers

Be careful with numbers! The number `0` is treated as `False`, but other numbers are `True`:

```python
lives_remaining = 3

if lives_remaining:
    print("Keep playing!")
else:
    print("Game Over!")
# Prints: "Keep playing!"
```

```python
lives_remaining = 0

if lives_remaining:
    print("Keep playing!")
else:
    print("Game Over!")
# Prints: "Game Over!"
```

:::warning
**Watch Out for Zero!** Since `0` is treated as `False`, be careful when checking numeric values. If you need to distinguish between `0` and other falsy values, use explicit comparison: `if number == 0:` instead of `if not number:`.
:::

## 5. When to Use This

This shortcut is most useful when you want to check:

- "Does this list have any items?"
- "Did the user enter anything?"
- "Is there any data here?"

You're checking for the **presence** or **absence** of content, not comparing specific values.

**Still use comparison operators when:**

- Comparing specific values: `if score > 100:`
- Checking equality: `if role == "Admin":`
- Comparing numbers: `if age >= 18:`

## Quick Reference

```python
# Checking for empty/not empty:
if my_list:  # Has items?
if my_string:  # Has text?
if my_number:  # Not zero?

# You can also check if something IS empty:
if not my_list:  # Is empty?
if not my_string:  # Is empty?
```

:::summary

- Python treats empty values as **False** in conditions:
  - Empty strings: `""`
  - Empty lists: `[]`
  - Zero: `0`
  - `None` and `False`
- Non-empty values are **True** in conditions
- Use this for simple checks: `if my_list:` or `if not my_string:`
- Still use comparison operators for specific value checks

:::
