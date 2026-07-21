# 🧮 Module Project: Calculator Builder

## The Challenge

Build a modular calculator. Each function should do one job, and a calculate function will route your commands.

## Step 1: Define Your Operations

Create these functions. Remember: Use `return` not `print`.

**Arithmetic:** `add(a, b)`, `subtract(a, b)`, `multiply(a, b)`, `divide(a, b)`

**Math Tools:** `power(base, exp)`, `square_root(n)`, `percentage(part, total)`

**Checkers:** `is_even(n)`, `is_positive(n)`

### ⚠️ Critical Edge Cases:

- **Divide:** Cannot divide by zero.
- **Square Root:** Cannot take the root of a negative.
- **Percentage:** Cannot calculate if the total is zero.

Always return a helpful error message instead of letting the code crash.

## Step 2: The Router

Create `calculate(operation, num1, num2=None)`.

Use `if`/`elif` statements to call the specific functions you wrote in Step 1.

If the operation doesn't exist, return: `"Error: Unknown operation"`.

## Step 3: Test Your Work

Run these three types of tests:

- **Happy Path:** `calculate('add', 5, 3)`
- **Edge Cases:** `calculate('divide', 10, 0)`
- **Invalid:** `calculate('dance', 5, 5)`
