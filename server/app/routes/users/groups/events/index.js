'use strict'
var router = require('express').Router();
var mongoose = require('mongoose');
var Event = mongoose.model('Event');
//structure

//

router.get('/', function(req, res, next) {
    Event.find({group: req.userGroup})
    	.then(function(events) {
    		res.status(200).json(events);
    	});
});

router.get('/all', function(req, res, next) {
    Event.find({})
    .then(function(events) {
        res.status(200).json(events)
    })
});

// make sure it doesn't treat "all" as an id
router.param('eventId', function(req, res, next, eventId) {
	Event.findById(eventId)
		.then(function(event){
			req.groupEvent = event;
			next();
		});
})

router.get('/:eventId', function(req, res, next) {
	res.status(200).json(req.groupEvent);
});

router.delete('/:eventId', function(req, res, next) {
	req.groupEvent.remove()
		.then(function() {
			res.status(204).end();
		});
});


module.exports = router;
