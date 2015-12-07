app.controller('EventsCtrl', function($scope, $state, EventFactory, RoomsFactory, $ionicHistory, $ionicPopup) {

	$scope.rooms = RoomsFactory.all();
	$scope.events = EventFactory.all();
	

	var currEventId;
	$scope.data = {
		name: null,
		description: null,
		date: null,
		time: null,
		location: null,
		locationName: null,
		group_id: null
	};

	// $scope.createEvent = function() {
	// 	$state.go('tab.createNewEvent');
	// }

	$scope.editEvent = function(event) {
		$state.go('app.tab.eventDetails',{eventId: event.$id});
	}
	
	$scope.createEvent = function() {
		$state.go('app.tab.createNewEvent');
	}

	$scope.submitEvent = function() {
		console.log("sup");
		new Firebase('https://boiling-fire-3161.firebaseio.com/groups')
		.startAt($scope.groupName)
		.endAt($scope.groupName)
		.once('value', function (snap) {
		$scope.data.group_id = snap.key();
		EventFactory.addEvent($scope.data)
		$state.go('app.tab.events')
	})
	}

	$scope.submitAndPoll = function () {
		console.log('hello?', $scope.events)
		EventFactory.addEvent($scope.data).then(function(eventId) {
			currEventId = eventId;
			console.log('first')
		})
		.then(function () {
		$state.go('app.tab.chat-polls', {eventid: currEventId, id: $scope.data.group_id})
		console.log('second')
		})
		// console.log('in function')
		// console.log('past submitevent')
		// console.log('end of func')
	}
	$scope.saveEventPopup = function () {
		$ionicPopup.show({
			title: 'Would you like to create a new poll for this event?',
			scope: $scope,
			buttons: [
				{
				text: 'Yes, I want to create a live poll',
				onTap: $scope.submitAndPoll
				},
				{
				text: 'No, just save this event for future use',
				onTap: $scope.submitEvent
				},
				{text: 'Cancel'}
			]
		})
	}

	$scope.goBack = function () {
		$ionicHistory.goBack();
	}
 })
