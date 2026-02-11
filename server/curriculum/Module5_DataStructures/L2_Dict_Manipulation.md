# 🛠️ Dictionary Methods and Iteration

Dictionaries are mutable, meaning you can easily add, remove, and change their key-value pairs. Since they are key-based, their iteration methods are different from those used for lists or tuples.

## 1. Modifying Dictionaries

### A. Adding and Updating Items

You use bracket notation (`[]`) to both add new pairs and update existing ones. If the key already exists, the value is overwritten; if the key is new, the pair is added.

```python
config = {"theme": "dark"}

# Adding a new key-value pair
config["language"] = "en"
# config is now: {'theme': 'dark', 'language': 'en'}

# Updating an existing key's value
config["theme"] = "light"
# config is now: {'theme': 'light', 'language': 'en'}
```

:::warning
**Don't Change Dict Size While Iterating:** Like lists, avoid adding or removing keys from a dictionary while iterating over it (e.g., in a `for` loop). This can cause unexpected behavior. If you need to modify, iterate over a copy: `for key in list(dict.keys()):`
:::

### B. Removing Items: `.pop()` and `del`

`.pop(key)`: Removes the item associated with the specified key and returns the removed value. This is the safer method, as you can retrieve the value you just deleted.

`del`: A statement that permanently removes a key-value pair. It does not return the value.

```python
user = {"name": "Alex", "points": 100, "temp_data": 5}

# Use .pop() to remove a key and store the removed value
temp_value = user.pop("temp_data")
print(f"Removed data: {temp_value}") # Output: 5

# Use del to remove a key
del user["points"]
# user is now: {'name': 'Alex'}
```

## 2. Iterating Over Dictionaries

You cannot loop through a dictionary directly like you do a list, as Python needs to know if you want the keys, the values, or both.

### A. Looping Over Keys `.keys()`:

This is the default if you iterate over a dictionary directly, but using `.keys()` makes it explicit.

```python
stats = {"hp": 100, "mp": 50, "sp": 75}

for key in stats.keys():
    print(key)
# Output: hp, mp, sp
```

### B. Looping Over Values `.values()`:

Use this when you only need to process the data and not the labels.

```python
for value in stats.values():
    # Use value directly in a calculation
    print(value * 2)
# Output: 200, 100, 150
```

### C. Looping Over Pairs `.items()`:

This is the most common and powerful way to iterate. The `.items()` method returns key-value pairs as a tuple in each iteration, which you can unpack directly into two loop variables.

```python
for key, value in stats.items():
    print(f"The {key} is set to {value}.")

# Output:
# The hp is set to 100.
# The mp is set to 50.
# The sp is set to 75.
```

**Another example with Star Trek crew:**

```python
# USS Enterprise crew roster
crew = {
    "Captain": "James T. Kirk",
    "First Officer": "Spock",
    "Chief Medical Officer": "Leonard McCoy",
    "Chief Engineer": "Montgomery Scott"
}

for rank, name in crew.items():
    print(f"{rank}: {name}")

# Output:
# Captain: James T. Kirk
# First Officer: Spock
# Chief Medical Officer: Leonard McCoy
# Chief Engineer: Montgomery Scott
```

:::tip
**Dictionary Comprehensions:** Like list comprehensions but for dictionaries! `{key: value for key, value in original_dict.items() if condition}`. You'll learn more about comprehensions in advanced modules, but it's good to know they exist.
:::

:::summary

- **Add/update**: `dict["new_key"] = value` or `dict["existing_key"] = new_value`
- **Remove**: Use `.pop(key)` to remove and get value back, or `del dict[key]` for permanent deletion
- **Iterate**:
  - `.keys()` for keys only
  - `.values()` for values only
  - `.items()` for both (returns key-value tuples)
- **`.items()`** is most common - unpack in loop: `for key, value in dict.items():`

:::
