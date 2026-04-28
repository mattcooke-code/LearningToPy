# 🥣 Parsing HTML with `BeautifulSoup`

The raw HTML string obtained from `requests` is difficult to work with. The **`BeautifulSoup`** library (often imported as `bs4`) acts like a translator. It takes that giant string and builds a Python object that mimics the **DOM Tree** we learned about in Lesson 1.

## 1. Initializing the Parser

To start, we "feed" the HTML string into `BeautifulSoup` and specify a parser (the engine that reads the code).

```python
from bs4 import BeautifulSoup
import requests

url = "http://quotes.toscrape.com"
response = requests.get(url)
html_content = response.text

# Create a BeautifulSoup object
soup = BeautifulSoup(html_content, 'html.parser')

# Print the title tag of the page
page_title = soup.title
print(f"Title Tag: {page_title}")
print(f"Title Text: {page_title.text}") # .text extracts only the content inside the tag
```

When you write `BeautifulSoup(html_content, 'html.parser')`, you are telling the library which **engine** to use to read the code.

- **`html.parser`:** This is built into Python. It’s convenient because you don't have to install anything extra, and it’s great for beginners.
- **Why does it matter?** Different engines have different "personalities." Some are very strict (if the HTML is missing a tag, they might fail), while others are "lenient" and will try to fix broken HTML for you.

## 2. Finding Elements by Tag

When you run `BeautifulSoup(html_content, 'html.parser')`, the "builder" (parser) reads the raw string of HTML and constructs a 3D model of the house (the DOM tree). Once that model is built, `find()` and `find_all()` act as your search tools to navigate it.

| Method                 | Purpose                             | Returns                         |
| ---------------------- | ----------------------------------- | ------------------------------- |
| `soup.find('tag')`     | Finds the _first_ matching element. | A single `Tag` object.          |
| `soup.find_all('tag')` | Finds _all_ matching elements.      | A Python List of `Tag` objects. |

```python
# Find the first <h1> tag
first_header = soup.find('h1')
print(f"\nFirst Header: {first_header.text}")

# Find all <div> tags
all_divs = soup.find_all('div')
print(f"Total Divs Found: {len(all_divs)}")
```

:::warning
Common Beginner Error: You cannot use `.text` on the result of `find_all()` because it is a list, not a single element.

- `soup.find('h1')`: You are asking the parser to point to the very first `<h1>` branch it built. Because it’s a single branch, you can immediately 'grab the fruit' (`.text`).
- `soup.find_all('h1')`: You are asking the parser to gather every `<h1>` branch it found into a 'bucket' (a Python List), so you have to grab each piece of fruit one by one.

Therefore, running `soup.find_all('h1').text` will **crash your program!** You must loop through the list to get the text of each item!
:::

```python
# Finding all quotes on a page
quotes = soup.find_all('span', class_='text')

for quote in quotes:
    print(quote.text)
```

## 3. Extracting Text and Attributes

Remember those **Classes** and **IDs**? This is where they become essential. If you only search for `<div>`, you might get 100 results. If you search for a `div` with a specific `class`, you get exactly what you need.

```python
# Finding an element by tag AND attribute
product = soup.find('div', class_='product-card')

# Accessing attributes like a Dictionary
# If the tag is <a href="http://example.com">...</a>
link = soup.find('a')
url = link['href']
```

:::tip

**The `class_` Underscore**

In Python, `class` is a reserved keyword (used to create classes). Because of this, BeautifulSoup uses `class_` (with an underscore) when you are searching for a CSS class.

❌ **Wrong:** `soup.find('div', class='header')`

✅ **Right:** `soup.find('div', class_='header')`
:::

:::summary

- `BeautifulSoup(html, 'html.parser')` converts a raw string into a searchable Python object.
- `.text` strips away the HTML tags and gives you only the human-readable words.
- `find()` is for unique items; `find_all()` is for lists (like product names or headlines).
- **Attributes** (like `href` or `src`) are accessed using square brackets `['key']`, just like a Python dictionary.
- Use the `class_` parameter to filter elements by their CSS class without breaking Python's syntax.
  :::
