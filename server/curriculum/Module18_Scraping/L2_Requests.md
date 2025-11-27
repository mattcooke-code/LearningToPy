# 📥 Fetching HTML Content with `requests`

The first step of web scraping is identical to API interaction (Module 16): fetching the raw data from the server. We use the **`requests`** library to make a `GET` request to the target URL.

## 1. Making the Request

A successful `requests.get()` call returns a response object. Unlike an API where we expect JSON, for scraping we want the raw HTML content.

```python
import requests

url = "[http://toscrape.com/](http://toscrape.com/)" # A site designed for learning to scrape
response = requests.get(url)

if response.status_code == 200:
    # Use .text to get the raw HTML content as a giant string
    html_content = response.text

    # Print a snippet of the HTML (e.g., the first 500 characters)
    print(html_content[:500])
else:
    print(f"Failed to fetch page. Status code: {response.status_code}")
```

## 2. Setting Headers and Handling Errors

When scraping, you should always set a **User-Agent header** to identify your script. Some websites block requests that don't look like they come from a real browser.

```python
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

response = requests.get(url, headers=headers)

# It's good practice to use raise_for_status() to quickly check for errors
try:
    response.raise_for_status() # Raises an HTTPError for bad status codes (4xx or 5xx)
    print("Successfully fetched HTML.")
    # Proceed to parsing...
except requests.exceptions.HTTPError as err:
    print(f"HTTP Error occurred: {err}")
```

You now have the entire web page content in a single string, ready for the next step: parsing.
