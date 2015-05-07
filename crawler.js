var http        = require('http'),
    XmlStream   = require('xml-stream'),
    url         = require('url'),
    fs          = require('fs'),
    validate    = require('url-validator'),
    argv        = require('minimist')(process.argv.slice(2)),
    Q           = require('q'),
    Crawler     = require('simplecrawler'),
    schedule    = require('node-schedule'),
    cron_parser = require('cron-parser'),
    msg         = require('./messages.js'),
    _fs         = require('./filesystem.js');

var crawl,
    index_sitemap,
    format,
    crawler,
    cron_expression,
    rendered_sitemaps_folder = __dirname + '/rendered_sitemaps',
    cronJob,
    dir_perm = 0766,
    conditionID;

var crawlerApp = {
  init: function(argv) {
    /**
    *  Determine if directory can be written
    */
    _fs.mkDir(rendered_sitemaps_folder, dir_perm);
    var args = module.exports.args(argv.sitemap_index_url, argv.cron_schedule, argv.format);

    console.log("Format to save is set to " + args.format);
    console.log("Index sitemap to crawl: " + args.index_sitemap + '\n');

    if (args.cron_expression) {
        cronJob = schedule.scheduleJob(args.cron_expression, function() {
        module.exports.crawlerInit(crawler, Crawler, args);
      });
    } else {
      module.exports.crawlerInit(crawler, Crawler, args);
    }
  },
  args: function(sitemap_index_url, cron_schedule, format) {
    var setup_args = {};

    /**
      * The Index Sitemap that will be crawled for more links
      * @type {String} URL to the sitemap.
      */
    if (sitemap_index_url === undefined) {
      throw new Error(msg.undefined_sitemap);
    }

    //  Validate if it is a valid URL
    var index_sitemap = validate(sitemap_index_url);
    if (index_sitemap === false) {
      throw new Error(msg.improper_sitemap_url);
    }

    setup_args.sitemap_index_url = sitemap_index_url;

    if (cron_schedule === undefined) {
      console.log(msg.cron_schedule);
    } else {
      try {
        cron_parser.parseExpression(cron_schedule);
        if (cron_schedule) {
          cron_expression = cron_schedule;
          console.log(msg.cron_set(cron_expression));
        }
      } catch (err) {
        throw new Error(msg.error_cron);
      }
    }

    setup_args.cron_schedule = cron_schedule;

    switch (format) {
      case undefined:
          setup_args.format = 'xml';
          break;
      case 'xml':
          setup_args.format = 'xml';
          break;
    }

    return setup_args;
  },
  httpGet: function(opts) {
    var deferred = Q.defer();

    http.get(opts, function(res) {
      deferred.resolve(res);
    }).on('error', function(e) {
      deferred.reject(e);
    });

    return deferred.promise;
  },
  loadBody: function(res) {
    var loadBody = function(res) {
      var deferred = Q.defer();
      var body = '';
      res.on("data", function(chunk) {
        body += chunk;
      });
      res.on("end", function() {
        deferred.resolve(body);
      });
      return deferred.promise;
    }
  },
  /**
    * Strips the ending of the file_name within the sitemap to whatever other
    * extension you want. Does not actually change the file itself in any way.
    *
    * @param sitemap_filename $sitemap_filename
    * @param format $format
    * @access public
    * @return string
    */
  formatFile: function(sitemap_filename, format) {
    if (format !== 'xml') {
      sitemap_filename = sitemap_filename.replace(/xml/g, format);
    }
    return sitemap_filename;
  },
  crawlerInit: function(crawler, Crawler, args) {
    crawler = Crawler.crawl(args.sitemap_index_url);
    crawler.interval = 2000; // 1000 = 1 second

    crawler.on("fetchcomplete", function(queueItem, resBuffer, response) {
      console.log("crawler has received %s (%d bytes)",queueItem.url,resBuffer.length);
      module.exports.jobCrawler(queueItem.url, args.format);
    });

    //  Only parse XML documents and ignore all other links
    conditionID = crawler.addFetchCondition(function(parsedURL) {
      return parsedURL.path.match(/\.xml$/i);
    });

    crawler.on("complete", function(err, response) {
      if (err) throw err;
      console.log("Crawler has completed crawling the sitemap index.");
    });
  },
  /**
    * Hits the URL, awaits a response, then parses the response
    *
    * @param url_feed $url_feed
    * @param format $format
    * @access public
    * @return void
    */
  jobCrawler: function(url_feed, format) {
    if (format === 'xml') {
      module.exports.httpGet(url_feed, format)
          .then(function(res) {
            res.setEncoding('utf8');
            if (res.statusCode === 200) {
              return res;
            } else {
              throw new Error(msg.error_status_code(res.statusCode));
            }
          })
          .then(function(res) {
            module.exports.loadBody(res)
              .then(function(body) {
                var host_name = url.parse(url_feed).hostname;
                var file_name = format_file(url.parse(url_feed).pathname, format);
                var dir_path  = rendered_sitemaps_folder+'/'+host_name;
                var file_path = dir_path+file_name;

                _fs.mkDir(dir_path, dir_perm, file_path, body)
                  .then(function(file_path, file_body) {
                    var file_s = {
                      file_path: file_path,
                      body: body
                    };
                    return file_s;
                  }, function(err) {
                    if (err.errno === 47) { // File already exists
                      var file_s = {
                        file_path: file_path,
                        body: body
                      };
                      return file_s;
                    } else {
                      throw new Error(err);
                    }
                  })
                  .then(function(file_info) {
                    _fs.mkFile(file_info.file_path, file_info.body);
                  }, function(err) {
                    throw new Error(err);
                  });
              }, console.error);
          }, console.error);
    }
  }
};

module.exports = crawlerApp;
