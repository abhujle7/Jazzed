app.factory('EventFactory', function($firebase, $firebaseArray, AuthFactory) {
	
	var ref = new Firebase('https://boiling-fire-3161.firebaseio.com');
	var events = $firebaseArray(ref.child('events'));
	var fixedEvents = $firebaseArray(ref.child('events').child('fixed'));
	var locationChild = $firebaseArray(ref.child('events').child('fixed').child('location'));
	var currentUser = AuthFactory.getCurrentUser();

	return {
		all: function() {
			console.log(events);
		},
		addEvent: function(eventName, eventTime, eventLocation, locationName) {
			fixedEvents.$add({
				name: eventName,
				time: eventTime,
				location: {
					name: locationName,
					coordinates: eventLocation
				}
			})
		}
	}
})

/*
-----To-do list----
Switch name or event._id

*/


 //----------------------------------------
      // "events": {
      //   "fixed": {
      // 	".write": "auth !== null",
      //     "$event_id": {
      //       ".validate": "(newData.child('name').exists()) && (newData.exists() && newData.hasChildren(['time', 'location']))",
      //       "name": {
      //         ".validate": "newData.val().length < 20 && newData.val().length > 0"
      //       },
      //       "time": {
      //         ".validate": "newData.val() <= now"
      //       },
      //       "location": {
      //         ".validate": "newData.hasChildren(['name', 'coordinates'])",
      //         "name": {".validate": "newData.isString() && newData.val().length < 20"},
      //         "coordinates": {
      //			".validate": "newData.val().length < 20 && newData.val().length > 0"
      //         } 
      //       }
      //     }
      //   },