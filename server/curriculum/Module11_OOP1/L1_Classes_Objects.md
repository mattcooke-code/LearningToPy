# 🧱 Classes, Objects, and Instantiation

Object-Oriented Programming (OOP) is a paradigm that structures programs around objects, rather than actions and data. It allows you to model real-world entities like "cars," "users," or "bank accounts" in your code.

In Python, the two fundamental concepts of OOP are **Classes** and Objects.

## 1. Classes: The Blueprint

A **Class** is like a blueprint or a template. It defines the characteristics (attributes) and behaviors (methods) that all objects created from it will have.

• **Syntax**: Classes are defined using the `class` keyword, followed by the name (which, by convention, uses `PascalCase` or `CapWords`).

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
| `Dog`                 | A specific dog named 'Buddy'          |
| `Car`                 | A red Tesla Model S                   |
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
        print("Hello! I am a Robot.")

# Instantiation

robot_a = Robot()
robot_b = Robot()

# Accessing the shared class attribute

print(robot_a.species) # Output: Android
print(robot_b.species) # Output: Android

# Calling the method

robot_a.greet() # Output: Hello! I am a Robot.
```

The next lesson will introduce instance attributes which are unique to each object (like `name` or `serial_number`) and are defined using the special `__init__` method.
