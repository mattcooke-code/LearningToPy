# 📊 Class Variables and Static Methods

This lesson explores elements that belong to the class itself, rather than a specific instance (object).

## 1. Class Variables (Attributes)

A **Class Variable** (or class attribute) is a variable defined directly inside the class but outside of any method. It is shared by all instances of that class.

• **Purpose**: To store data that is common to all objects of that type, or to track overall state related to the class (e.g., a count of all objects created).

• **Access**: It is accessed using the class name (`ClassName.variable`) or through an instance (`instance.variable`).

```python
class Settings: # Class Attribute: Shared across all instances
version = "1.0.1"

    # Class Attribute: Tracking the number of configurations
    config_count = 0

    def __init__(self, theme):
        self.theme = theme # Instance Attribute
        Settings.config_count += 1

# Accessing the class variable via the Class

print(f"Current version: {Settings.version}") # Output: 1.0.1

config1 = Settings("dark")
config2 = Settings("light")

# Accessing the class variable via an instance (shows the shared value)

print(f"Config 1 theme: {config1.theme}, Version: {config1.version}")

# Output: Config 1 theme: dark, Version: 1.0.1

# The count is shared

print(f"Total configurations: {Settings.config_count}") # Output: 2
```

## 2. Static Methods

A **Static Method** is essentially a regular function that is logically grouped within a class. It does not operate on the instance or the class.

• **Decorator**: It must be marked with the `@staticmethod` decorator.

• **Parameters**: It takes no special first argument (`self` or `cls`).

• **Purpose**: It is used for utility or helper functions that belong to the class namespace but don't need to interact with any object data.

```python
class Validator:

    @staticmethod
    def is_valid_email(email_address):
        """Checks if a string looks like a simple email address."""
        # This function doesn't need to know about any Validator instance
        # or the Validator class itself.
        if "@" in email_address and "." in email_address:
            return True
        return False

# Call the static method directly on the Class (most common)

print(f"Is 'test@example.com' valid? {Validator.is_valid_email('test@example.com')}")

# Output: True

# Call the static method on an instance (still the same behavior)

v = Validator()
print(f"Is 'bad-email' valid? {v.is_valid_email('bad-email')}")

# Output: False
```

### Summary

| Element        | Scope                     | How to Define                           | Key Use                                |
| -------------- | ------------------------- | --------------------------------------- | -------------------------------------- |
| Class Variable | Shared across all objects | Defined in class body (outside methods) | Shared constants, object counters      |
| Static Method  | Class-bound function      | Defined with `@staticmethod`            | Utility functions, simple calculations |
