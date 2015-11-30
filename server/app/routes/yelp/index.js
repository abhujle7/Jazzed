'use strict';
var router = require('express').Router();
module.exports = router;
var Yelp = require('yelp');

var yelp = new Yelp({
  consumer_key: 'P7V5Ey4mu4NW6QVC9HMI2w',
  consumer_secret: 'PI_8nsiPnZ6kYizsrmxI7ngCoBw',
  token: 'tkFntVKytPppbKJwHuluHtYxdI94CEk1',
  token_secret: 'p_iyHYGcxtKnJ5FOzBOr66FrjsI',
});

router.get('/', function(req, res, next) {
	yelp.search({ term: 'marquee', location: '10001' })
	.then(function (data) {
	  res.status(200).json(data);
	})
	.catch(function (err) {
	  console.error(err);
	});
})