# 🎯 F-Strings: The Modern Way to Format Text

In the previous lesson, you learned how to combine strings using concatenation (`+`). While this works, Python has a much cleaner, more powerful way to combine text and variables: **f-strings** (formatted string literals).

Think of f-strings as smart templates - they let you insert variables and expressions directly into your text, making your code cleaner and easier to read.

## 1. Why We Need Something Better Than Concatenation

Let's see the problem with concatenation:

```python
name = "Luke"
age = 23
score = 95.5

# Old way (concatenation) - messy and requires str() conversion
message = "My name is " + name + ", I am " + str(age) + " years old, and my score is " + str(score) + "%"

print(message)  # Output: My name is Luke, I am 23 years old, and my score is 95.5%
```

Notice the problems:

- Lots of `+` signs
- Need to convert numbers to strings with `str()`
- Difficult to read and maintain

## 2. F-Strings to the Rescue!

**Basic Syntax**
Put an `f` before the opening quote, then use curly braces `{}` to insert variables:

```python
name = "Luke"
age = 23

# Modern way (f-string) ⭐
message = f"My name is {name} and I am {age} years old"

print(message)  # Output: My name is Luke and I am 23 years old
```

Notice: With f-strings, you don't need `str()` to convert numbers! Python does it automatically.

### How It Works

```python
# The 'f' tells Python this is a formatted string
# {name} gets replaced with the value of the 'name' variable
# {age} gets replaced with the value of the 'age' variable

player = "Mario"
lives = 3

status = f"Player: {player} | Lives: {lives}"
print(status)  # Output: Player: Mario | Lives: 3
```

## 3. F-Strings with Expressions

**The real power:** You can put expressions inside the curly braces!

```python
# Calculations
width = 10
height = 5
print(f"The area is {width * height} square meters")
# Output: The area is 50 square meters

price = 19.99
quantity = 3
print(f"Total: ${price * quantity:.2f}")
# Output: Total: $59.97

# Function calls
name = "alice"
print(f"Hello, {name.upper()}!")
# Output: Hello, ALICE!
```

:::note
The `:.2f` formats numbers to 2 decimal places. The `f` stands for "float" and the `.2` means "2 decimal places".
So `{3.14159:.2f}` becomes `3.14`. The number after the decimal controls how many digits appear after the decimal point:

- `:.1f` → 1 decimal place (3.1)
- `:.2f` → 2 decimal places (3.14)
- `:.3f` → 3 decimal places (3.142)

Python will round the last digit automatically!
:::

## 4. Common Use Cases

**User Information**

```python
username = "techmaster99"
score = 1250
level = 7
print(f"Player {username} has {score} points at level {level}")

# Output: Player techmaster99 has 1250 points at level 7
```

**Numerical Operations**

```python
num1 = 15
num2 = 7
print(f"{num1} + {num2} = {num1 + num2}")
print(f"{num1} × {num2} = {num1 * num2}")
print(f"{num1} ÷ {num2} = {num1 / num2:.2f}")  # Rounds to 2 decimal places

# Output:
# 15 + 7 = 22
# 15 × 7 = 105
# 15 ÷ 7 = 2.14
```

**Shopping Cart**

```python
item = "Python Book"
price = 39.99
discount = 0.15  # 15% discount

print(f"Item: {item}")
print(f"Original price: ${price}")
print(f"Discount: {discount * 100}%")
print(f"Final price: ${price * (1 - discount):.2f}")

# Output:
# Item: Python Book
# Original price: $39.99
# Discount: 15.0%
# Final price: $33.99
```

## 5. Formatting Numbers

F-strings let you control how numbers appear:

```python
pi = 3.1415926535

# Round to 2 decimal places
print(f"Pi rounded: {pi:.2f}")  # Output: Pi rounded: 3.14

# Add commas to large numbers
population = 7800000000
print(f"World population: {population:,}")  # Output: World population: 7,800,000,000

# Percentage
success_rate = 0.856
print(f"Success rate: {success_rate:.1%}")  # Output: Success rate: 85.6%
```

## 6. Multi-line F-Strings

You can create f-strings that span multiple lines:

```python
name = "Sarah"
age = 28
city = "London"

profile = f"""
=== USER PROFILE ===
Name:   {name}
Age:    {age}
City:   {city}
===================
"""

print(profile)
```

## 7. 🎯 Quick Comparison

| Method        | Code                                      | Clean? |
| ------------- | ----------------------------------------- | ------ |
| Concatenation | "Hello " + name + ", you are " + str(age) | ❌     |
| F-string      | f"Hello {name}, you are {age}"            | ✅     |

## 8. Practice Examples

Try predicting what these will output:

```python
# Example 1
item = "sword"
damage = 45
print(f"The {item} deals {damage} damage")

# Example 2
coins = 100
price = 25
print(f"You can buy {coins // price} items with {coins} coins")

# Example 3
temp_c = 22.5
print(f"Temperature: {temp_c}°C ({temp_c * 9/5 + 32:.1f}°F)")
```

:::summary

- F-strings (`f"text {variable}"`) are Python's modern way to format strings
- Add `f` before the opening quote, then use `{variable}` inside
- No need for `str()` conversion - f-strings handle it automatically
- You can put expressions inside `{}`: calculations, function calls, etc.
- F-strings support number formatting: decimals, commas, percentages
- They work for multi-line strings too
- F-strings are cleaner and more readable than concatenation
  :::

:::tip

**F-strings are now the standard in Python!** Whenever you need to combine text with variables or expressions, use f-strings. They'll make your code cleaner, easier to write, and easier to read.

:::

In the next module, you'll use f-strings to display lists and other data structures beautifully!

Now let's practice! In the challenge below, you'll convert concatenation code to f-strings and create your own formatted messages.
