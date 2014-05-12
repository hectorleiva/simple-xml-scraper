## Simple Node XML Scraper

A very simple XML Scraper that will search for all the `<loc></loc>` tags within an XML index sitemap. One-by-one it will then perform an HTTP _GET_ for each of those links, the response for each link will then be crawled and eventually saved into a seperate `.csv` file.


### Set-up
- Run `npm install` to install all the dependancies.
- The `var index_sitemap` must be set to root _index_ part of the sitemap that contains all the other links

### Saving
- CSV files will be saved with the following filename format `sitemap_index_` + _index value_