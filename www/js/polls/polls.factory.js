app.factory('PollsFactory', function($state, $firebase, $firebaseArray, $ionicHistory, AuthFactory, ChatFactory, $firebaseObject) {
	
	var ref = new Firebase('https://boiling-fire-3161.firebaseio.com');
	var pollsRef = new Firebase('https://boiling-fire-3161.firebaseio.com/polls/');
  var polls = $firebaseArray(pollsRef);
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
      console.log('this is the date', pollData.expiration.date)
      console.log('this is the time', pollData.expiration.time)
      console.log('this is the moment', moment().unix())
      console.log('this is the combined datetime', pollData.expiration.date + pollData.expiration.time)
      pollData.live = true;
      pollData.groups = roomId;
      pollData.event.id = eventObj.$id;
      pollData.event.name = eventObj.name;
      polls.$add(pollData)
      .then(function(data) {
      })
    },
    updatePoll: function (id, data) {
      
      pollsRef.child(id).update({responses: data.responses})
    },
    expirePoll: function (id) {
      pollsRef.child(id).update({live: false})
    },
    getPoll: function (id) {
      return polls.$getRecord(id) 
    }
  }
})
