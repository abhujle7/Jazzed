var mongoose = require('mongoose');
require('../../../server/db/models');
//mongoose.Promise = require('bluebird');

var User = mongoose.model('User');
var Group = mongoose.model('Group');
var Event = mongoose.model('Event');


var expect = require('chai').expect;
// var _ = require('lodash');

var dbURI = 'mongodb://localhost:27017/testingDB';
var clearDB = require('mocha-mongoose')(dbURI);

var supertest = require('supertest');
var app = require('../../../server/app');

describe('Group api route', function() {

	var baseURL = '/api/users';
	beforeEach('Establish DB connection', function(done) {
		if (mongoose.connection.db) return done();
		mongoose.connect(dbURI, done);
	});

	afterEach('Clear test database', function(done) {
		clearDB(done);
	});

	it('should exist', function() {
		expect(Group).to.be.a('function');
	});

	describe('', function(){

	})
})