'use strict';
var router = require('express').Router();
module.exports = router;
var Yelp = require('yelp');

var yelp = new Yelp({
  consumer_key: 'P7V5Ey4mu4NW6QVC9HMI2w',
  consumer_secret: 'PI_8nsiPnZ6kYizsrmxI7ngCoBw',
  token: '6lqEDYk_vUnBCq3mAwtrSCWJfIA3U1v5',
  token_secret: 'iqEuhDwWWdnfLcJVBCaJwbwadVM',
});

router.get('/', function(req, res, next) {
	yelp.search({ term: 'italian', location: '10004' })
	.then(function (data) {
	  res.status(200).json(data);
	})
	.catch(function (err) {
	  console.error(err);
	});
})