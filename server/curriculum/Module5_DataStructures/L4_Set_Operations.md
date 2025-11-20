# 🧮 Set Operations: Union, Intersection, and Difference

Sets are unique among Python's data structures because they support mathematical **set theory operations**. These are used to combine or compare two or more sets to produce a new resulting set.

These operations are often visualized using **Venn Diagrams**.

[Image of Venn diagrams illustrating set union, intersection, and difference]

## 1. Union: Combining Sets

The **Union** of two sets includes all elements that are present in **either** set. Duplicates are automatically removed in the final result.

### Syntax: `set1 | set2` or `set1.union(set2)`

```python
set_a = {1, 2, 3}
set_b = {3, 4, 5}

# Using the operator
all_elements = set_a | set_b
print(all_elements) # Output: {1, 2, 3, 4, 5}

# Using the method
all_elements_method = set_a.union(set_b)

```

## 2. Intersection: Finding Common Elements

The Intersection of two sets includes only the elements that are present in both sets.

### Syntax: `set1 & set2` or `set1.intersection(set2)`

```python
developers = {"Alex", "Ben", "Chris"}
testers = {"Chris", "Diana", "Ben"}

# Using the operator
common_staff = developers & testers
print(common_staff) # Output: {"Ben", "Chris"}
```

## 3. Difference: Finding Unique Elements

The Difference operation finds elements present in the first set but not in the second set. The order matters!

### Syntax: `set1 - set2` or `set1.difference(set2)`

```python
us_cities = {"NY", "LA", "Chicago"}
eu_cities = {"London", "Paris", "NY"}

# Cities in the US set, but NOT in the EU set
us_only = us_cities - eu_cities
print(us_only) # Output: {"LA", "Chicago"}

# Cities in the EU set, but NOT in the US set
eu_only = eu_cities - us_cities
print(eu_only) # Output: {"London", "Paris"}
```

## 4. Symmetric Difference (Bonus)

The Symmetric Difference includes all elements that are in either set, but not in their intersection (the elements that are unique to each set).

### Syntax: `set1 ^ set2` or `set1.symmetric_difference(set2)`

```python
s1 = {1, 2, 3}
s2 = {3, 4, 5}

# Elements unique to each set: {1, 2} from s1 and {4, 5} from s2
unique_to_each = s1 ^ s2
print(unique_to_each) # Output: {1, 2, 4, 5}
```
