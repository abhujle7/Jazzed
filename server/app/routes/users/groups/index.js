'use strict'
var router = require('express').Router();
var mongoose = require('mongoose');
var Group = mongoose.model('Group');

router.get('/', function(req, res, next) {
	Group.find({ $or: [{ "users" : req.userToFind }, { "admins" : req.userToFind }]})
	.then(function(groups) {
		res.status(200).json(groups);
	});
});

router.get('/all', function(req, res, next) {
	Group.find({})
	.then(function(groups) {
		res.status(200).json(groups);
	})
});

router.param('groupId', function(req, res, next, groupId) {
	Group.findById(groupId)
		.then(function(group) {
			req.userGroup = group;
			next();
		})
})

router.get('/:groupId', function(req, res, next) {
	res.status(200).json(req.userGroup);
})

router.delete('/:groupId', function(req, res, next) {
	req.userGroup.remove()
		.then(function() {
			res.status(204).end();
		});
});

router.use('/:groupId/events', require('./events'))


// router.use('/:id/events', require('./events'), function(req, res, next) {
	
// })



module.exports = router;
