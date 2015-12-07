app.factory('EventFactory', function($state, $firebase, $firebaseArray, $ionicHistory, AuthFactory) {
	
	var ref = new Firebase('https://boiling-fire-3161.firebaseio.com');
	var events = $firebaseArray(ref.child('events'));
	var currentUser = AuthFactory.getCurrentUser().uid;

	return {
    all: function() {
      return events;
    },
    addEvent: function(event) {
      return events.$add({
        name: event.name,
        description: event.description,
        date: event.date,
        time: event.time,
        creator: currentUser,
        location: {
          name: event.locationName,
          coordinates: event.location
        },
        groups: event.group_id
      })
      .then(function(data) { 
        var currEventId = data.key()
        return currEventId;
      })
    },
    get: function (eventId) {
      return events.$getRecord(eventId)
    }
  }
})
