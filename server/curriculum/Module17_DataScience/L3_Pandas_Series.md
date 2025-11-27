# 🐼 Introduction to Pandas Series

The **Pandas** library is the single most important tool for data manipulation and analysis in Python. It builds upon NumPy by adding **labeled indexing**, making your data structures easier to understand and work with.

Pandas introduces two primary data structures: the **Series** (1-dimensional) and the **DataFrame** (2-dimensional).

## 1. The Pandas Series

A Pandas Series is a **one-dimensional labeled array**. It is essentially a column of data, where each element has a label (the **index**).

### Series Components:

1.  **Data:** The actual values (backed by a NumPy `ndarray`).
2.  **Index:** The labels for the data. If not provided, it defaults to a numerical index (0, 1, 2, ...).

## 2. Creating a Series

You can create a Series from a list, a NumPy array, or a dictionary. Using a dictionary is the easiest way to specify a custom index, as the dictionary keys become the index labels.

```python
import pandas as pd # Standard convention to import as 'pd'

# 1. From a List (default numerical index)
s1 = pd.Series([10, 20, 30])
print(s1)
# Output:
# 0    10
# 1    20
# 2    30
# dtype: int64

# 2. From a Dictionary (custom index)
population_dict = {
    'California': 39500000,
    'Texas': 29100000,
    'Florida': 21500000
}
population = pd.Series(population_dict)
print(population)
# Output:
# California    39500000
# Texas         29100000
# Florida       21500000
# dtype: int64
```

## 3. Accessing Data with Labels

Unlike NumPy arrays, which rely on _positional_ integer indexing, Series allows you to use your custom labels for indexing.

You can also still use standard integer indexing for positional access.

```python
# Access by explicit label (the state name)
ca_pop = population['California']
print(f"CA Population: {ca_pop}") # Output: 39500000

# Access by implicit integer position (e.g., the first item)
first_pop = population[0]
print(f"First Population: {first_pop}") # Output: 39500000

# Slicing using *explicit* labels is inclusive of the end label!
subset = population['California':'Texas']
print(subset)
# Output (Includes 'Texas'):
# California    39500000
# Texas         29100000
# dtype: int64
```
