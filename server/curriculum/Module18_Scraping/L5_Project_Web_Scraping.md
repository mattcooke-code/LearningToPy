# 🏷️ Project: Data Extraction and Storage

## Goal: The "Quotes to Data" Pipeline

This project is the culmination of everything you've learned about Python so far. You will build a script that fetches data, parses it, structures it into a collection of dictionaries, and saves it to a permanent file.

## Project Requirements

Your script must perform the following five steps:

1. **The Fetch:** Use `requests` with a proper `User-Agent` header to get the HTML from the target site.
2. **The Parse:** Initialize `BeautifulSoup` using the `html.parser`.
3. **The Extract:** Use a loop to find all "Quote" containers on the page. From each container, extract:
   - The **Text** of the quote.
   - The **Author** name.
   - The **Tags** associated with that quote (e.g., "life", "inspiration").
4. **The Structure:** Append each quote's data into a _List of Dictionaries_.
5. **The Save:** Use Python's `json` or `csv module` (referencing Module 7) to save your list to a file named `scraped_quotes.json`.
