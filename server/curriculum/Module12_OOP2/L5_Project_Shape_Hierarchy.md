# 📐 Project: Building a Shape Hierarchy

This final project for Module 12 will test your understanding of Inheritance, `super()`, Method Overriding, and Polymorphism by creating a flexible geometric shape system.

### Project Goal

Design a base `Shape` class and at least two derived classes (`Circle` and `Rectangle`) that accurately calculate their respective area and perimeter using overridden methods. You will then demonstrate polymorphism by processing a list of mixed shape objects.

### Class Requirements

**1. `Shape` (Parent Class)**

- **Constructor** (`__init__`): Takes a `name` parameter and stores it.
- **Methods**:
  - `area(self)`: Should print a message indicating this method needs to be implemented by a child class.
  - `perimeter(self)`: Should print a message indicating this method needs to be implemented by a child class.

**2. `Circle` (Child Class)**

- **Inheritance**: Inherits from `Shape`.
- **Constructor** (`__init__`): Takes `name` and `radius`. _Must use_ `super().__init__` to set the `name`. Stores `radius`.
- **Method Overriding**:
  - `area()`: Calculates and returns the area (Formula: π × r², use 3.14 for π).
  - `perimeter()`: Calculates and returns the perimeter (Formula: 2πr, use 3.14 for π).

**3. `Rectangle` (Child Class)**

- **Inheritance**: Inherits from `Shape`.
- **Constructor** (`__init__`): Takes `name`, `width`, and `height`. _Must use_ `super().__init__` to set the `name`. Stores `width` and `height`.
- **Method Overriding**:
  - `area()`: Calculates and returns the area (Formula: w \* h).
  - `perimeter()`: Calculates and returns the perimeter (Formula: 2(w + h)).

### Project Demonstration

After creating the classes, you must:

1. Instantiate one `Circle` and one `Rectangle`.

2. Create a polymorphic function `calculate_and_display(shapes_list)` that iterates through a list of shapes and calls `shape.area()` and `shape.perimeter()` on each one.
