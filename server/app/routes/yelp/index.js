'use strict';
var router = require('express').Router();
module.exports = router;
var Yelp = require('yelp');
var keys = require('./variables.js')

var yelp = new Yelp({
  consumer_key: keys.key,
  consumer_secret: keys.secret,
  token: keys.token,
  token_secret: keys.tsecret
});

router.get('/', function(req, res, next) {
	yelp.search({ term: req.query.query, location: req.query.area})
	.then(function (data) {
	  res.status(200).json(data);
	})
	.catch(function (err) {
	  console.error(err);
	});
})