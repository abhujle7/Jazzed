app.factory('EventFactory', function($state, $q, $firebase, $firebaseArray, $ionicHistory, AuthFactory) {
	
	var ref = new Firebase('https://boiling-fire-3161.firebaseio.com/events');
	var events = $firebaseArray(ref);
  // var eventGroupId = $firebaseArray(ref.child('events').child('groups'));
	var currentUser = AuthFactory.getCurrentUser().uid;


	return {
    all: function() {
      var deferred = $q.defer();
      events.$loaded()
      .then(function(eventsList) {
        deferred.resolve(eventsList)
      })
      .catch(function(error) {
        console.error("Error", error);
      })
      return deferred.promise;
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
      var deferred = $q.defer();
      var arr = [];
      // console.log("room id is", roomId)
      // ref.orderByChild("name").startAt("Ping Pong at Spin").endAt("Ping Pong at Spin").on("child_added", function(snapshot) {
      ref.orderByChild("groups").startAt(roomId).endAt(roomId).on("child_added", function(snapshot) {
        // console.log(snapshot.val());
        arr.push(snapshot.val());
      })
      deferred.resolve(arr);
      // console.log(arr);
      return deferred.promise;
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
