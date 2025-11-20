# ➕ Operators: Manipulating Data

Operators are symbols that tell the Python interpreter to perform a specific action, like addition, subtraction, or combining text.

## 1. Arithmetic Operators

These are used for working with **numbers** (`int` and `float`).

| Operator | Name           | Example  | Result                  |
| :------: | :------------- | :------- | :---------------------- |
|   `+`    | Addition       | `5 + 2`  | `7`                     |
|   `-`    | Subtraction    | `5 - 2`  | `3`                     |
|   `*`    | Multiplication | `5 * 2`  | `10`                    |
|   `/`    | Division       | `5 / 2`  | `2.5` (Always a float!) |
|   `//`   | Floor Division | `5 // 2` | `2` (Drops the decimal) |
|   `%`    | Modulus        | `5 % 2`  | `1` (The remainder)     |
|   `**`   | Exponentiation | `5 ** 2` | `25` (5 squared)        |

### 🧠 Modulus (`%`) Explained

The **Modulus** operator is highly useful in coding. It returns the _remainder_ after division.

- Example: If you divide 10 cookies among 3 friends, each gets 3, and **1** is left over. `10 % 3` equals **1**.

## 2. Operator Precedence (PEMDAS)

Just like in math class, Python follows a specific order when evaluating expressions: **P**arentheses, **E**xponents, **M**ultiplication and **D**ivision, **A**ddition and **S**ubtraction.

- **Rule:** Operations inside parentheses are always performed first.

```python
result_a = 2 + 3 * 4     # 3 * 4 is done first (12), then + 2. Result: 14
result_b = (2 + 3) * 4   # (2 + 3) is done first (5), then * 4. Result: 20
```

## 3. String Operators (Concatenation)

You can also use the `+` and `\*` operators on strings to combine or repeat them.

Concatenation `(+)`: Joins two strings together.

```python
first = "Hello"
last = "World"
greeting = first + " " + last # Result: "Hello World"
```

Repetition `(\*)`: Repeats a string a number of times.

```python
oops = "Error" * 3 # Result: "ErrorErrorError"
```

Important: You cannot use the division or subtraction operators on strings, and you cannot combine a string and a number without converting the number first.
