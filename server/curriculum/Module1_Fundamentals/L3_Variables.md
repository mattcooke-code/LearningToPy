# 📦 Variables: The Labelled Box

In programming, we need a way to store and retrieve data. That's where **variables** come in.

Think of a variable as a **labelled storage box**. The label is the **variable name** (e.g., `user_age`), and the box holds the **value** (e.g., `25`).

## 1. Creating and Assigning

In Python, you create a variable using the **assignment operator**, which is the single equals sign (`=`).

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

- They must start with a letter `(a-z, A-Z)` or an underscore `(_)`.

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

## What You've Learned

- Variables store data using the assignment operator `=`
- Variable names must follow Python's naming rules
- Use `snake_case` for variable names (Python convention)
- Variables are case sensitive
- Use `print()` to display variable values

Now you're ready to practice! In the challenge below, you'll create two variables using proper naming conventions and print their values.
