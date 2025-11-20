# 🗃️ Basic Data Types: What's in the Box?

A **Data Type** defines the kind of information a variable holds. Python needs to know the type so it knows what operations are allowed (e.g., you can add numbers, but you can't multiply text).

Python automatically figures out the type, but it's essential for you to know them!

## 1. Text: The String (`str`)

Used for all **text** data. You must enclose strings in either single quotes (`'...'`) or double quotes (`"..."`).

```python
favorite_book = "The Hitchhiker's Guide" # Double quotes work
message = 'Hello world!' # Single quotes work too
```

Note: You can use the `type()` function to check a variable's type: `print(type(favorite_book))` will output <class 'str'>.

## 2. Whole Numbers: The Integer `(int)`

Used for whole numbers (positive or negative) without a decimal point.

```python
num_of_students = 30
year_of_birth = 1995
```

Operation Example: You can perform math: `total = num_of_students + 5`

## 3. Decimal Numbers: The Float `(float)`

Used for any number that has a decimal point, even if the decimal value is zero.

```python
pi = 3.14159
height = 6.2 # Requires a decimal point
```

Note: If you write `age = 25`, it's an `int`. If you write `age = 25.0`, it's a `float`.

## 4. `True` or `False`: The Boolean `(bool)`

Used for values that can only be one of two things: `True` or `False`. These are crucial for making decisions in your code (control flow).

```python
is_raining = True # Must start with a CAPITAL letter
is_weekend = False
```

Common Mistake: Writing true or false (lowercase) will cause an error! Always capitalize the T in True and the F in False.

Try It: In the editor, try creating one variable for each of the four data types defined above!
