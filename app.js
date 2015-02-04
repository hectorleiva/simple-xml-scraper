var http        = require('http');
    XmlStream   = require('xml-stream');
    url         = require('url');
    fs          = require('fs');
    validate    = require('url-validator');
    argv        = require('minimist')(process.argv.slice(2));
    Crawler     = require('simplecrawler');

var crawl
    , index_sitemap
    , format
    , crawler
    , res_data
    , http_get_options
    , rendered_sitemaps_folder
    , conditionID

/**
 * The Index Sitemap that will be crawled for more links
 * @type {String} URL to the sitemap.
 */
if (argv.site === undefined) {
    console.log("'sitemap_index_url' is unspecified, please use the argument --sitemap_index_url= to designate the address to the sitemap url");
    process.exit();
}

//  Validate if it is a valid URL
index_sitemap = validate(argv.site);
if (index_sitemap === false) {
    console.log("Enter a proper URL including http:// pointing to your sitemap index");
    process.exit();
}

switch (argv.format) {
    case undefined:
        format = 'xml';
        break;
    case 'xml':
        format = 'xml';
        break;
    case 'csv':
        format = 'csv';
        break;
}

console.log("Format set to " + format + ".");
console.log("Crawling: " + index_sitemap + '\n');

crawler = Crawler.crawl(index_sitemap);
crawler.interval = 10000;

rendered_sitemaps_folder = __dirname + '/rendered_sitemaps';

if (!fs.existsSync(rendered_sitemaps_folder)) {
    fs.mkdirSync(rendered_sitemaps_folder, 0766, function(err) {
        if (err) throw err
    });
}

//  Crawler engage
crawler.on("fetchcomplete", function(queueItem, resBuffer, response) {
    console.log("crawler has received %s (%d bytes)",queueItem.url,resBuffer.length);
    job_crawler(queueItem.url);
});

//  Only parse XML documents and ignore all other links
conditionID = crawler.addFetchCondition(function(parsedURL) {
    return parsedURL.path.match(/\.xml$/i);
});

crawler.on("complete", function(err, response) {
    if (err) throw err;
    console.log("Crawler has completed crawling the sitemap index.");
});


function job_crawler(url_feed) {
    sitemap_filename = rendered_sitemaps_folder + url.parse(url_feed).pathname;

    if (format == 'xml') {
        //  Just pass in the vanilla XML to be saved as a file
        http.get(url_feed, function(res) {
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                res_data += chunk;
            });
            res.on('end', function() {
                process_file(sitemap_filename, res_data, format);
                //  Reset the res_data for the new sitemap
                res_data = null;
            });
        });
    } else {
        var request = http.get(url_feed).on('response', function(response) {
            response.setEncoding('utf8');
            var xml = new XmlStream(response);

            /**
            * Specify which element within the XML response that you want to have
            * parsed back and placed into the array to save it within the CSV.
            *
            * The current default is: <loc></loc>
            */
            xml.on('endElement: loc', function(xml_item) {
                res_data.push(xml_item.loc + '\n');
            });

            xml.on('end', function(item) {
                process_file(sitemap_filename, res_data, format);

                //  Reset the array
                res_data = [];

            });
        }); // end of the http request
    }
}

function process_file(sitemap_filename, data, format) {

    if (format !== 'xml') {
        sitemap_filename = sitemap_filename.replace(/xml/g, format);
    }
    fs.writeFile(sitemap_filename, data, function(err) {
        if (err) throw err;
    });
    console.log("processed " + format + ", it is now located in : " + sitemap_filename);
}
