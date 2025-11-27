# 📊 NumPy Arrays and Why They Matter

While Python's built-in `list` is incredibly versatile, it has two major drawbacks when dealing with large-scale numerical data: **speed** and **memory efficiency**. The **NumPy** library, short for Numerical Python, solves both issues by introducing the **`ndarray`** (N-dimensional array) structure.

## 1. The NumPy `ndarray`

The `ndarray` is a container for large datasets that are typically **homogeneous** (all elements are of the same type, like integers or floats). This homogeneity is key to its performance advantage over Python lists, which can hold elements of different types.

### Key Benefits:

1.  **Faster Operations:** NumPy operations are implemented in C, making them drastically faster than pure Python loop-based operations.
2.  **Less Memory:** Storing uniform data types is more memory-efficient.

## 2. Creating an `ndarray`

The most common way to create an `ndarray` is from a standard Python list using the `numpy.array()` function.

```python
import numpy as np # Standard convention to import as 'np'

# 1D Array (Vector)
data_list = [10, 20, 30, 40, 50]
my_array = np.array(data_list)
print(my_array) # Output: [10 20 30 40 50]

# 2D Array (Matrix)
data_nested_list = [[1, 2, 3], [4, 5, 6]]
my_matrix = np.array(data_nested_list)
print(my_matrix)
# Output:
# [[1 2 3]
#  [4 5 6]]
```

## 3. Essential Array Attributes

Every `ndarray` has useful attributes that describe its structure:

| Attribute | Description                                                                       | Example (for my_matrix)      |
| --------- | --------------------------------------------------------------------------------- | ---------------------------- |
| `.dtype`  | The data type of the elements (e.g., `int64`, `float64`).                         | `int64`                      |
| `.shape`  | A tuple indicating the size of the array in each dimension (rows, columns, etc.). | `(2, 3)` (2 rows, 3 columns) |
| `.ndim`   | The number of dimensions (e.g., 1 for a vector, 2 for a matrix).                  | `2`                          |
| `.size`   | The total number of elements in the array.                                        | `6`                          |

```python
print(f"Shape: {my_matrix.shape}")
print(f"Dimensions: {my_matrix.ndim}")
print(f"Data Type: {my_matrix.dtype}")
```
