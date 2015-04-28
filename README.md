## Simple Node XML Scraper

A very simple XML Scraper that will search for all the `<loc></loc>` tags within an XML index sitemap. One-by-one it will then perform an HTTP _GET_ for each of those links, the response for each link will then be crawled and eventually saved into a separate `.csv` file.

### Set-up
- Run `npm install` to install all the dependancies.
```
node app.js --site=http://www.nytimes-se.com/nytse/sitemap.xml
```

### Saving
- Files by default are saved into an XML format. Plans for CSV formatting will be made available.
