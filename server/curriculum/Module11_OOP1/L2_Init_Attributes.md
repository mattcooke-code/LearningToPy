# 🛠️ The **init** Constructor and Attributes

While class attributes are shared by all instances, most objects need unique data. This unique data is stored in instance attributes (or properties). To set up these unique attributes when an object is created, we use the special `__init__` method, often called the constructor.

## 1. The `__init__` Constructor

The `__init__` method is automatically called immediately after an object is created. It is used to initialize the object's state (its unique attributes).

:::note
**Dunder Method**: Methods surrounded by double underscores, like `__init__`, are called "dunder" methods (Double UNDERSCORE) and are special methods in Python.
:::

## 2. The `self` Parameter

The first parameter of almost every method in a Python class, including `__init__`, must be `self`.

• **What is `self`**? When you call a method on an object (e.g., `my_car.drive()`), Python automatically passes the object itself as the first argument, and we name this argument `self`.

• **Role in `__init__`**: In `__init__`, self refers to the newly created object. We use it to attach attributes to that specific instance.

```python
class Car: # 1. __init__ accepts the object (self) and two parameters
    # 2. Assign the parameters to instance attributes using self.
    def __init__(self, make, year):
        self.make = make
        self.year = year
        self.engine_running = False # Default attribute
    # These attributes (self.make, self.year) are now unique to this object.

    def start_engine(self):
        self.engine_running = True
        print(f"The {self.make} engine is now running!")

# Instantiation: The values ('Lada', 1970) are passed to **init**

my_car = Car("Lada", 1970)
her_car = Car("Toyota", 2018)

# Accessing Instance Attributes

print(f"My car's make: {my_car.make}") # Output: Lada
print(f"Her car's make: {her_car.make}") # Output: Toyota

# Calling a Method

my_car.start_engine()
```

## 3. Instance Attributes

Instance attributes are variables attached to a specific object. They are what make `my_car` different from `her_car`.

In the example above, `make`, `year`, and `engine_running` are instance attributes. They are created inside `__init__` using the syntax `self.attribute_name = value.`

:::note

### Setting Default Values

You can set default values for attributes directly inside `__init__`. In the `Car` example, `self.engine_running = False` ensures every new car starts with the engine off, regardless of the parameters passed during instantiation.
:::

## 4. Summary of Flow

1. **Creation**: You call the class name like a function (`Car("Austin Metro", 1980)`).

2. **Allocation**: Python creates a new, empty `Car` object in memory.

3. **Initialization**: Python calls the `__init__` method, passing the new object as `self`, and passing your provided arguments (`"Austin Metro"`, `1980`) as the remaining parameters.

4. **Configuration**: Inside `__init__`, you use `self` to set up the object's unique attributes.

5. **Return**: The fully configured object is returned and assigned to your variable (`my_car`).

:::summary

- **The `__init__` Method:** Known as the constructor, this "dunder" (double underscore) method runs automatically the moment a new object is created to set up its initial data.
- **The `self` Parameter:** The mandatory first parameter in class methods. It represents the **_specific instance_** being handled, allowing Python to distinguish between `my_car` and `her_car`.
- **Instance Attributes:** Variables attached to `self` (e.g., `self.make`). Unlike class attributes, these are unique to each individual object.
- **Default Values:** You can assign values inside `__init__` that don't come from arguments (like `self.engine_running = False`) to ensure every object starts with a consistent state.
- **The Lifecycle:** When you call `Car()`, Python creates the object, passes it to `self` in `__init__`, runs your setup code, and finally returns the finished object.

:::
