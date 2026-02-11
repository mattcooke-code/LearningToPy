# 🗝️ Dictionaries: The Key-Value Store

A **Dictionary** is Python's most powerful and flexible built-in data structure for storing data that needs to be quickly retrieved by name, rather than by index.

Dictionaries are **unordered** (in Python versions before 3.7) or **ordered** (Python 3.7+), **mutable**, and defined by **curly braces** `{}`. They store data in **key-value pairs**.

## 1. Defining a Dictionary

Data in a dictionary is stored as `key: value` pairs, where the key and value are separated by a colon, and the pairs are separated by commas.

- **Key**: Must be **immutable** (usually a string, number, or tuple). It must be **unique**.
- **Value**: Can be any data type (string, list, another dictionary, etc.).

```python
# A simple user dictionary
user_profile = {
    "username": "coder_x",
    "level": 5,
    "is_premium": True
}

# A dictionary with mixed value types
inventory = {
    101: "Laptop",       # Numeric key
    "stock": [5, 3, 7]   # List value
}
```

## 2. Accessing Data

You access the data in a dictionary by referencing its key inside square brackets, similar to how you use an index for a list.

```python
settings = {"theme": "dark", "notifications": True}

# Accessing a value by its key
print(settings["theme"]) # Output: dark

# Changing a value (Dictionaries are mutable)
settings["notifications"] = False
print(settings["notifications"]) # Output: False
```

## 3. The Safe Way to Access: The `.get()` Method

If you try to access a key that doesn't exist using the bracket notation (settings["non_existent_key"]), Python will raise a `KeyError` and crash your program.

The `.get()` method provides a safer alternative because it returns `None` (or a default value you specify) instead of raising an error.

### Syntax: `dictionary.get(key, default_value)`

```python
config = {"timeout": 300}

# Safe access: returns None if 'port' isn't found
port = config.get("port")
print(port) # Output: None

# Safe access with a default value
user_color = config.get("color", "blue")
print(user_color) # Output: blue
```

:::tip
**Default Values:** The second argument to `.get()` is a default value. This is perfect for configuration settings: `retries = config.get("max_retries", 3)`. If "max_retries" isn't in config, it defaults to 3.
:::

:::summary

- Dictionaries store **key-value pairs** using `{key: value}` syntax
- Keys must be **unique and immutable** (strings, numbers, tuples)
- Values can be **any data type** (lists, other dicts, etc.)
- Access values with bracket notation: `dict["key"]`
- Use `.get(key, default)` to safely access without errors
- Dictionaries are **mutable** - you can add/change/remove items

:::
