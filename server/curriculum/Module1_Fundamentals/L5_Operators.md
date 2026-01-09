# ➕ Operators: Manipulating Data

Operators are symbols that tell the Python interpreter to perform a specific action, like addition, subtraction, or combining text.

## 1. Arithmetic Operators

These are used for working with **numbers** (`int` and `float`).

| Operator | Name                | Example  | Result                  |
| -------- | ------------------- | -------- | ----------------------- |
| `+`      | Addition            | `5 + 2`  | `7`                     |
| `-`      | Subtraction         | `5 - 2`  | `3`                     |
| `*`      | Multiplication      | `5 * 2`  | `10`                    |
| `/`      | Division            | `5 / 2`  | `2.5` (Always a float!) |
| `//`     | Floor Division      | `5 // 2` | `2` (Drops the decimal) |
| `%`      | Modulus (Remainder) | `5 % 2`  | `1` (The remainder)     |
| `**`     | Exponentiation      | `5 ** 2` | `25` (5 squared)        |

### Examples in Action

```python
# Basic arithmetic
total = 10 + 5        # 15
difference = 10 - 5   # 5
product = 10 * 5      # 50
quotient = 10 / 5     # 2.0 (notice it's a float!)

# Floor division vs regular division
regular = 7 / 2       # 3.5
floored = 7 // 2      # 3 (drops everything after the decimal)

# Exponentiation
squared = 3 ** 2      # 9 (3 * 3)
cubed = 2 ** 3        # 8 (2 * 2 * 2)
```

### 🧠 Modulus (`%`) Explained

The **modulus** operator is highly useful in coding. It returns the _remainder_ after division.

**Real-world example:** If you have 10 cookies and 3 friends, you can give each friend 3 cookies (`10 // 3 = 3`). How many cookies are left over? `10 % 3 = 1` - there's **1** cookie remaining!

```python
print(10 % 3)   # Output: 1 (the remainder)
print(15 % 4)   # Output: 3
print(20 % 5)   # Output: 0 (divides evenly, no remainder)
```

**Common uses:**

- Checking if a number is even: `number % 2 == 0`
- Finding every 3rd item: `index % 3 == 0`

## 2. Operator Precedence (PEMDAS)

Just like in math class, Python follows a specific order when evaluating expressions:

**P**arentheses → **E**xponents → **M**ultiplication/**D**ivision → **A**ddition/**S**ubtraction

**Rule:** Operations inside parentheses are always performed first.

```python
result_a = 2 + 3 * 4      # 3 * 4 is done first (12), then + 2
                          # Result: 14

result_b = (2 + 3) * 4    # (2 + 3) is done first (5), then * 4
                          # Result: 20
```

**Best Practice:** When in doubt, use parentheses! They make your code clearer and prevent mistakes.

```python
# Which is clearer?
total = price * quantity + tax              # Unclear order
total = (price * quantity) + tax            # Clear: multiply first, then add
```

## 3. String Operators (Concatenation)

You can also use the `+` and `*` operators on strings to combine or repeat them.

### Concatenation (`+`): Joins strings together

```python
first = "Hello"
last = "World"
greeting = first + " " + last  # Result: "Hello World"

# Building sentences
name = "Alice"
message = "Welcome, " + name + "!"  # Result: "Welcome, Alice!"
```

### Repetition (`*`): Repeats a string multiple times

```python
laugh = "ha" * 3           # Result: "hahaha"
divider = "=" * 20         # Result: "===================="
oops = "Error! " * 2       # Result: "Error! Error! "
```

### Important Limitations

**You cannot mix types without converting:**

```python
age = 25
message = "I am " + age + " years old"  # ❌ ERROR! Can't add string + int

# Fix it by converting the number to a string:
message = "I am " + str(age) + " years old"  # ✓ Works!
```

**You cannot use subtraction or division on strings:**

```python
result = "Hello" - "lo"    # ❌ ERROR!
result = "Test" / 2        # ❌ ERROR!
```

## What You've Learned

- Python has 7 arithmetic operators: `+`, `-`, `*`, `/`, `//`, `%`, `**`
- The modulus operator (`%`) returns the remainder after division
- Python follows PEMDAS order of operations (use parentheses for clarity!)
- Strings can be combined with `+` and repeated with `*`
- You cannot mix strings and numbers without converting types

## 💡 Practice Tip

**Use your terminal to test the code!** For questions involving calculations or code output, you can type the code into your Python terminal to see the results. This helps reinforce your learning and builds confidence.

For example, if a question asks "What does `5 % 2` return?", you can type `print(5 % 2)` in the terminal to verify your answer.

Now let's practice using these operators! The challenge below will test your understanding of arithmetic calculations and string operations.
