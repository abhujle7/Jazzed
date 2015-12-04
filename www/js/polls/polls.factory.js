app.factory('PollsFactory', function($state, $firebase, $firebaseArray, $ionicHistory, AuthFactory, ChatFactory, $firebaseObject) {
	
  var selectedRoomId = ChatFactory.getRoomId();
	var ref = new Firebase('https://boiling-fire-3161.firebaseio.com');
	var polls = $firebaseArray(ref.child('polls').child(selectedRoomId));
	var currentUser = AuthFactory.getCurrentUser();
  var user = AuthFactory.getCurrentUser().uid
  var userRef = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + user)
  var userObj = $firebaseObject(userRef)

	return {
    all: function() {
      console.log(polls);
      return polls;
    },
    addPoll: function(pollData) {
      console.log('this is polldata', pollData)
      pollData.timestamp = Firebase.ServerValue.TIMESTAMP;
      pollData.creator = user;
      pollData.expiration.date = moment(pollData.expiration.date).unix();
      pollData.expiration.time = moment(pollData.expiration.time).unix();
      pollData.live = true;
      console.log('this is polldata modified', pollData)
      polls.$add(pollData)
      .then(function(data) {
        // $ionicHistory.goBack(); //goes back to previous view
        console.log('poll saved', data);
      })
    }
  }
})
