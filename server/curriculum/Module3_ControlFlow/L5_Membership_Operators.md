# 🔍 Membership Operators: `in` and `not in`

When working with lists, strings, or tuples, a common task is checking if a particular item exists within that sequence. **Membership Operators** are specifically designed for this purpose, providing clear and intuitive syntax.

They return a Boolean result: `True` or `False`.

## 1. The `in` Operator

The `in` operator checks if a specified value is a **member** of a sequence (like a list, tuple, or string).

### Checking Lists and Tuples

```python
shopping_list = ["Milk", "Eggs", "Bread"]

if "Eggs" in shopping_list:
    print("Item is in stock.") # This runs

```

```python
door_space = ["Rose"]

if "Jack" in door_space:
    print("Everyone survives!")
else:
    print("Rose is selfish.") # This runs
```

### Checking Strings

The `in` operator can also check if one string is a substring (a sequence of characters) within a larger string.

```python
website = "[www.learningtopy.com](https://www.learningtopy.com)"

if ".com" in website:
    print("This is a commercial site.") # This runs

if "tuple" in website:
    print("Tuple mentioned.") # This does NOT run

```

## 2. The `not in` Operator

The `not in` operator is the opposite of `in`. It checks if a specified value is not a member of a sequence.

```python
admin_roles = ["Super_User", "Admin", "Moderator"]
user_role = "Viewer"

if user_role not in admin_roles:
    print("Access Denied: Not an admin.") # This runs
```

```python
s_club = ["Tina", "Jon", "Paul", "Hannah", "Bradley", "Jo"]
member_to_check = "Rachel"

if member_to_check not in s_club:
    print("Some Girls") # This runs because Rachel isn't in the list
else:
    print("Reach for the stars!")
```

## 3. Combining with Conditionals

Membership operators are frequently used as the condition inside an `if` statement to control program flow based on the presence or absence of data.

Example: Checking User Permissions

```python
premium_features = ["HD_Streaming", "Offline_Mode", "Ad_Free"]
user_plan = "Offline_Mode" # The feature the user wants

if user_plan in premium_features:
    print(f"Feature unlocked: {user_plan}")
else:
    print("Feature not available on your plan.")
```
