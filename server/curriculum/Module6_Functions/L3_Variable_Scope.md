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

## 3. Modifying Global Variables (The `global` Keyword)

A crucial rule in Python is that you cannot assign a new value to a global variable from within a function without explicitly telling Python your intent.

If you try to assign a value to a variable inside a function, Python assumes you are creating a new, local variable, even if a global one with the same name exists.

To modify a global variable, you must use the `global` keyword:

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

# Best Practice: Avoid using the 'global' keyword whenever possible.
# It makes code harder to follow. Prefer passing the value into the function and returning the modified value.
```
