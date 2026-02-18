# 🧮 Module Project: Calculator Builder

## The Challenge

Build a modular calculator system using functions. Instead of one giant calculator, you'll create specialized functions that each do one job well. This makes your code organized, testable, and easy to maintain.

## Project Goals

:::note
By the end of this project, you'll have:

- ✅ A set of mathematical operation functions
- ✅ Functions that handle edge cases gracefully
- ✅ A main function that routes operations
- ✅ A complete, working calculator system

:::

## Understanding Modular Design

Think of your calculator like a restaurant kitchen:

- Each chef (function) has ONE specialty
- The head chef (main function) directs orders to the right specialist
- If one station needs updating, you don't rebuild the whole kitchen

### Bad Approach (one giant function):

```python
def calculator(x, y, operation):
    if operation == "add":
        return x + y
    elif operation == "subtract":
        return x - y
    # ... 50 more lines of elif statements
    # Hard to test, hard to maintain!
```

### Good Approach (modular):

```python
def add_numbers(x, y):
    return x + y

def subtract_numbers(x, y):
    return x - y

def calculator(operation, x, y):
    if operation == "add":
        return add_numbers(x, y)
    # Much cleaner!
```

## Part 1: Basic Operations

Your calculator needs to perform fundamental arithmetic. Here's how to think about each operation:

### Addition & Subtraction

These are straightforward - just return the result of the operation.

**Example pattern:**

```python
def combine_values(first, second):
    return first + second

# Usage
result = combine_values(10, 5)  # Returns 15
```

### Multiplication

Same pattern - perform the operation and return.

**Example pattern:**

```python
def calculate_total(quantity, price):
    return quantity * price

# Usage
total = calculate_total(3, 25)  # Returns 75
```

### Division - Special Case!

:::note
Division needs extra care because you **cannot divide by zero**. If someone tries, return an error message instead of crashing.
:::

```python
def split_equally(total_amount, num_people):
    if num_people == 0:
        return "Error: Cannot split among zero people"
    return total_amount / num_people

# Usage
each_person = split_equally(100, 4)  # Returns 25.0
zero_people = split_equally(100, 0)  # Returns error message
```

**Your Task:** Create `add`, `subtract`, `multiply`, and `divide` functions following these patterns.

## Part 2: Advanced Operations

### Exponentiation (Power)

Raising a number to a power uses the `**` operator.

**Example pattern:**

```python
def calculate_area_of_square(side_length):
    return side_length ** 2

# Usage
area = calculate_area_of_square(5)  # Returns 25
```

### Square Root

Square root is the inverse of squaring. You can use `number ** 0.5` to calculate it.

:::warning
Edge Case: You cannot take the square root of a negative number (without complex numbers). Return an error message if the input is negative.
:::

**Example pattern:**

```python
def find_side_length(area):
    if area < 0:
        return "Error: Area cannot be negative"
    return area ** 0.5

# Usage
side = find_side_length(25)  # Returns 5.0
```

### Percentage

To find what percentage one number is of another: `(part / whole) * 100`

:::warning
Edge Case: If the whole is zero, return 0 (can't calculate percentage of nothing).
:::

Example pattern:

```python
def calculate_score_percentage(points_earned, total_points):
    if total_points == 0:
        return 0
    return (points_earned / total_points) * 100

# Usage
percentage = calculate_score_percentage(45, 50)  # Returns 90.0
```

**Your Task:** Create `power`, `square_root`, and `percentage` functions using these concepts.

## Part 3: Utility Functions

These helper functions make your calculator smarter.

### Checking Even Numbers

Use the modulo operator `%`. If `number % 2 == 0`, it's even.

**Example pattern:**

```python
def is_divisible_by_two(value):
    return value % 2 == 0

# Usage
result = is_divisible_by_two(4)  # Returns True
result = is_divisible_by_two(7)  # Returns False
```

### Checking Positive Numbers

Simply check if the number is greater than zero.

**Example pattern:**

```python
def is_above_zero(value):
    return value > 0

# Usage
result = is_above_zero(5)   # Returns True
result = is_above_zero(-3)  # Returns False
```

**Your Task:** Create `is_even` and `is_positive` functions following these patterns.

## Part 4: The Main Router Function

This is the "head chef" - it takes an operation name and directs it to the right function.

**Concept:**

```python
def process_order(dish_name, ingredient1, ingredient2=None):
    if dish_name == "pasta":
        return make_pasta(ingredient1, ingredient2)
    elif dish_name == "salad":
        return make_salad(ingredient1)
    else:
        return "Error: Unknown dish"
```

**Your Task:** Create a `calculate` function that:

- Takes parameters: `operation` (string), `num1`, and optional `num2`
- Uses `if/elif` to route to the correct function
- Returns `"Error: Unknown operation"` for invalid operations

:::note

## Operations to support:

- 'add', 'subtract', 'multiply', 'divide' (need num2)
- 'power' (need num2)
- 'square_root' (only needs num1)
- 'percentage' (need num2)
- 'is_even', 'is_positive' (only need num1)
  :::

:::tip
A good calculator handles both normal cases AND edge cases:

- ✅ **Normal:** `calculate('add', 5, 3) → 8`
- ✅ **Edge Case:** `calculate('divide', 10, 0)` → Error message
- ✅ **Unknown Op:** `calculate('explode', 5, 3)` → Error message

Test every function with:

1. Normal inputs
2. Edge cases (zero, negative numbers)
3. Invalid operations
   :::

## Project Requirements Checklist

### Your calculator must:

**Basic Functions:**

- `add(a, b)` - returns sum
- `subtract(a, b)` - returns difference
- `multiply(a, b)` - returns product
- `divide(a, b)` - returns quotient, handles zero

**Advanced Functions:**

- `power(base, exponent)` - returns base^exponent
- `square_root(number)` - returns √number, handles negatives
- `percentage(part, whole)` - returns percentage, handles zero

**Utility Functions:**

- `is_even(number)` - returns True/False
- `is_positive(number)` - returns True/False

**Main Function:**

- `calculate(operation, num1, num2=None)` - routes to correct function
- Handle unknown operations with error message

:::tip
Tips for Success

1. **Start Small:** Get add/subtract working first
2. **Test As You Go:** Don't write everything then test
3. **Handle Errors:** Every edge case should return a helpful message
4. **Use Descriptive Names:** `num1` and `num2` are fine parameters
5. **One Thing Per Function:** Each function should do ONE job well
   :::

:::note
Common Mistakes to Avoid

- ❌ Returning `None` instead of an error message
- ❌ Forgetting to check for division by zero
- ❌ Not handling negative square roots
- ❌ Using `print()` instead of return
- ❌ Making the calculate function do all the work instead of calling other functions
  :::

## Bonus Challenges (Optional)

If you finish early, try:

1. Add a `factorial` function
2. Add a `absolute_value` function
3. Support chaining operations: calculate the result, then use it in the next operation
4. Keep track of the last result

Remember: The goal isn't just to make a working calculator - it's to practice **modular design** with functions. Each function should be a self-contained unit that does its job well!
