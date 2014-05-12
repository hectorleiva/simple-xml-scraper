var http        = require('http');
var XmlStream   = require('xml-stream');
var url         = require('url');
var fs          = require('fs');
var Crawler     = require('simplecrawler');

/**
 * The Index Sitemap that will be crawled for more links
 * @type {String} URL to the sitemap.
 */
var index_sitemap   = '*insert sitemap index url here*'; // *insert your sitemap URL*
var xml_array       = [];

var crawler = Crawler.crawl(sg_index_xml);
var counter = 0;
crawler.interval = 10000;

//  Crawler engage
crawler.on("fetchcomplete", function(queueItem, resBuffer, response) {
    console.log("crawler has received %s (%d bytes)",queueItem.url,resBuffer.length);
    xml_crawler(queueItem.url);
});

function xml_crawler(url_feed) {
    console.log('url_feed: ' + url_feed);

    var request = http.get(url_feed).on('response', function(response) {
        var xml = new XmlStream(response, 'utf8');

        //  The first entry should be where the CSV was generated from
        var source_feed_url = url.parse(url_feed).pathname;
        source_feed_url = source_feed_url + '\n';
        xml_array.push(source_feed_url);

        /**
         * Specify which element within the XML response that you want to have
         * parsed back and placed into the array to save it within the CSV.
         *
         * The current default is: <loc></loc>
         */
        xml.on('endElement: loc', function(xml_item) {
            xml_array.push(xml_item.loc + '\n');
        });

        xml.on('end', function(item) {
            counter++;

            var sitemap_csv_filename = '/sitemap_index_' + counter;

            sitemap_csv_filename = __dirname + sitemap_csv_filename + '.csv';

            process_csv(sitemap_csv_filename, xml_array);

            //  Reset the array
            xml_array = [];

        });

    }); // end of the http request
}

function process_csv(sitemap_csv_filename, xml_array) {
    fs.writeFile(sitemap_csv_filename, xml_array, function(err) {
        if (err) throw err;
    });
    console.log('processed csv, it is now located in : ' + sitemap_csv_filename);
}