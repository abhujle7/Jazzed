/*

This seed file is only a placeholder. It should be expanded and altered
to fit the development of your application.

It uses the same file the server uses to establish
the database connection:
--- server/db/index.js

The name of the database used is set in your environment files:
--- server/env/*

This seed file has a safety check to see if you already have users
in the database. If you are developing multiple applications with the
fsg scaffolding, keep in mind that fsg always uses the same database
name in the environment files.

*/

var mongoose = require('mongoose');
var Promise = require('bluebird');


var chalk = require('chalk');
var connectToDb = require('./server/db');

var chance = require('chance')(12345) //number makes sure data is seeded the same way (Removed randomness)
var _ = require('lodash');

var User = Promise.promisifyAll(mongoose.model('User'));
var Group = Promise.promisifyAll(mongoose.model('Group'));
var Event = Promise.promisifyAll(mongoose.model('Event'))

var numUsers = 17;
var numGroups = 5;
var numEvents = 10;
var emails = chance.unique(chance.email, numUsers);

function randPhoto() {
    var g = chance.pick(['men'], 'women');
    var n = chance.natural({min: 0, max: 7});
    return 'http://api.randomuser.me/portraits/thumb/' + g + '/' + n + '.jpg';
}

function randUser(user) {
    return new User({
        name: [chance.first(), chance.last()].join(" "),
        email: emails.pop(),
        phoneNum: chance.phone(),
        photo: randPhoto(),
        location: chance.coordinates().split(", ").map(function(str) {
            return Number(str);
        })
    })
}

function randGroup(allUsers) {
    var group = [];
    var randUser;
    while (group.length < 6){
        randUser = chance.pick(allUsers);
        if (group.indexOf(randUser) == -1)
            group.push(randUser);
    }
    return new Group({
        users: group,
        name: chance.word(),
        admins: [chance.pick(allUsers)]
    })


}

function randEvent(allGroups) {
    var group = chance.pick(allGroups);
    return new Event({
        group: group,
        name: chance.word(),
        time: chance.hammertime()
    });
}

function generateAll() {
    var users = _.times(numUsers, randUser);
    users.push(new User(
        {
            email: 'obama@gmail.com',
            password: 'potus',
            phoneNum:123455643
    }));
    var groups = _.times(numGroups, function() {
        return randGroup(users);
    })
    var events = _.times(numEvents, function() {
        return randEvent(groups);
    })

    return users.concat(groups).concat(events);
}

function seed() {
    var docs = generateAll();
    return Promise.map(docs, function(doc) {
        return doc.save();
    });
}


// var seedUsers = function () {
//     var users = _.times(numUsers, randUser);
//     users.push(new User(
//         {
//             email: 'obama@gmail.com',
//             password: 'potus',
//             phoneNum:123455643
//     }));

//     return User.createAsync(users);

// };

//-------------------------------------------------

// connectToDb.drop = Promise.promisify(connectToDb.db.dropDatabase.bind(connectToDb.db));

// connectToDb.on('open', function() {
connectToDb.then(function(db) {
    return db.db.dropDatabase();
})
.then(function() {
    return seed();
})
.then(function() {
    console.log("Seeding DONE")
}, function(err) {
    console.error("Seeding error");
    console.error(err.stack);
})
.then(function() {
    process.exit();
});

//-------------------------------------------------


// connectToDb.then(function (db) {
//     console.log("THE ARGUMENTS ARE", arguments);
//     User.findAsync({}).then(function (users) {
//         if (users.length === 0) {
//             return seedUsers();
//         } else {
//             console.log(chalk.magenta('Seems to already be user data, exiting!'));
//             process.kill(0);
//         }
//     }).then(function () {
//         console.log(chalk.green('Seed successful!'));
//         process.kill(0);
//     }).catch(function (err) {
//         console.error(err);
//         process.kill(1);
//     });
// });
