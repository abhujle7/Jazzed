'use strict';
var router = require('express').Router();
module.exports = router;
var Releases = require('moviefone');

var movies = new Releases('11214')
console.log(movies.getNewReleases())