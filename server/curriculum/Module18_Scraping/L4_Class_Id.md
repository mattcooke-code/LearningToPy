# 🎯 Locating Data with Class and ID

Relying solely on tag names is often too general. The most reliable way to pinpoint specific data is by using **CSS selectors**—specifically, the `class` and `id` attributes.

## 1. Using the `id` Attribute

An `id` is designed to be **unique** to a single element on a webpage. It is the most "surgical" way to scrape a specific piece of data.

In BeautifulSoup, you use the `id` keyword argument in the `find()` method.

```python
# HTML: <div id="product-price">12.99</div>
price_div = soup.find(id='product-price')
print(f"Price: {price_div.text}")
```

## 2. Using the `class` Attribute

The `class` attribute is used to group elements with similar styling (e.g., all product titles might have the class `item-title`).

:::note
**The Underscore Rule:** Because `class` is a reserved word in Python (used to define classes), BeautifulSoup uses `class_` (with a trailing underscore) to avoid a syntax error.
:::

```python
# HTML: <span class="product-price">$19.99</span>
all_prices = soup.find_all('span', class_='product-price')

for price in all_prices:
    print(f"Price found: {price.text}")
```

## 3. Narrowing the Scope (Chaining)

You can chain `find()` and `find_all()` calls to search only within a specific parent element, which is useful for narrowing down your search.

```python
# Find the main container first
main_container = soup.find('div', class_='main-content')

# Now, find all links *only* within that container
container_links = main_container.find_all('a')
print(f"Found {len(container_links)} links in the main content.")
```

:::tip

**Refining your Search**

You can combine tags and classes for maximum precision. Instead of searching for _any_ element with `class_='btn'`, search for `soup.find_all('a', class_='btn')`. This ensures you only get links and skip any buttons or divs using that same class.
:::

:::summary

- `id` is for finding a **unique**, single element.
- `class_` is for finding **groups** of similar elements (remember the underscore!).
- **Chaining** involves finding a "Parent" element first to limit your search area.
- Combining **Tag + Attribute** (e.g., `find('p', class_='bio')`) is the most reliable way to avoid "noise" or irrelevant data.
  :::
