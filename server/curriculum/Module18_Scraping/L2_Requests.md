# 📥 Fetching HTML Content with `requests`

The first step of web scraping is identical to API interaction: fetching raw data from a server. However, instead of receiving organized JSON, we are fetching a massive, messy string of HTML.

## 1. The Standard Fetch Pattern

Following the pattern from Module 16, we use the `requests` library and the GET method. Because networking is unpredictable (sites go down, WiFi drops), we wrap our request in a `try/except` block.

```python
import requests

url = "http://books.toscrape.com/"

try:
    response = requests.get(url, timeout=10)

    # Check if the request was successful
    response.raise_for_status()

    # Access the HTML content as a string
    html_content = response.text
    print(f"Successfully fetched {len(html_content)} characters.")

except requests.exceptions.HTTPError as http_err:
    print(f"HTTP error occurred: {http_err}")
except Exception as err:
    print(f"An unexpected error occurred: {err}")
```

:::note

What is `raise_for_status()`?

In Module 16, we often checked if `response.status_code == 200`.

`response.raise_for_status()` is a built-in `requests` method that does the heavy lifting for you. If the server returns a "Failure" code (like **404: Not Found** or **500: Server Error**), it automatically raises an exception. This prevents your scraper from trying to process an empty or broken page.
:::

## 2. Setting Headers

Websites can tell the difference between a human using Chrome and a Python script. Some sites block scripts to prevent their servers from being overwhelmed. To fix this, we use **Headers**.

The `User-Agent` is a string that tells the server: "I am a standard web browser on a Windows/Mac computer."

```python
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

```

:::tip

The "Inspect" Trick

Before you write a single line of Python, always open the website in your browser, **Right-Click > Inspect**, and go to the **Network** tab. Refresh the page to see exactly what the server is sending back. This ensures the site isn't using complex JavaScript to hide the data you're looking for!
:::

## 3. Why `.text` and not `.json()`?

When working with APIs, we used `response.json()` to turn data into a Python dictionary. In web scraping, there is no dictionary.

|                    |                                                                                |
| ------------------ | ------------------------------------------------------------------------------ |
| `response.text`    | Returns the content as a **string**. This is what we use for HTML.             |
| `response.content` | Returns the content as **bytes**. This is used for downloading images or PDFs. |

:::note

### 🚦 Scraping Etiquette

Web scraping is a powerful tool, but it must be used responsibly.

- **Check `robots.txt`:** Add `/robots.txt` to the end of any domain (e.g., `google.com/robots.txt`) to see what the site owner allows or forbids.
- **Be Kind to Servers:** A Python script can send requests much faster than a human. Use `import time` and `time.sleep(1)` inside your loops to prevent overwhelming a website’s server.
  :::

You now have the entire web page content in a single string, ready for the next step: **_parsing_**.

:::summary

- `requests.get()` is the primary tool for grabbing a webpage's source code.
- `try/except` blocks are essential to handle connection timeouts or server crashes.
- `raise_for_status()` is a shortcut to ensure the page loaded correctly before proceeding.
- **Headers (User-Agent)** help your script identify itself and avoid being blocked by basic security filters.
- The raw HTML is stored in `response.text` as one long, unorganized string.
  :::
