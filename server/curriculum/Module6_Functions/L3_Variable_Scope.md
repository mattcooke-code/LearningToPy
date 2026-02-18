# 🔭 Scope: Local vs. Global Variables

**Scope** refers to the region of the program where a variable is accessible. In Python, a function creates its own localized environment for variables, which is isolated from the rest of the program.

Python's scope is often described by the **LEGB Rule**: **L**ocal, **E**nclosing, **G**lobal, **B**uilt-in. For introductory functions, we focus on **Local** and **Global**.

## 1. Local Scope

Variables defined **inside** a function are **local** to that function. They only exist while the function is executing and cannot be accessed from outside the function.

```python
def increase_count():
    # 'count' is a local variable
    count = 10
    count += 1
    print(f"Inside function: {count}")

increase_count()
# Inside function: 11

# Trying to access 'count' here causes a NameError
# print(count)
```

## 2. Global Scope

Variables defined outside of any function (at the top level of a module) are considered global variables. They can be read (accessed) from anywhere in the program, including inside any function.

```python
# 'global_max' is a global variable
global_max = 100

def check_value(value):
    # We can read the global variable directly
    if value > global_max:
        print("Value is too high!")
    else:
        print("Value is okay.")

check_value(150) # Output: Value is too high!
```

:::note

- **Local Scope** (The _"Scotty Doesn't Know"_ Rule): In this 2004 song by Lustra, a specific secret exists within a small circle of people (the function). Scotty is outside that circle, so he has **no access** to that information. In Python, if you define a variable inside a function, the rest of the program is "Scotty" — it simply doesn't know that variable exists. The secret stays in the function!
- **Global Scope** (The _"Everybody Hurts"_ Rule): In the R.E.M. classic, "pain" is a global variable. It doesn't matter who you are, everyone has access to it because it is defined at the highest level. A global variable in Python is a common point of reference that any function can read at any time.
  :::

```python
def eurotrip_incident():
    secret = "Scotty doesn't know!"  # 🎵 Local variable - defined INSIDE function
    print(secret)  # Works fine inside

eurotrip_incident()  # Prints: Scotty doesn't know!
print(secret)  # ❌ NameError! Scotty (the program) doesn't know!
```

```python
pain = "everybody hurts sometimes"  # 🎵 Global variable - defined OUTSIDE function

def rem_song():
    print(pain)  # Works - global variables are universal

def cover_band():
    print(pain)  # Also works - everyone can access the pain!

rem_song()      # Prints: everybody hurts sometimes
cover_band()    # Prints: everybody hurts sometimes
print(pain)     # Also works at global level
```

## 3. Modifying Global Variables (The `global` Keyword)

A crucial rule in Python is that you cannot assign a new value to a global variable from within a function without explicitly telling Python your intent.

If you try to assign a value to a variable inside a function, Python assumes you are creating a new, local variable, even if a global one with the same name exists.

To modify a global variable, you can use the `global` keyword:

```python
task_status = "idle" # Global variable

def set_running():
    # ⚠️ Without 'global', this would create a NEW local 'task_status'
    # and the global one would remain "idle".
    global task_status

    # This now modifies the global variable
    task_status = "running"

set_running()
print(task_status) # Output: running

```

:::tip
Avoid using the `global` keyword whenever possible. It makes code harder to follow. Instead, pass the value into the function and return the modified value.
:::

### The Better Way: Reassignment via Return

While the `global` keyword works, there's a cleaner approach that makes your code easier to understand and test. Instead of letting a function "reach out" and change the world around it, we treat the function like a calculator: you give it data, it calculates a result, and it returns that result to be used elsewhere.

**How it works:**

1. **_Pass_** the current value into the function as an argument.
2. **_Return_** the updated value.
3. **_Reassign_** the global variable outside the function.

```python
task_status = "idle"

def update_status(current_status):
    # This function doesn't care about the global variable.
    # It just takes a value and returns a new one.
    return "running"

# We update the global variable by assigning it the result of the function
task_status = update_status(task_status)

print(task_status) # Output: running
```

_Why is this better?_

- **Traceability:** You can clearly see the `=` sign where the variable is being changed.
- **Isolation:** The function doesn't rely on "hidden" variables; it only knows what you pass into it.
- **Safety:** You won't accidentally change a global variable that you didn't mean to.

:::summary

- **Scope** determines where a variable can be seen or used in your code.
- **Local variables** are created inside functions and are inaccessible once the function finishes.
- **Global variables** are defined at the top level and can be read by any function in the script.
- Use the `global` keyword only when you must modify a global variable inside a function.
- **_Best Practice:_** Instead of using globals, pass data into functions as arguments and use `return` to send results back out.

:::
