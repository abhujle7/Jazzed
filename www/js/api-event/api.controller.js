app.controller('ApiCtrl', function($scope, ApiFactory, EventFactory, $ionicPopup) {
	$scope.event = ApiFactory.get()

	$scope.data = {};
	$scope.data.name = $scope.event.name;
	$scope.data.location = $scope.event.location;
	$scope.data.date = $scope.event.date;

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

	$scope.submitAndPoll = function () {
		console.log($scope.data)
		EventFactory.addEvent($scope.data).then(function(eventId) {
			currEventId = eventId;
		})
		.then(function () {
		$state.go('app.tab.polls', {eventid: currEventId})
		})
	}

	$scope.submitEvent = function() {
		EventFactory.addEvent($scope.data)
		$state.go('app.tab.events')
	}
})