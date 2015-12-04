app.controller('EventsCtrl', function($scope, $state, EventFactory, RoomsFactory, $ionicHistory, $ionicPopup) {

	$scope.rooms = RoomsFactory.all();
	$scope.events = EventFactory.all();

	$scope.data = {
		name: null,
		description: null,
		date: null,
		time: null,
		location: null,
		locationName: null,
		group_id: null
	};

	$scope.createEvent = function() {
		$state.go('tab.createNewEvent');
	}

	$scope.submitEvent = function() {
		console.log("sup");
		EventFactory.addEvent($scope.data)
		$state.go('tab.events')
	}

	$scope.submitAndPoll = function () {
		console.log('hello?')
		EventFactory.addEvent($scope.data)
		$state.go('tab.polls', {event: event})
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
