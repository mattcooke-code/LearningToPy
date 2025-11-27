# 🎯 Locating Data with Class and ID

Relying solely on tag names is often too general. The most reliable way to pinpoint specific data is by using **CSS selectors**—specifically, the `class` and `id` attributes.

## 1. Using the `id` Attribute

The `id` attribute is meant to be **unique** on a page, making it the fastest and most reliable way to find a single element.

In BeautifulSoup, you use the `id` keyword argument in the `find()` method.

```python
# HTML: <div id="product-price">12.99</div>
price_div = soup.find(id='product-price')
print(f"Price: {price_div.text}")
```

## 2. Using the class Attribute

The `class` attribute is used to group elements with similar styling (e.g., all product titles might have the class `item-title`).

The Python keyword `class` is reserved, so in BeautifulSoup, the keyword argument is `class_` (with a trailing underscore).

```python
# HTML: <span class="price-old">$19.99</span>
old_prices = soup.find_all('span', class_='price-old')

for price in old_prices:
    print(f"Old Price: {price.text}")
```

## 3. Finding Children and Descendants

You can chain `find()` and `find_all()` calls to search only within a specific parent element, which is useful for narrowing down your search.

```python
# Find the main container first
main_container = soup.find('div', class_='main-content')

# Now, find all links *only* within that container
container_links = main_container.find_all('a')
print(f"Found {len(container_links)} links in the main content.")
```

This hierarchical search prevents you from accidentally grabbing elements from the navigation bar or footer.
