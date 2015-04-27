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
    writeFile   = Q.denodeify(fs.writeFile),
    mkDir       = Q.denodeify(fs.mkdir);

var crawl,
    index_sitemap,
    format,
    crawler,
    cron_expression,
    rendered_sitemaps_folder = __dirname + '/rendered_sitemaps',
    cronJob,
    dir_perm = 0766,
    conditionID;

/**
 *  Determine if directory can be written
 */
mkDir(rendered_sitemaps_folder, dir_perm)
  .then(null, function(err){
    if(err.errno !== 47) {
      throw new Error(err);
    }
  });

/**
 * The Index Sitemap that will be crawled for more links
 * @type {String} URL to the sitemap.
 */
if (argv.sitemap_index_url === undefined) {
    var errorMsg = "'sitemap_index_url' is unspecified, please use the argument --sitemap_index_url= to designate the address to the sitemap url";
    throw new Error(errorMsg);
}

//  Validate if it is a valid URL
index_sitemap = validate(argv.sitemap_index_url);
if (index_sitemap === false) {
    var errorMsg = "Enter a proper URL including http:// pointing to your sitemap index";
    throw new Error(errorMsg);
}

if (argv.cron_schedule === undefined) {
  console.log('\nYou are able to set-up a custom cron-schedule via the command line for this process' + '\n'
      + 'Using the following flag: --cron_schedule=' + '\n');
} else {
  try {
    cron_parser.parseExpression(argv.cron_schedule);
    if (argv.cron_schedule) {
      cron_expression = argv.cron_schedule
      console.log('Cron set to: ', cron_expression);
    } else {
      console.log('\n Cron Expression is empty, please submit a proper cron expression. \n');
    }
  } catch (err) {
    throw new Error('Error parsing cron. Cron expression submitted is not properly formatted: ', err);
  }
}

switch (argv.format) {
    case undefined:
        format = 'xml';
        break;
    case 'xml':
        format = 'xml';
        break;
}

console.log("Format to save is set to " + format);
console.log("Crawling: " + index_sitemap + '\n');

var httpGet = function(opts) {
  var deferred = Q.defer();

  http.get(opts, function(res) {
    deferred.resolve(res);
  }).on('error', function(e) {
    deferred.reject(e);
  });

  return deferred.promise;
};

var write_dir = function(dir_name) {
  var deferred = Q.defer();
  if (!fs.existsSync(dir_name)) {
      fs.mkdirSync(dir_name, 0766, function(err) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve();
        }
      });
  } else {
    deferred.resolve();
  }

  return deferred.promise;
}

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

/**
 * Strips the ending of the file_name within the sitemap to whatever other
 * extension you want. Does not actually change the file itself in any way.
 *
 * @param sitemap_filename $sitemap_filename
 * @param format $format
 * @access public
 * @return string
 */
function format_file(sitemap_filename, format) {
  if (format !== 'xml') {
    sitemap_filename = sitemap_filename.replace(/xml/g, format);
  }
  return sitemap_filename;
}

/**
 * Hits the URL, awaits a response, then parses the response
 *
 * @param url_feed $url_feed
 * @param format $format
 * @access public
 * @return void
 */
function jobCrawler(url_feed, format) {
  if (format == 'xml') {
    httpGet(url_feed).then(function(res) {
      res.setEncoding('utf8');
      if (res.statusCode === 200) {
        return res;
      } else {
        throw new Error('Status code was ' + res.statusCode + '. Not parsing because it was not a 200 OK.')
      }
    }).then(function(res) {
      loadBody(res)
        .then(function(body) {
          var host_name = url.parse(url_feed).hostname;
          var file_name = format_file(url.parse(url_feed).pathname, format);
          var dir_path  = rendered_sitemaps_folder+'/'+host_name;
          var file_path = dir_path+file_name;

          mkDir(dir_path, dir_perm)
            .then(function() {
              console.log('Directory ' + dir_path + ' has been written');

              return writeFile(file_path, body).then(function() {
                console.log('File written in: ', file_path);
              }, function() {
                console.log('Unable to write file to: ', file_path);
              });
            }, function(err) {
              if(err.errno === 47) {
                return writeFile(file_path, body).then(function() {
                  console.log('File written in: ', file_path);
                }, function() {
                  console.log('Unable to write file to: ', file_path);
                });
              } else {
                console.log(err);
              }
            });

        }, console.error);
    }, console.error);
  }
};

function initiate_crawl(crawler, Crawler, index_sitemap, format) {
  crawler = Crawler.crawl(index_sitemap);
  crawler.interval = 2000; // 1000 = 1 second

  crawler.on("fetchcomplete", function(queueItem, resBuffer, response) {
    console.log("crawler has received %s (%d bytes)",queueItem.url,resBuffer.length);
    jobCrawler(queueItem.url, format);
  });

  //  Only parse XML documents and ignore all other links
  conditionID = crawler.addFetchCondition(function(parsedURL) {
    return parsedURL.path.match(/\.xml$/i);
  });

  crawler.on("complete", function(err, response) {
    if (err) throw err;
    console.log("Crawler has completed crawling the sitemap index.");
  });
}


if (cron_expression) {
  cronJob = schedule.scheduleJob(cron_expression, function() {
    initiate_crawl(crawler, Crawler, index_sitemap, format);
  });
} else {
  initiate_crawl(crawler, Crawler, index_sitemap, format);
}

