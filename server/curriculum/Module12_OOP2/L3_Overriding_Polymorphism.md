# 🔄 Method Overriding and Polymorphism

Inheritance allows child classes to reuse parent behavior. **Method Overriding** allows them to change that behavior, and **Polymorphism** allows us to treat all related objects as if they were the parent type.

## 1. Method Overriding

**Method Overriding** is the process of redefining a method in the child class that is already defined in the parent class.

When an instance of the child class calls that method, Python executes the child's version instead of the parent's.

```python
class Animal:
    def speak(self):
        print("The animal makes a generic sound.")

class Cat(Animal):
    # This method overrides the parent's speak() method
    def speak(self):
        print("Meow!")

class Dog(Animal):
    # This method overrides the parent's speak() method
    def speak(self):
        print("Woof!")

generic_animal = Animal()
garfield = Cat()
potsworth = Dog()

generic_animal.speak() # Output: The animal makes a generic sound.
garfield.speak()       # Output: Meow! (Child method used)
potsworth.speak()          # Output: Woof! (Child method used)
```

:::tip
If you need to run the parent's logic and add custom logic, use `super()` inside the child's overridden method (as shown in _Lesson 12.2_).
:::

## 2. Introduction to Polymorphism

**Polymorphism** literally means "many forms." In OOP, it refers to the ability of different objects to respond to the same method call (e.g., `speak()`) in their own, unique ways.

Polymorphism allows you to write generic code that works with objects of different, but related, classes.

### Example of Polymorphism

Consider the `Animal`, `Cat`, and `Dog` classes above; all of which have a `speak()` method.

```python
# A list containing objects of different types

zoo = [Animal(), Cat(), Dog()]

# We can iterate through the list and call the same method on every object.

# The _correct_ version of speak() is automatically called for each object.

print("--- Polymorphic Behavior ---")
for creature in zoo:
creature.speak()

# Output:

# The animal makes a generic sound.

# Meow!

# Woof!
```

This demonstrates that the code handling the loop doesn't care if the object is a `Cat` or a `Dog`; it only cares that it has a `speak()` method. This flexibility is the core benefit of polymorphism, leading to cleaner, more maintainable code.

## 3. Polymorphism with Functions

Polymorphism isn't limited to class inheritance. Python functions can also be polymorphic, meaning they can operate on data of different types.

For example, the built-in `len()` function works on lists, strings, tuples, dictionaries, and sets, all of which implement the `__len__` magic method differently.

:::summary

- **Method Overriding** allows a child class to redefine a method inherited from its parent
- Overridden methods are called based on the _actual object type_, not the variable type
- **Polymorphism** means "many forms" - the same method call can behave differently on different objects
- Polymorphism enables writing **generic code** that works with any object implementing the required methods
- The `print_area()` function exercise below shows polymorphism: it works with any shape that has an `area()` method
- Benefits of polymorphism: **_flexibility_**, **_reusability_**, and **_maintainability_**

:::
