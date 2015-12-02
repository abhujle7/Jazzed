'use strict';
var router = require('express').Router();
module.exports = router;

router.use('/members', require('./members'));
router.use('/users', require('./users'));
router.use('/groups', require('./groups'));
router.use('/events', require('./events'));
router.use('/yelp', require('./yelp'));
router.use('/movies', require('./movies'));
// router.use('/sports', require('./sports'))

// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});
