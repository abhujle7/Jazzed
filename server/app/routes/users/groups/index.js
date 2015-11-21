'use strict'
var router = require('express').Router();
var mongoose = require('mongoose');
var Group = mongoose.model('Group');

//not sure how to access the id here
router.get('/', function(req, res, next) {
	console.log("hey the id is", req.userToFind);
	res.status(200).send("BLAKLSKDFLSKFD");
	// Group.findById()
});

router.param('groupId', function(req, res, next, id) {
	Group.findById(id)
		.then(function(group) {
			req.userGroup = group;
			next();
		})
})

router.get('/:id', function(req, res, next) {
	res.status(200).json(req.userGroup);
})

router.use('/:id/events', require('./events'))


// router.use('/:id/events', require('./events'), function(req, res, next) {
	
// })




router.use('/events', require('./events'))

module.exports = router;
