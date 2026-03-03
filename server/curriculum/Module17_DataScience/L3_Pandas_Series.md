# 🐼 Introduction to Pandas Series

The **Pandas** library is the single most important tool for data manipulation and analysis in Python. It builds upon NumPy by adding **labeled indexing**, making your data structures easier to understand and work with.

Pandas introduces two primary data structures: the **Series** (1-dimensional) and the **DataFrame** (2-dimensional).

## 1. The Pandas Series

A Pandas Series is a **one-dimensional labeled array**. It is essentially a column of data, where each element has a label (the **index**).

| Series Components | Description                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------ |
| _Data_            | The actual values (backed by a NumPy `ndarray`).                                           |
| _Index_           | The labels for the data. If not provided, it defaults to a numerical index (0, 1, 2, ...). |

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

# 2. From a Dictionary (custom index) 👽
informant_dict = {
    "Informant 1": "Deep Throat",
    "Informant 2": "Mr. X",
    "Informant 3": "Marita Covarrubias"
}

trust_no1 = pd.Series(informant_dict)
print(trust_no1)
# Output:
# Informant 1        Deep Throat
# Informant 2              Mr. X
# Informant 3    Marita Covarrubias
# dtype: object
```

:::note
**Index Types:** The index can be strings (like our informants), integers, or even dates. This flexibility is what makes Pandas so powerful for real-world data where rows often have meaningful labels rather than just numbers.
:::

:::warning
**Remember Case Sensitivity:** note the syntax `pd.Series()`. You must use a capital `S`!
:::

## 3. Accessing Data with Labels

Unlike NumPy arrays, which rely on _positional_ integer indexing, Series allows you to use your custom labels for indexing.

You can also still use standard integer indexing for positional access.

```python
# Access by explicit label (who is Informant 3?)
informant_3 = trust_no1['Informant 3']
print(f"Informant 3 is: {informant_3}")  # Output: Marita Covarrubias

# Access by implicit integer position (the second item)
second_informant = trust_no1[1]
print(f"Second informant: {second_informant}")  # Output: Mr. X

# Slicing using *explicit* labels is inclusive of the end label!
subset = trust_no1['Informant 1':'Informant 2']
print(subset)
# Output (Includes both Informant 1 AND Informant 2):
# Informant 1    Deep Throat
# Informant 2          Mr. X
# dtype: object
```

:::tip
**Label-based slicing is inclusive!** Unlike standard Python slicing (which excludes the end), Pandas includes both the start and end labels when slicing by index. This is important to remember when working with labeled data.
:::

## 4. Vectorized Operations with Series

Just like NumPy arrays, Series support vectorized operations while preserving labels.

```python
# Let's add a new informant (because you can never have too many secrets!)
trust_no_1['Informant 4'] = "Alex Krycek"
print(trust_no_1)
# Output includes our new informant

# Convert to uppercase (vectorized string operation)
uppercase_informants = trust_no_1.str.upper()
print(uppercase_informants)
# All names are now in uppercase, labels preserved!

# The truth is out there... but can you trust these informants?
print(f"Total informants: {len(trust_no_1)}")
```

This combination of labeled data and vectorized operations is what makes Pandas indispensable for real-world data analysis.

:::summary

- **Pandas** is Python's primary library for data manipulation, built on top of NumPy
- **Series** is a one-dimensional labeled array, like a column of data with row labels
- Create Series from:
  - Lists (gets default numerical index 0,1,2...)
  - Dictionaries (keys become index labels, values become data)
- Key features:
  - **Labeled indexing** - access data by meaningful names, not just positions
  - **Dual indexing** - use either labels or integer positions
  - **Inclusive slicing** - label-based slicing includes the end label (different from Python!)
- Series preserve labels during operations, making data analysis more intuitive
- Import convention: `import pandas as pd`

:::
