# 🔑 Calling Parent Methods with super()

When a child class defines its own `__init__` constructor or overrides a method, it often needs to reuse or extend the logic from its parent class. This is where the `super()` function comes in.

## 1. What is `super()`?

The `super()` function returns a temporary object of the parent class (or superclass), allowing you to call methods defined in that parent class.

• **Primary Use**: Calling the parent's `__init__` method from the child's `__init__` method to ensure parent attributes are correctly initialized.

:::note
**Syntax (Python 3+)**: The modern, simpler syntax is just `super().method_name(arguments)`.
:::

## 2. Using `super()` in the Constructor (`__init__`)

If you define a custom `__init__` in the child class, the parent's `__init__` is not automatically called. If the parent class expects attributes to be set, you must call `super().__init__`.

```python
class Vehicle:
    def __init__(self, color, wheels):
        self.color = color
        self.wheels = wheels
        print("--- Vehicle __init__ executed ---")

class Car(Vehicle):
    def __init__(self, color, wheels, model):
        # 1. Call the parent's constructor using super()
        # This initializes 'color' and 'wheels' attributes
        super().__init__(color, wheels)

        # 2. Initialize the child's unique attributes
        self.model = model
        print("--- Car __init__ executed ---")

# Instantiation
my_car = Car(color="Red", wheels=4, model="Sedan")

# Attributes from both parent and child are available
print(f"My car is a {my_car.color} {my_car.model} with {my_car.wheels} wheels.")
```

## 3. Using `super()` with Instance Methods

`super()` is also used to extend (rather than completely replace) a parent method in a child class.

**Scenario**: A `Car` needs a `drive()` method, but it also needs to do what the `Vehicle`'s `drive()` method does first (e.g., check fuel).

```python
class Vehicle:
    def drive(self):
        print("Vehicle is moving.")
        self.is_moving = True

class Truck(Vehicle):
    def drive(self):
        # 1. Execute the parent's drive logic first
        super().drive()

        # 2. Add Truck-specific logic (extending the parent method)
        print("Truck is engaging 4-wheel drive.")
        self.load_secured = True

# Instantiation and Method Call
my_truck = Truck("Blue", 6)
my_truck.drive()

# Output:
# Vehicle is moving.
# Truck is engaging 4-wheel drive.

```

:::note

### Key Takeaway: Delegation

The function of `super()` is to delegate the task to the appropriate method in the parent hierarchy. It allows you to build complex object initialization and behavior by layering specialized code onto reusable parent code.
:::

:::summary

- `super()` returns a temporary object of the parent class, allowing you to call parent methods
- **Primary use:** Calling the parent's `__init__` from the child's `__init__` to ensure proper initialization
- Without `super().__init__`, parent attributes won't be initialized when child defines its own `__init__`
- `super()` can also be used to **extend** parent methods (call parent method, then add child-specific logic)
- Syntax: `super().__init__(arguments)` or `super().method_name(arguments)`
- Always call `super().__init__` **_before_** initializing child-specific attributes
- This pattern ensures proper inheritance hierarchy and code reusability

:::
