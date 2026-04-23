# 🧱 Classes, Objects, and Instantiation

Object-Oriented Programming (OOP) is a paradigm that structures programs around objects, rather than actions and data. It allows you to model real-world entities like "cars," "users," or "bank accounts" in your code.

In Python, the two fundamental concepts of OOP are **Classes** and **Objects**.

## 1. Classes: The Blueprint

A **Class** is like a blueprint or a template. It defines the characteristics (attributes) and behaviors (methods) that all objects created from it will have.

:::note
**Classes** are defined using the `class` keyword, followed by the name (which, by convention, uses `PascalCase` or `CapWords`).
:::

```python
class Dog: # A class definition often starts with a 'pass' or documentation
"""This is a blueprint for creating Dog objects."""
pass

# We have defined the _type_ but have not created any dogs yet.
```

## 2. Objects: The Instance

An **Object** (or instance) is a concrete item built from the class blueprint. You can create many objects from a single class.

| **Class** (Blueprint) | **Object** (Instance)                 |
| --------------------- | ------------------------------------- |
| `Dog`                 | A specific dog named 'Beethoven'      |
| `Car`                 | A Knight Industries Two Thousand      |
| `User`                | A specific user profile in a database |

### Instantiation

**Instantiation** is the process of creating a new object from a class.

```python
# Create two separate, unique objects (instances) from the Dog class

dog1 = Dog()
dog2 = Dog()

print(f"Dog 1 is located at: {dog1}")
print(f"Dog 2 is located at: {dog2}")

# They are unique objects in memory

print(dog1 is dog2) # Output: False
```

## 3. Class Attributes vs. Instance Attributes

For now, we will add a simple class attribute—a variable shared by all objects of that class.

```python
class Robot: # Class Attribute: Shared by all instances
species = "Android"

    def greet(self):
        # A simple method (behavior) that all robots share
        print("Beep boop! Systems online.")

# Instantiation
r2d2 = Robot()
wall_e = Robot()

# They both share the class attribute
print(r2d2.species) # Output: Android
print(wall_e.species) # Output: Android

# But they are distinct entities
print(r2d2 is wall_e) # Output: False (They are separate objects!)

# Calling the method
robot_a.greet() # Output: Beep boop! Systems online.
```

The next lesson will introduce _instance attributes_ which are unique to each object (like `name` or `serial_number`) and are defined using the special `__init__` method.

:::summary

- **OOP Defined:** Object-Oriented Programming is a way to organize code by modeling real-world entities (like "Cars" or "Users") as **_objects_** instead of just a list of functions.
- **The Class (The Blueprint):** A `class` is the template. It defines what data an object will hold and what it can do. Conventionally, these are named using `PascalCase`.
- **The Object (The Instance):** An object is the actual "thing" created from the class blueprint. Multiple unique objects can be created from a single class.
- **Instantiation:** This is the act of creating an object (e.g., `my_dog = Dog()`). Each instance occupies a unique space in the computer's memory.
- **Class Attributes:** Variables defined inside a class but outside any methods. These are **_shared_** by every object created from that class (e.g., all `Robot` instances sharing the species `"Android"`).
- **Methods:** Functions defined inside a class that describe the "behaviors" or actions an object can perform (e.g., a `.greet()` method).
  :::
