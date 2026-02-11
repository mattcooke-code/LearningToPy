# 📦 Variables: The Labelled Box

In programming, we need a way to store and retrieve data. That's where **variables** come in.

Think of a variable as a **labelled storage box**. The label is the **variable name** (e.g., `user_age`), and the box holds the **value** (e.g., `25`).

## 1. Creating and Assigning

In Python, you create a variable using the **assignment operator**, which is the single equals sign `=`.

```python
# The value "Alice" is assigned to the variable 'name'
name = "Alice"

# The number 25 is assigned to the variable 'age'
age = 25

# We can reuse a variable name to change its value:
age = 26 # 'age' now holds 26 instead of 25
```

## 2. Python's Naming Rules

Variable names must be descriptive and follow a few simple rules:

- They must start with a letter (`a-z` or `A-Z`) or an underscore `_`.
- They cannot start with a number.
- They can only contain letters, numbers, and underscores.
- They are **case sensitive** (`Name` and `name` are treated as two different variables).

### Examples of Valid and Invalid Names

```python
# ✅ Valid variable names
user_age = 30
_private_var = "secret"
totalScore = 100
item2 = "sword"

# ❌ Invalid variable names
2nd_place = "silver"  # Can't start with a number
user-name = "Bob"     # Can't use hyphens
my variable = 5       # Can't have spaces
```

## 3. Best Practice: Snake Case

The Python community strongly prefers `snake_case` for variable names, where words are separated by underscores.

```python
# Good snake_case examples
favorite_color = "blue"
student_grade = 95
total_price = 29.99
```

## 4. Retrieving a Value

To see what a variable holds, you simply use its name with the `print()` function:

```python
favorite_pet = "dog"
print(favorite_pet) # Output: dog
```

## 5. Why Variables Matter: The Single Source of Truth

Variables aren't just about storing data - they make your code **maintainable**, **readable**, and **flexible**.

### The Problem: Hardcoded Values

```python
# Calculating a total with hardcoded prices
# We have 3 apples, 2 bananas, 4 oranges

total = (3 * 1.50) + (2 * 0.75) + (4 * 1.20)

# If apple price changes from 1.50 to 1.75...
# You must find EVERY "1.50" in your entire codebase!
```

The Solution: _Variables as a Single Source of Truth_

```python
# Store prices in variables
apple_price = 1.50
banana_price = 0.75
orange_price = 1.20

# Calculate total
total = (3 * apple_price) + (2 * banana_price) + (4 * orange_price)
# Price change? Update ONE variable at the top!
```

```python
# Imagine your Pokémon evolves...
pokemon = "Charmander"

# These 3 lines all use the SAME variable
print(f"Go {pokemon}!")      # "Go Charmander!"
print(f"{pokemon} uses Tackle!")  # "Charmander uses Tackle!"
print(f"{pokemon} gained 10xp!")  # "Charmander gained 10xp!"

print("✨ POKÉMON EVOLVED! ✨")

# ONLY change the variable - everything updates!
pokemon = "Charmeleon"  # 👈 ONE change!

# Same code, new results!
print(f"Go {pokemon}!")      # Now says "Go Charmeleon!"
print(f"{pokemon} uses Tackle!")  # Now says "Charmeleon uses Tackle!"
print(f"{pokemon} gained 10xp!")  # Now says "Charmeleon gained 10xp!"

print("✅ Changed ONE line, updated THREE outputs!")
```

### Three Key Benefits:

1. **Maintainability:** Change values in _ONE_ place
2. **Clarity:** Variables document what numbers mean
3. **Flexibility:** Easy to experiment with different values

## 6. 🚨 Common Pitfall: The Reassignment Trap

Remember: Variables hold _one value at a time_. When you reassign, the old value is gone forever!

```python
# Starting point
balance = 100
print(balance)  # Output: 100

# Adding 50
balance = balance + 50  # Right side calculated first (100 + 50 = 150)
print(balance)  # Output: 150

# What happens if we do it wrong?
balance = 100
balance + 50     # ❌ This does NOTHING - no assignment!
print(balance)  # Output: 100 (still 100, not 150)
```

:::summary

- Variables store data using the assignment operator `=`
- Variable names must follow Python's naming rules
- Use `snake_case` for variable names (Python convention)
- Variables are case sensitive
- Use `print()` to display variable values
- Variables create a **single source of truth** - making code maintainable and clear
- Always use `=` to save changes to a variable

:::

Now you're ready to practice! In the challenge below, you'll create two variables using proper naming conventions and print their values.
