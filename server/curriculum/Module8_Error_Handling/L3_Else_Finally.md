# 🔄 Else and Finally Clauses

The `try/except` block can be extended with `else` and `finally` clauses for more precise control over error handling flow.

## 1. The Else Clause

The `else` clause runs **only if no exceptions occurred** in the try block. This helps separate the "happy path" from error handling.

### Syntax

```python
try:
    # Code that might raise an exception
    risky_operation()
except SomeException:
    # Handle the exception
    handle_error()
else:
    # Run only if try block succeeded
    do_success_stuff()
```

### Example: File Processing

```python
try:
    with open("data.txt", "r") as file:
        content = file.read()
except FileNotFoundError:
    print("File not found - using default data")
    content = "default data"
else:
    # This runs only if the file was successfully read
    print(f"Successfully read {len(content)} characters from file")
    process_content(content)
```

## 2. The Finally Clause

The `finally` clause **always runs**, whether an exception occurred or not. It's perfect for cleanup operations.

### Syntax

```python
try:
    # Code that might raise an exception
    risky_operation()
except SomeException:
    # Handle the exception
    handle_error()
finally:
    # This always runs, no matter what
    cleanup_resources()
```

### Example: Resource Cleanup

```python
file = None
try:
    file = open("data.txt", "r")
    content = file.read()
    number = int(content)
except (FileNotFoundError, ValueError) as e:
    print(f"Error: {e}")
finally:
    # Always close the file, even if an error occurred
    if file and not file.closed:
        file.close()
    print("Cleanup completed")
```

## 3. Complete Try/Except/Else/Finally Structure

You can use all four components together:

```python
def process_user_data(filename):
    data = None
    try:
        with open(filename, "r") as file:
            data = file.read()
    except FileNotFoundError:
        print(f"Warning: {filename} not found")
        return None
    except PermissionError:
        print(f"Error: No permission to read {filename}")
        return None
    else:
        print(f"Successfully loaded data from {filename}")
        return data
    finally:
        # This always runs, even if we return early
        print(f"Finished processing {filename}")

# Test the function
result = process_user_data("user_data.txt")
```

## 4. Real-World Use Cases

### Database Connections

```python
connection = None
try:
    connection = connect_to_database()
    data = connection.query("SELECT * FROM users")
except DatabaseError as e:
    print(f"Database error: {e}")
else:
    process_users(data)
finally:
    if connection:
        connection.close()  # Always close the connection
```

### Network Requests

```python
try:
    response = requests.get("https://api.example.com/data")
    response.raise_for_status()  # Raises exception for bad status codes
except requests.RequestException as e:
    print(f"Request failed: {e}")
else:
    # Only process if request succeeded
    data = response.json()
    save_to_database(data)
finally:
    print("Request attempt completed")
```

## 5. Fun Example: Cylon Attack

```python
def launch_vipers(condition):
    print("🔴 ACTION STATIONS! Set Condition One throughout the ship.")

    try:
        print("This is not a drill!")
        if condition != "combat":
            raise ValueError("The starboard launch tube is a gift shop now.")

        print("✅ Viper pilots report to Vipers immediately.")

    except ValueError as alert:
        print(f"❌ {alert}")
    else:
        # This runs only if no exception occurred
        print("🚀 LAUNCH VIPERS! Grab your gun and bring in the cat!")
    finally:
        # This ALWAYS runs
        print("📢 Alert the fleet to emergency jump!")
        print("Spool up the FTL!\n")

# Test different scenarios
print("--- SCENARIO 1: Combat Ready ---")
launch_vipers("combat")

print("--- SCENARIO 2: Not Ready ---")
launch_vipers("retreat")
```

### Output

```text
--- SCENARIO 1: Combat Ready ---
🔴 ACTION STATIONS! Set Condition One throughout the ship.
This is not a drill!
✅ Viper pilots report to Vipers immediately.
🚀 LAUNCH VIPERS! Grab your gun and bring in the cat!
📢 Alert the fleet to emergency jump!
Spool up the FTL!

--- SCENARIO 2: Not Ready ---
🔴 ACTION STATIONS! Set Condition One throughout the ship.
This is not a drill!
❌ The starboard launch tube is a gift shop now.
📢 Alert the fleet to emergency jump!
Spool up the FTL!
```

## 6. Key Points to Remember

• **Else**: Runs only when try block succeeds completely

• **Finally**: Always runs, regardless of exceptions or early returns

• **Order matters**: try → except → else → finally

• **Use finally for cleanup**: File closing, network connection cleanup, resource release

:::summary

- The `else` clause runs **only if no exceptions occurred** in the try block
- The `finally` clause **always runs**, whether an exception occurred or not
- Use `finally` for cleanup operations (closing files, database connections)
- All four parts can be combined: `try` → `except` → `else` → `finally`
- `else` helps separate the **success path** from error handling
- `finally` runs even if you `return` early or raise an exception
- Perfect for **resource management** - ensuring files close, connections terminate

:::
