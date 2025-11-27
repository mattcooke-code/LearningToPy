# 🥣 Parsing HTML with `BeautifulSoup`

The raw HTML string obtained from `requests` is difficult to work with. The **`BeautifulSoup`** library (often imported as `bs4`) takes that string and turns it into a Python object that can be easily searched and navigated using methods.

## 1. Initializing the Parser

You pass the raw HTML content and a parser name (like `'html.parser'`) to the `BeautifulSoup` constructor to create the object.

```python
from bs4 import BeautifulSoup
import requests

url = "[http://quotes.toscrape.com/](http://quotes.toscrape.com/)"
response = requests.get(url)
html_content = response.text

# Create a BeautifulSoup object
soup = BeautifulSoup(html_content, 'html.parser')

# Print the title tag of the page
page_title = soup.title
print(f"Title Tag: {page_title}")
print(f"Title Text: {page_title.text}") # .text extracts only the content inside the tag
```

## 2. Finding Elements by Tag

The simplest way to find content is by using the tag name directly on the `soup` object.

| Method                 | Purpose                           | Returns                         |
| ---------------------- | --------------------------------- | ------------------------------- |
| `soup.find('tag')`     | Finds the first matching element. | A single `Tag` object.          |
| `soup.find_all('tag')` | Finds all matching elements.      | A Python List of `Tag` objects. |

```python
# Find the first <h1> tag
first_header = soup.find('h1')
print(f"\nFirst Header: {first_header.text}")

# Find all <div> tags
all_divs = soup.find_all('div')
print(f"Total Divs Found: {len(all_divs)}")
```

## 3. Extracting Text and Attributes

Once you have a `Tag` object:

• Use the `.text` property to get the clean string content inside the tag.

• Treat the tag like a dictionary to access its attributes.

```python
# Example: finding the first <a> tag (link)
first_link = soup.find('a')

# Extract the text
link_text = first_link.text

# Extract the attribute (href)
link_url = first_link['href'] # Accessing 'href' like a dictionary key

print(f"\nLink Text: {link_text}")
print(f"Link URL: {link_url}")
```
