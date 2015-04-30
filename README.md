## Simple Node XML Scraper

A very simple XML Scraper that will search for all the `<loc></loc>` tags within an XML index sitemap. One-by-one it will then perform an HTTP _GET_ for each of those links, the response for each link will then be crawled and eventually saved into a separate `.csv` file.

### Set-up
- Run `npm install` to install all the dependancies.
```
node app.js --sitemap_index_url=http://www.nytimes-se.com/nytse/sitemap.xml
```
#### Cron
- This node application features a running internal cron job that can be set using a regular cron expression and using the `cron_schedule=` flag within the CLI command for this job. The following command will scrap on the 30 minute marker the specified sitemap.

```bash
node app.js --sitemap_index_url=http://www.nytimes-se.com/nytse/sitemap.xml --cron_schedule="30 * * * *"
```

### Saving
- Files by default are saved into an XML format. Plans for CSV formatting will be made available.
