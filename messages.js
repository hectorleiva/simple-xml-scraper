var messages = {
  undefined_sitemap: "'sitemap_index_url' is unspecified, please use the argument --sitemap_index_url= to designate the address to the sitemap url",
  improper_sitemap_url: "Enter a proper URL indlucing http:// pointing to your sitemap index you wish to crawl.",
  cron_schedule: '\nYou are able to set-up a custom cron-schedule via the command line for this process \nUsing the following flag: --cron_schedule=\n',
  cron_set: function(expression) {
    return 'Cron set to: ' + expression;
  },
  error_cron: 'Error parsing cron. Cron expression submitted is not properly formatted: ',
  error_status_code: function(statusCode) {
    return 'Status code was ' + statusCode + '. Not parsing the result because it was not a 200 OK.';
  }
};
module.exports = messages;
