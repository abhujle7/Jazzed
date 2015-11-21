'use strict';
var router = require('express').Router();

router.get('/', function(req, res, next) {
    User.find({})
        .then(function(users) {
            res.status(200).json(users)
        })
})

router.param('id', function(req, res, next, id) {
    User.findById(id)
        .then(function(user) {
            req.userToFind = user;
            next();
        })
})

router.get('/:id', function(req, res, next) {
    res.status(200).json(req.userToFind)
})

router.get('/:id/groups', function(req, res, next) {
    req.userToFind.populate('groups')
        .then(function(user) {
            res.status(200).json(user.groups)
        })
})

router.delete('/:id', function(req, res, next) {
    req.userToFind.remove()
        .then(function() {
            res.status(204).end()
        })
})

router.get('/phone/:phoneNum', function(req, res, next) {
    User.find({phoneNum: req.params.phone})
        .then(function(user) {
            res.status(200).json(user)
        })
})

router.get('/email/:email', function(req, res, next) {
    User.find({email: req.params.email})
        .then(function(user) {
            res.status(200).json(user)
        })
})

router.post('/email/:email/triggerReset', function(req, res, next) {
    User.find({email: req.params.email})
        .then(function(user) {
            
        })
})

module.exports = router;