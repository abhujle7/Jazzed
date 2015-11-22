'use strict'
var router = require('express').Router();
var mongoose = require('mongoose');
var Event = mongoose.model('Event');

router.get('/', function(req, res, next) {
	Event.find({})
	.then(function(events) {
		res.status(200).json(events);
	})
});

router.param('eventId', function(req, res, next, eventId) {
	Event.findById(eventId)
		.then(function(event) {
			req.event = event;
			next();
		})
})

router.get('/:eventId', function(req, res, next) {
	res.status(200).json(req.event);
})

// router.get('/:eventId/events', function(req, res, next) {
// 	req.userGroup.populate('events')
// 		.then(function(group) {
// 			res.status(200).json(group.events);
// 		})
// })

router.delete('/:eventId', function(req, res, next) {
	req.event.remove()
		.then(function() {
			res.status(204).end();
		});
});



module.exports = router;
