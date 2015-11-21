'use strict'
var router = require('express');
var Group = mongoose.model('Group');
module.exports = router;


router.get('/', function(req, res, next) {

});



router.use('/events', require('./events'))
