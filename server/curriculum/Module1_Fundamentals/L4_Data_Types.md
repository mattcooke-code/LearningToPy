# 🗃️ Basic Data Types: What's in the Box?

A **data type** defines the kind of information a variable holds. Python needs to know the type so it knows what operations are allowed (e.g., you can add numbers, but you can't multiply text).

Python automatically figures out the type, but it's essential for you to understand them!

## 1. Text: The String (`str`)

Used for all **text** data. You must enclose strings in either single quotes (`'...'`) or double quotes (`"..."`).

```python
favorite_book = "The Hitchhiker's Guide" # Double quotes work
message = 'So Long and Thanks for All The Fish!' # Single quotes work too
```

## 2. Whole Numbers: The Integer (`int`)

Used for whole numbers (positive or negative) without a decimal point.

```python
num_of_students = 30
year_of_birth = 1995
temperature = -5
```

Operation Example: You can perform mathematical operations: `total = num_of_students + 5`

## 3. Decimal Numbers: The Float (`float`)

Used for any number that has a decimal point, even if the decimal value is zero.

```python
pi = 3.14159
height = 6.2
price = 19.99
```

**Important:** If you write `age = 25`, it's an `int`. If you write `age = 25.0`, it's a `float`.

## 4. True or False: The Boolean (`bool`)

Used for values that can only be one of two things: `True` or `False`. These are crucial for making decisions in your code (we'll learn about this soon!).

```python
is_raining = True  # Must start with a CAPITAL letter
is_weekend = False
has_permission = True
```

**Common Mistake:** Writing `true` or `false` (lowercase) will cause an error! Always capitalize: `True` and `False`.

## Checking Data Types

You can use the `type()` function to check what type a variable is:

```python
name = "Alice"
age = 25
height = 5.8
is_student = True

print(type(name))       # Output: <class 'str'>
print(type(age))        # Output: <class 'int'>
print(type(height))     # Output: <class 'float'>
print(type(is_student)) # Output: <class 'bool'>
```

## What You've Learned

- **Strings (`str`)** hold text and need quotation marks
- **Integers (`int`)** hold whole numbers with no decimal point
- **Floats (`float`)** hold numbers with decimal points
- **Booleans (`bool`)** hold `True` or `False` (capitalized!)
- Use `type()` to check a variable's data type

Now let's practice! In the challenge below, you'll create variables of each type and verify them using the `type()` function.
