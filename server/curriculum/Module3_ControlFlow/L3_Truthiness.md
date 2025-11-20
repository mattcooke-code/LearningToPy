# ✨ Truthiness and Falsiness

In Python, an `if` statement doesn't strictly require a comparison operator (like `==` or `>`). Any value, regardless of its type, can be interpreted as either **True** or **False** in a conditional context. This is known as **Truthiness**.

This feature lets you write much cleaner code, like checking if a list has contents without checking its length.

## 1. Falsy Values

A value is considered **Falsy** (evaluates to `False`) if it is empty or zero. There are only a few Falsy values in Python, and it's essential to memorize them:

1.  **Numeric Zero:** The integers `0` and floating-point `0.0`.
2.  **Empty Sequences:** Empty strings (`""`), empty lists (`[]`), empty tuples (`()`).
3.  **Empty Mappings:** Empty dictionaries (`{}`) and empty sets.
4.  **Special Constant:** The keyword `None`.
5.  **Boolean:** `False` itself.

## 2. Truthy Values

Any value that is **not Falsy** is considered **Truthy** (evaluates to `True`).

Examples of Truthy values:

- Any non-zero number (e.g., `1`, `-10`, `3.14`).
- Any non-empty sequence (e.g., `'Hello'`, `[1, 2]`, `(5,)`).
- The special constant `True` itself.

## 3. Writing Pythonic Conditionals

Using truthiness allows for concise, idiomatic Python code. Instead of verbose checks, you can simply use the variable.

### Example 1: Checking a List

Instead of:

```python
user_list = [10, 20]
if len(user_list) > 0: # Checks length
    print("List is not empty.")

```

Write the Pythonic way:

```python
user_list = [10, 20]
if user_list: # Checks if the list is Truthy (not empty)
    print("List is not empty.")
```

### Example 2: Checking a String

Instead of checking if a string is empty:

```python
username = ""
if username != "":
    print("Username provided.")
```

Write the Pythonic way:

```python
username = ""
if username: # Checks if the string is Truthy (not empty)
    print("Username provided.")
else:
    print("Please enter a username.") # Runs because "" is Falsy
```
