# 🏷️ Project: Basic Web Scraping Etiquette and Data Storage

A good web scraper is ethical, responsible, and capable of saving its results for later analysis (like in Module 17 with Pandas).

## 1. Ethical Scraping: `robots.txt`

Before scraping any website, you should check its `robots.txt` file. This is a standard file located at the site's root (`https://example.com/robots.txt`) that specifies which parts of the site automated crawlers **should not** access.

- **Respect the Rules:** If `robots.txt` says you shouldn't scrape a directory, don't.
- **Rate Limiting:** Don't hammer a server with requests. Always include a small delay (`time.sleep(1)`) between requests to avoid overwhelming the site and getting blocked.

## 2. Project Goal: Scraping and Saving Data

This project combines all the steps:

1.  **Request:** Use `requests` to fetch the HTML.
2.  **Parse:** Use `BeautifulSoup` to create the navigable object.
3.  **Extract:** Use tag, class, and ID selectors to pull out specific pieces of text (e.g., all quotes and authors).
4.  **Structure:** Organize the extracted data into a Python **List of Dictionaries** (which is ready for saving to JSON or CSV).
5.  **Save:** Use **File I/O** (Module 7) to save the results.

```python
# Example of data structuring after extraction
data_to_save = []
# ... inside your loop over scraped elements ...
data_to_save.append({
    'quote': quote_text,
    'author': author_name
})
```

Your final deliverable will be a script that extracts structured data from a mock page and saves it into a file.
