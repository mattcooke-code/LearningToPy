# 📊 NumPy Arrays and Why They Matter

While Python's built-in `list` is incredibly versatile, it has two major drawbacks when dealing with large-scale numerical data: **speed** and **memory efficiency**. The **NumPy** library, short for _Numerical Python_, solves both issues by introducing the **`ndarray`** (N-dimensional array) structure.

## 1. The NumPy `ndarray`

The `ndarray` is a container for large datasets that are typically **homogeneous** (all elements are of the same type, like integers or floats). This homogeneity is key to its performance advantage over Python lists, which can hold elements of different types.

:::note

### Key Benefits:

1.  **Faster Operations:** NumPy operations are implemented in C (the programming language Python is built on), making them drastically faster than pure Python loop-based operations.
2.  **Less Memory:** Storing uniform data types is more memory-efficient.
    :::

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
| `.dtype`  | The specific data type of the elements (e.g., `int64`, `float64`).                | `int64`                      |
| `.shape`  | A tuple indicating the size of the array in each dimension (rows, columns, etc.). | `(2, 3)` (2 rows, 3 columns) |
| `.ndim`   | The number of dimensions (e.g., 1 for a vector, 2 for a matrix).                  | `2`                          |
| `.size`   | The total number of elements in the array.                                        | `6`                          |

:::note

### What does the '64' mean?

The number represents **bits**. An `int64` uses 64 bits of memory to store a single number.

- `int64`: A 64-bit integer (can store very large whole numbers).
- `float64`: A 64-bit floating-point number (used for decimals; provides high precision).

Because every element in a NumPy array is the same size (e.g., all are exactly 64 bits), NumPy knows exactly where each element starts and ends in memory, which is why it's so fast!
:::

```python
print(f"Shape: {my_matrix.shape}")
print(f"Dimensions: {my_matrix.ndim}")
print(f"Data Type: {my_matrix.dtype}")
```

:::summary

- **NumPy** (Numerical Python) provides the `ndarray` for efficient numerical computing
- **`ndarray` vs. lists**: Arrays are **homogeneous** (all elements same type), faster, and more memory-efficient
- **Create arrays** with `np.array()` from Python lists
- **Key array attributes**:
  - `.shape` - tuple of array dimensions (rows, columns)
  - `.ndim` - number of dimensions (1D vector, 2D matrix)
  - `.size` - total number of elements
  - `.dtype` - data type of elements (e.g., `int64`, `float64`)
- **Performance advantage**: NumPy operations run in C, making them much faster than Python loops
- **Import convention**: Always `import numpy as np`

:::
