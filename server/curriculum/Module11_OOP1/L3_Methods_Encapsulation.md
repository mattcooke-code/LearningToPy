# 🏃 Instance Methods and Encapsulation

Objects aren't just containers for data; they also perform actions. In _OOP_, the actions an object can perform are defined by **methods**.

## 1. Instance Methods

An **instance method** is a function defined inside a class that operates on the specific instance (object) it is called on.

:::note
• **Syntax**: Methods look exactly like regular functions, but they must accept `self` as their first parameter.

• **Purpose**: They read or change the instance attributes (the data stored in `self`).
:::

```python
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    # Instance Method to deposit money
    def deposit(self, amount):
        if amount > 0:
            self.balance += amount
            print(f"Deposited ${amount}. New balance: ${self.balance}")
            return True
        return False

    # Instance Method to withdraw money
    def withdraw(self, amount):
        if amount > 0 and self.balance >= amount:
            self.balance -= amount
            print(f"Withdrew ${amount}. New balance: ${self.balance}")
            return True
        elif amount > self.balance:
            print("Withdrawal failed: Insufficient funds.")
            return False
        return False

# Create an object
account = BankAccount("Scrooge McDuck")

# Call the instance methods
account.deposit(500)   # Calls deposit(account, 500) internally
account.withdraw(150)  # Calls withdraw(account, 150) internally
account.withdraw(500)  # Fails due to insufficient funds

print(f"Final balance: ${account.balance}")
```

## 2. Encapsulation: Data Hiding

**Encapsulation** is the principle of bundling data (attributes) and the methods that operate on that data (behaviors) together within one unit (the class). It also involves hiding the internal details of the object and controlling external access to its data.

In Python, we achieve a form of encapsulation using _access modifiers_:

### A. Public Attributes (Standard)

By default, all attributes and methods in Python are public. They can be accessed and modified directly from outside the class.

```python
account = BankAccount("McDuck", 100)
# Direct modification of a public attribute (discouraged practice)
account.balance = 1000000
print(account.balance) # Output: 1000000
```

### B. Private Attributes (The Python Way)

While Python doesn't enforce strict data hiding like some languages, convention dictates that attributes prefixed with a single underscore (`_`) should be treated as **protected** and attributes prefixed with double underscores (`__`) are intended to be **private**.

:::warning
• **Single Underscore** (`_attribute`): Signals to other programmers, "Don't touch this directly." It's a convention only and doesn't prevent access.

• **Double Underscore** (`__attribute`): Triggers name mangling, which Python changes the attribute name internally (e.g., `__balance` becomes `_BankAccount__balance`) making it harder, but not impossible, to access externally. This is generally used to prevent naming conflicts in inheritance (which we'll cover in Module 12).
:::

For basic encapsulation, the single underscore is the most common practice to signal private intent.

```python
class SafeBankAccount:
    def __init__(self, owner, balance=0):
        self._owner = owner        # Use _ for "protected" attributes
        self._balance = balance    # Use _ to signal internal data

    # Accessor (Getter) Method - The approved way to view the balance
    def get_balance(self):
        return self._balance

# Create an object
safe_account = SafeBankAccount("Donald", 200)

# ❌ Direct access is possible, but discouraged by the underscore
safe_account._balance = -500

# ✅ Access the data via the public method
print(safe_account.get_balance()) # Output: -500 (Illustrates Python's soft protection)
```

The benefit of using methods (`deposit`, `withdraw`, `get_balance`) is that they allow you to **validate data** or **add logic** before the internal state of the object (`self._balance`) is changed, which is the core idea of encapsulation.

:::summary

- **Instance Methods:** Functions defined inside a class that can access and modify an object's internal state using the `self` keyword.
- **Encapsulation:** The practice of bundling data and the methods that act on that data into a single unit (a class) while restricting direct access to some of the object's components.
- **Public vs. Private:**
  - _Public:_ Attributes like `self.name` are accessible to everyone.
  - _Protected/Private:_ Attributes starting with `_` or `__` (e.g., `self._balance`) signal that they are internal and should not be modified from outside the class.
- **Validation:** Methods (like `withdraw`) allow the class to perform safety checks (like checking for "insufficient funds") before updating data, preventing the object from entering an "invalid" state.
- **The Python Way:** Python uses "we are all consenting adults here" logic. It doesn't strictly lock you out of private data, but it uses underscores to tell developers "Enter at your own risk."
  :::
