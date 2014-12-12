var
	cheerio = require('cheerio'),
	request = require('./request'),

	baseHost = '.craigslist.org',
	defaultRequestOptions = {
		hostname : '',
		path : '',
	    secure : true
	},
	searchMaxAsk = '&maxAsk=',
	searchMinAsk = '&minAsk=';
	// searchPath = '/search/sss?sort=rel&query=';

    var initialize = (function (self) {
	'use strict';

	self = self || {};
	self.options = {};
	/*
		Accepts string of HTML and parses that string to find all pertinent listings.
	*/
	self.getListings = function (options, html) {
		var
			$ = cheerio.load(html),
			listing = {},
			listings = [];

		$('div.content').find('p.row').each(function (i, element) {
			listing = {
				category : $(element)
					.find('span.l2 a.gc')
					.text(),
				coordinates : {
					lat : $(element).attr('data-latitude'),
					lon : $(element).attr('data-longitude')
				},
				date : $(element)
					.find('span.date')
					.text(),
				hasPic : ($(element)
					.find('span.l2 span.p')
					.text()
					.trim()) !== '',
				location : $(element)
					.find('span.pnr small')
					.text()
					.replace(/[\(,\)]/g, '').trim(), // santize
				pid : $(element)
					.attr('data-pid'),
				price : $(element)
					.find('span.l2 span.price')
					.text()
					.replace(/^\&\#x0024\;/g, ''), // sanitize
				title : $(element)
					.find('span.pl a')
					.text().trim()
				// url :
				// 	(options.secure ? 'https://' : 'http://') +
				// 	options.hostname + $(element).find('span.pl a').attr('href')
			}
			var rurl = $(element).find('span.pl a').attr('href');
			if (rurl) {
			  if (rurl.indexOf('http') == -1)
			    rurl = (options.secure ? 'https://' : 'http://') + options.hostname + rurl
			  listing.url = rurl;
		    }
		    if (options.cityName)
		      listing.cityName = options.cityName


			if (listing.hasPic) {
				var dId = $(element).find('a.i').attr('data-id')
				if (dId)
				  listing.pic = 'http://images.craigslist.org/' + dId.substring(2) + '_300x300.jpg'
			}
			var d = $(element).find('span.date')
			if (!d  ||  d.text().length == 0) {
				d = $(element).find('time').attr('datetime')
				listing.date = d;
			}			

			// make sure lat / lon is valid
			if (typeof listing.coordinates.lat === 'undefined' ||
				typeof listing.coordinates.lon === 'undefined') {
				delete listing.coordinates;
			}

			listings.push(listing);
		});

		return listings;
	}


	/*
		options = {
			city : '',
			maxAsk : '',
			minAsk : '',
		}
	*/
	self.search = function (options, query, callback) {
		if (typeof query === 'function' && typeof callback === 'undefined') {
			callback = query;
			query = options;
			options = {};
		}

        // The original set of options will have something like 
        //
        //  options = {
		//   city: 'newyork',
		//   category: 'tia', 
		//   hasPic: 1,
		//   fullListing: true, 
		//   offset: 100,     
		//   query: 'concert'
		// }
		//
		// only if particular listing's url is known then we can request the listing's page and description
		//
        // var isFullDescriptionRequest = options.fullListing  &&  options.path
		options = getRequestOptions(options, query);

		self.request.get(options, function (err, data) {
		if (err) 
		  return callback(err)
			

   //          if (options.allCities)
   //            return callback(null, getCities(options, data))
   //          if (options.rss)
   //            return callback(null, getRssListings(options, data))
   //          if (isFullDescriptionRequest)
   //            return callback(null, getDescription(options, data))
   //          if (options.categoriesOnly)
   //            return callback(null, getCategories(options, data))
			
			// return callback(null, getListings(options, data))
        return callback(options, data)
  	  });
	};

	/*
		the module
	*/
	return function (options) {
		options = options || {};

		self.options = options;
		self.request = request.initialize();
		return self;
	};
}({}));

exports = module.exports = initialize;
exports.initialize = initialize;
