app.factory('EventFactory', function($state, $q, $firebase, $firebaseArray, $ionicHistory, AuthFactory, RoomsFactory) {		
			
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
    getUserSpecificEvents: function () {
      var deferred = $q.defer();
      var userEvents = [];
      var roomIds = RoomsFactory.getUserSpecificRoomIds();
      console.log('before foreeeeeach')
      events.forEach(function (event) {
        console.log('in foreach')
        if (roomIds.indexOf(event.groups) > -1) {
          console.log('in if')
          userEvents.push(event);
        }
        deferred.resolve(userEvents);
      })
      console.log('this is user events', userEvents)
      return deferred.promise;
      // ref.once("value", function (allEvents) {
      //   allEvents.forEach(function (event) {
      //     var eventDetail = event.val();

      //   })
      // })

      // // var deferred = $q.defer();
      // var userSpecificEvents = [];
      // var roomIds = RoomsFactory.getUserSpecificRoomIds();
      // console.log('this is roomids in fac', roomIds)
      // return ref.once("value", function (allEvents) {
      //   allEvents.forEach(function (event) {
      //     var eventDetail = event.val();
      //     console.log('this is an event in fac', eventDetail)
      //     if (roomIds.indexOf(eventDetail.groups) > -1) {
      //       userSpecificEvents.push(event);
      //     }
      //   })
      //   console.log('this is userspecevents in once', userSpecificEvents)
      //   return userSpecificEvents;
      //   // deferred.resolve(userSpecificEvents);
      // })      
      // // console.log('this is array in fac', userSpecificEvents)
      // // return deferred.promise;
    }
  }		
})