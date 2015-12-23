app.factory('PollsFactory', function($state, $firebase, $firebaseArray, $ionicHistory, AuthFactory, ChatFactory, $firebaseObject) {
	
	var ref = new Firebase('https://boiling-fire-3161.firebaseio.com/');
	var pollsRef = new Firebase('https://boiling-fire-3161.firebaseio.com/polls/');
  var polls = $firebaseArray(pollsRef);
  // var pollsResponseRef = new Firebase('https://boiling-fire-3161.firebaseio.com/polls/responses2/');
  // var pollsResponse = $firebaseArray(pollsResponseRef);
  var currentUser = AuthFactory.getCurrentUser();
  var user = AuthFactory.getCurrentUser().uid
  var userRef = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + user)
  var userObj = $firebaseObject(userRef)

	return {
    all: function() {
      return polls;
    },
    addPoll: function(pollData, roomId, eventObj) {
      pollData.timestamp = Firebase.ServerValue.TIMESTAMP;
      pollData.creator = user;
      pollData.expiration.date = moment(pollData.expiration.date).unix();
      pollData.expiration.time = moment(pollData.expiration.time).unix();
      pollData.live = true;
      pollData.groups = roomId;
      pollData.event.id = eventObj.$id;
      pollData.event.name = eventObj.name;
      polls.$add(pollData)
      .then(function(data) {
      })
    },
    updatePoll: function (id, data) {
      console.log('this is data in fac', data.responses)
      pollsRef.child(id).update({responses: data.responses})
      if (data.responses.attending) {
        console.log('in if statment')
        pollsRef.child(id).child('responses2').child('attending2').push(user)
        console.log('pushed user into array')
      }
      if (data.responses.notAttending) {
         pollsRef.child(id).child('responses2').child('notAttending2').push(user)
      }
    },
    expirePoll: function (id) {
      pollsRef.child(id).update({live: false})
    },
    getPoll: function (id) {
      return polls.$getRecord(id) 
    },
    getByRoom: function(roomId) {    
      var groupSpecific = [];
      pollsRef.once("value", function(polls) {
        polls.forEach(function (poll) {
          var pollDetails = poll.val()
          var pollId = poll.key()
          pollDetails.id = pollId
          if (pollDetails.groups == roomId) {
            groupSpecific.push(pollDetails)
          }
        })
      })
      return groupSpecific;
    }  
  }
})
