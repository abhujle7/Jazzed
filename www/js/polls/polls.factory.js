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
      console.log('these are polls in fac', polls);
      return polls;
    },
    addPoll: function(pollData, roomId, eventObj) {
      console.log('this is polldata', pollData)
      pollData.timestamp = Firebase.ServerValue.TIMESTAMP;
      pollData.creator = user;
      pollData.expiration.date = moment(pollData.expiration.date).unix();
      pollData.expiration.time = moment(pollData.expiration.time).unix();
      pollData.live = true;
      console.log('this is polldata modified', pollData)
      console.log('this is event obj', pollData.event)
      console.log('this is polls', polls)
      pollData.groups = roomId;
      pollData.event.id = eventObj.$id;
      pollData.event.name = eventObj.name;
      console.log('this is pollData as added', pollData)
      polls.$add(pollData)
      .then(function(data) {
        // $ionicHistory.goBack(); //goes back to previous view
        console.log('poll saved', data);
      })
    },
    updatePoll: function (id, data) {
      
      pollsRef.child(id).update({responses: data.responses})
    }
  }
})
