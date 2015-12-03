'use strict'

// if you're not using mongoose anymore, you should remove all these
// files before employers look at the repo


var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	groups: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Group'
	}],
	creator: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}],
	name: {
		type: String,
		required: true
	},
	time: {
		type: Date,
		required: true
		// default:
	},
	location: {
		coordinates: {
			type: [Number],
			index: '2dsphere'
		}
	},
	budget: {
		type: Number
	},
});

mongoose.model('Event', schema);
