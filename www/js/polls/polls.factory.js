app.factory('EventFactory', function($state, $firebase, $firebaseArray, $ionicHistory, AuthFactory) {
	
	var ref = new Firebase('https://boiling-fire-3161.firebaseio.com');
	var polls = $firebaseArray(ref.child('consensus'));
	var currentUser = AuthFactory.getCurrentUser();

	return {
    all: function() {
      console.log(polls);
      return polls;
    },
    addPoll: function(event) {
      polls.$add({
        name: event.name,
        time: event.time,
        location: {
          name: event.locationName,
          coordinates: event.location
        },
        groups: event.group_id
      })
      .then(function() {
        // $ionicHistory.goBack(); //goes back to previous view
        $state.go('tab.events');
      })
    }
  }
})
