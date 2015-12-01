'use strict';
var router = require('express').Router();
module.exports = router;
var showtimes = require('showtimes');
var s = showtimes(10001, {});
 
router.get('/:id', function(req, res, next) {
	var s = showtimes(req.params.id, {});
	s.getTheaters(function (err, theaters) {
		res.status(200).json(theaters);
	})
})

router.get('/:id/theaters', function(req, res, next) {
	var s = showtimes(req.params.id, {});
	s.getTheaters(function (err, response) {
		var theaters = [];
		response.forEach(function(theater) {
			theaters.push(theater.name)
		})
	  res.status(200).json(theaters.slice(0, 5))
	});
})