# 🧱 Abstract Base Classes (ABCs) Brief Introduction

So far, we have relied on the user to correctly implement required methods in a child class. **Abstract Base Classes (ABCs)** allow you to enforce this structure.

An ABC is a blueprint for other classes. It cannot be instantiated itself, but it dictates which methods its child classes must implement. If you try to instantiate an ABC directly, Python will raise a `TypeError`.

## 1. Defining an Abstract Class

To define an abstract class in Python, you need to use the built-in `abc` module and the decorators it provides.

1. Inherit from `ABC` (Abstract Base Class).

2. Use the `@abstractmethod` decorator on any method that the child classes are required to implement.

```python
from abc import ABC, abstractmethod

# The base class inherits from ABC

class PaymentMethod(ABC):

    def process_payment(self, amount):
        """A common method with default behavior."""
        print(f"Attempting to process ${amount}...")
        self.perform_transaction(amount) # Calls the abstract method

    # The abstract method: MUST be implemented by children
    @abstractmethod
    def perform_transaction(self, amount):
        """Placeholder for the specific transaction logic."""
        pass


# 🛑 You cannot instantiate the base class:

# method = PaymentMethod() # Throws an error!
```

## 2. Implementing the Abstract Method

If a child class inherits from an ABC, it must provide a concrete implementation for every method marked with `@abstractmethod`. If it fails to do so, Python will prevent the child class from being instantiated.

```python
# Concrete subclass must implement perform_transaction
class CreditCard(PaymentMethod):
    def perform_transaction(self, amount):
        print(f"CreditCard: Charging ${amount} via network.")
        return True  # Successful transaction

# Another concrete subclass
class BankTransfer(PaymentMethod):
    def perform_transaction(self, amount):
        print(f"BankTransfer: Initiating wire transfer for ${amount}.")
        # Additional logic, maybe security checks
        return True

# Instantiation works because the abstract method is implemented
card = CreditCard()
transfer = BankTransfer()

# Polymorphism in action: calling the common method
card.process_payment(50.00)
transfer.process_payment(1000.00)
```

## 3. Why Use ABCs?

ABCs are primarily used for:

• **Enforcing Contracts**: Guaranteeing that all subclasses adhere to a specific interface (i.e., they all have a `perform_transaction` method).

• **Standardization**: Ensuring code that interacts with the base class (like the `process_payment` method) can rely on the existence of key methods in the children.

This brief look serves as an introduction to how Python enables stronger code contracts for advanced projects.

:::summary

- **Abstract Base Classes (ABCs)** define a blueprint that child classes must follow
- Import `ABC` and `abstractmethod` from the `abc` module
- Abstract classes _cannot be instantiated_ - they only exist to be inherited
- Use the `@abstractmethod` decorator to mark methods that **must** be implemented by child classes
- Child classes must implement **all** abstract methods or they also become abstract classes
- ABCs enforce _contracts_ and ensure consistent interfaces across related classes
- This is especially useful in large projects where multiple developers work on related classes

:::
