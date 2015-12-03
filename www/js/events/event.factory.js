app.factory('EventFactory', function($state, $firebase, $firebaseArray, $ionicHistory, AuthFactory) {
	
	var ref = new Firebase('https://boiling-fire-3161.firebaseio.com');
	var events = $firebaseArray(ref.child('events'));
	var currentUser = AuthFactory.getCurrentUser();

	return {
    all: function() {
      console.log(events);
      return events;
    },
    addEvent: function(event) {
      events.$add({
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
