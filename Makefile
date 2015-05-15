mocha=@./node_modules/.bin/mocha
sitemap=--sitemap_index_url=http://www.nytimes-se.com/nytse/sitemap.xml
test-without=spec/spec.without-sitemap.js
test-sitemap=spec/spec.with-sitemap.js

test-with-sitemap:
	$(mocha) $(test-sitemap) $(sitemap)
test-without-sitemap:
	$(mocha) $(test-without)
test_%:
	$(mocha) test/spec.$*.js

test: test-with-sitemap test-without-sitemap
