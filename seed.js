var mongoose = require('mongoose');
var Promise = require('bluebird');


var chalk = require('chalk');
var connectToDb = require('./server/db');

var chance = require('chance')(12345)
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

function randUser() {
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
    var group = [chance.pick(allUsers)];
    var randUser;

    while (group.length < 6){
        randUser = chance.pick(allUsers);
        for (var i = 0; i < group.length; i++) {
            if (_.isEqual(group[i], randUser)) {
                randUser = chance.pick(allUsers);
                break;
            } else if (i == group.length - 1) {
                group.push(randUser);
            }
        }
    }

    return new Group({
        users: group.slice(1, group.length),
        name: chance.word(),
        admins: [group[0]]
    })
}

function randEvent(allGroups) {
    var group = chance.pick(allGroups);
    return new Event({
        groups: group,
        name: chance.word(),
        time: chance.hammertime()
    });
}

function populateUserGroups(users, groups) {
    groups.forEach(function(group) {
        group.users.forEach(function(userId) {
            users.forEach(function(user) {
                if (user._id == userId)
                user.groups.push(group)
            });
        });
        group.admins.forEach(function(userId) {
            users.forEach(function(user) {
                if (user._id == userId)
                user.groups.push(group)
            });
        });
    });
}

function populateGroupEvents(groups, events) {
    events.forEach(function(oneEvent) {
        oneEvent.groups.forEach(function(groupInEvent) {
            groups.forEach(function(group) {
                if (group._id == groupInEvent._id) {
                    group.events.push(oneEvent);
                }
            });
        });
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
    });
    var events = _.times(numEvents, function() {
        return randEvent(groups);
    });

    populateUserGroups(users, groups);
    populateGroupEvents(groups, events);

    /*
        Currently we have one way population
        Groups have users
        events have groups

        Things to add
            users have groups
            groups have events
            events have a creator            
        How to add
            We have to iterate through a group in the groups array and list each user
                after we list each user we have to push that group object into the found user
            To add events to groups
                we have to list the group for each event
                and add it to the group array
            To add events
                we have to pick a random person from users and admins in a group
                and add it to the object

    */
    
    return users.concat(groups).concat(events);
}

function seed() {
    var docs = generateAll();
    return Promise.map(docs, function(doc) {
        return doc.save();
    });
}

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

