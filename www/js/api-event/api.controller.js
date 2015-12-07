app.controller('ApiCtrl', function($scope, ApiFactory, EventFactory, $ionicPopup, $state) {
	$scope.event = ApiFactory.get();

	$scope.data = {
		name: $scope.event.name,
		description: null,
		day: null,
		time: null,
		date: $scope.event.date || null,
		location: null,
		locationName: $scope.event.location,
		group_id: null
	};

	$scope.data.name = $scope.event.name;
	$scope.data.locationName = $scope.event.location;
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
		if ($scope.data.time) {
		$scope.hours = $scope.data.time.getHours();
		$scope.minutes = $scope.data.time.getMinutes();
		$scope.data.date = moment(new Date($scope.data.day).setHours($scope.hours, $scope.minutes, 0, 0)).format('lll')
		$scope.data.time = null;
		$scope.data.day = null;
	}
		EventFactory.addEvent($scope.data);
		$scope.data.description = null;
		$state.go('app.tab.events')
	}
})