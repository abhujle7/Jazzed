app.factory('EventFactory', function($state, $q, $firebase, $firebaseArray, $ionicHistory, AuthFactory) {		
			
	var ref = new Firebase('https://boiling-fire-3161.firebaseio.com/events/');		
	var events = $firebaseArray(ref);		
  // var eventGroupId = $firebaseArray(ref.child('events').child('groups'));		
	var currentUser = AuthFactory.getCurrentUser().uid;		
		
		
	return {		
    all: function () {		
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
    },		
    getByRoom: function(roomId) {		
      var groupSpecific = [];
      ref.once("value", function(events) {
        events.forEach(function (event) {
          var eventDetails = event.val()
          var eventId = event.key()
          eventDetails.id = eventId
          if (eventDetails.groups == roomId) {
            groupSpecific.push(eventDetails)
          }
        })
      })
      return groupSpecific;
    },		
    save: function(event) {		
      events.$save(event).then(function(ref) {		
        $ionicHistory.goBack()		
      })		
    },		
    resolve: {		
		
    }		
  }		
})