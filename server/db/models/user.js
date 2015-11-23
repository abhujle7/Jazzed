'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String
  },
  salt: {
    type: String
  },
  name: {
    type: String
  },
  phoneNum: {
    type: String,
    unique: true
  },
  photo: {
    type: String
  },
  location: {
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }],
  facebook: {
    id: String
  }
  });

// method to remove sensitive information from user objects before sending them out
schema.methods.sanitize =  function () {
   return _.omit(this.toJSON(), ['password', 'salt']);
};

// generateSalt, encryptPassword and the pre 'save' and 'correctPassword' operations
// are all used for local authentication security.
var generateSalt = function () {
   return crypto.randomBytes(16).toString('base64');
};

var encryptPassword = function (plainText, salt) {
   var hash = crypto.createHash('sha1');
   hash.update(plainText);
   hash.update(salt);
   return hash.digest('hex');
};

schema.pre('save', function (next) {

   if (this.isModified('password')) {
       this.salt = this.constructor.generateSalt();
       this.password = this.constructor.encryptPassword(this.password, this.salt);
   }

   next();

});

schema.statics.generateSalt = generateSalt;
schema.statics.encryptPassword = encryptPassword;

schema.method('correctPassword', function (candidatePassword) {
   return encryptPassword(candidatePassword, this.salt) === this.password;
});

mongoose.model('User', schema);