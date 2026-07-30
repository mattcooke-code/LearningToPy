# 📐 Project: Building a Shape Hierarchy

Put inheritance, `super()`, method overriding, and polymorphism into practice by building a geometric shape system.

### Your Classes

**`Shape` (Parent Class)**

- `__init__(self, name)` — stores the `name`
- `area(self)` — returns `0` (placeholder for child classes to override)
- `perimeter(self)` — returns `0` (placeholder for child classes to override)

**`Circle(Shape)` (Child Class)**

- `__init__(self, name, radius)` — calls `super().__init__(name)`, stores `radius`
- `area(self)` — returns `3.14 * radius ** 2`
- `perimeter(self)` — returns `2 * 3.14 * radius`

**`Rectangle(Shape)` (Child Class)**

- `__init__(self, name, width, height)` — calls `super().__init__(name)`, stores `width` and `height`
- `area(self)` — returns `width * height`
- `perimeter(self)` — returns `2 * (width + height)`

### Demonstrate Polymorphism

1. Create one `Circle` and one `Rectangle`
2. Write a function `calculate_and_display(shapes_list)` that loops through a list of shapes and prints each shape's `name`, `area`, and `perimeter`
3. Call your function with a list containing both shapes
