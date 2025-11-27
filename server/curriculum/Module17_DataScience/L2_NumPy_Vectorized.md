# 🚀 Vectorized Operations and Aggregation

The true power of NumPy lies in **vectorization**, which allows you to perform operations on entire arrays at once, without writing explicit `for` loops. This makes code shorter, easier to read, and significantly faster.

## 1. Vectorized Arithmetic

When you apply a standard Python arithmetic operator (`+`, `-`, `*`, `/`) to a NumPy array, the operation is automatically applied **element-wise**.

```python
import numpy as np

arr1 = np.array([10, 20, 30])
arr2 = np.array([1, 2, 3])

# Element-wise addition
result_add = arr1 + arr2
print(f"Addition: {result_add}") # Output: [11 22 33]

# Multiplication by a scalar (Broadcasting)
result_scale = arr1 * 2
print(f"Scaling: {result_scale}") # Output: [20 40 60]

# Conditional/Boolean operations are also vectorized
is_greater_than_25 = arr1 > 25
print(f"Condition: {is_greater_than_25}") # Output: [False False True]
```

The process of applying a single value (like `2` in the example above) to every element of an array is called **broadcasting**.

## 2. Universal Functions (ufuncs)

NumPy provides many built-in functions, often called ufuncs, for fast mathematical operations. These include `np.sqrt()`, `np.log()`, `np.exp()`, and more.

```python
data = np.array([4, 9, 16])
sqrt_data = np.sqrt(data)
print(f"Square Roots: {sqrt_data}") # Output: [2. 3. 4.]
```

## 3. Aggregation Functions

To summarize the data in an array, NumPy offers a set of aggregation functions, which are often available as both module functions (`np.sum()`) and array methods (`array.sum()`).

| Function/Method          | Description                             |
| ------------------------ | --------------------------------------- |
| `.sum()` or `np.sum()`   | Calculates the sum of all elements.     |
| `.mean()` or `np.mean()` | Calculates the average of all elements. |
| `.min()` / `.max()`      | Calculates the minimum/maximum value.   |
| `.std()`                 | Calculates the standard deviation.      |

```python
scores = np.array([85, 92, 78, 95, 88])

print(f"Total Score: {scores.sum()}")
print(f"Average Score: {scores.mean():.2f}")
print(f"Highest Score: {np.max(scores)}")
```
