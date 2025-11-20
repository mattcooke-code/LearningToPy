# ⚖️ Comparison and Logical Operators

Conditional statements (`if`/`elif`/`else`) rely on expressions that evaluate to either `True` or `False`. These expressions are created using two types of operators: **Comparison Operators** and **Logical Operators**.

## 1. Comparison Operators

Comparison operators are used to compare two values and return a Boolean result (`True` or `False`). These are the fundamental building blocks of any conditional check.

| Operator  | Name                  | Example                    | Result  |
| :-------: | :-------------------- | :------------------------- | :------ |
|   `==`    | **Equals** to         | `5 == 5`                   | `True`  |
|   `!=`    | **Not Equals** to     | `'cat' != 'dog'`           | `True`  |
|   `>`     | Greater than          | `10 > 5`                   | `True`  |
|   `<`     | Less than             | `10 < 5`                   | `False` |
|   `>=`    | Greater than or equal | `20 >= 20`                 | `True`  |
|   `<=`    | Less than or equal    | `15 <= 10`                 | `False` |

> **⚠️ Watch out for `==` vs. `=`: **
>
> - `==` is used for **comparison** (Are these two values the same?).
> - `=` is used for **assignment** (Set this variable equal to this value).

## 2. Logical Operators

Logical operators are used to combine multiple comparison results (Boolean values) into a single, complex condition.

### The `and` Operator

The `and` operator requires **both** conditions on either side to be `True` for the entire expression to be `True`. If one or both are `False`, the result is `False`.

```python
age = 17
has_license = True

if age >= 16 and has_license:
    print("You can drive.") # This is False because age is not >= 18
else:
    print("Cannot drive yet.")

```

### The `or` Operator

The `or` operator requires only one of the conditions to be `True` for the entire expression to be `True`. It only returns `False` if both conditions are `False`.

```python
has_key = True
has_access_card = False

if has_key or has_access_card:
    print("Entry granted.") # This is True!
else:
    print("Entry denied.")
```

### The `not` Operator

The `not` operator is a unary operator (it only operates on one value) that reverses the Boolean result. not `True` becomes `False`, and not `False` becomes `True`.

```python
is_valid = False

if not is_valid:
    print("Data is invalid.") # This runs because 'not False' is True

```

## 3. Chaining Comparisons (Python's Shortcut)

Python allows you to write natural-language style chains of comparison, which is cleaner than using the and operator.

Instead of writing: `if x > 0 and x < 10:`

You can simply write: `if 0 < x < 10:` # This is read as: 0 is less than x, and x is less than 10.
