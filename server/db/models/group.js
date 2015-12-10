'use strict'
var mongoose = require('mongoose');

var schema = new mongoose.Schema({ 
	name: {
		type: String,
		required: true
	},
	picture: {
		type: String
		//default picture
	},
	events: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Event'
	}],
	admins: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}]
});

mongoose.model('Group', schema);
