'use strict';
var router = require('express').Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');

router.get('/', function(req, res, next) {
    User.find({})
        .then(function(users) {
            res.status(200).json(users)
        })
})

// make sure it doesn't think "phone" is an id
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

// wat happened to the subrouter?
// router.use('/:id/groups', require('./groups'));
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
        });
})

//can I just use userToFind again?
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
            mdClient.messages.send({
                message: {
                  html: "<a href=\"http://localhost:1337/signup\">Click here to log in and reset your password</a>",
                  text: "Please login to reset your password",
                  subject: "Password Reset",
                  from_email: "no-reply@TheLifeExotic.com",
                  from_name: "The Life Exotic",
                  to: [{
                          email: user.email,
                          name: "Curator",
                          type: "to"
                      }],
                },
                  async: false,
                  ip_pool: "Main Pool"
                }, function(result) {
                    console.log(result)
                    },
                    function(e) {
                         // Mandrill returns the error as an object with name and message keys
                          console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
              })
            res.status(204).end();
        }).catch(next);
})


module.exports = router;
