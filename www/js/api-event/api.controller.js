app.controller('ApiCtrl', function($scope, ApiFactory, EventFactory, $ionicPopup, $state, $ionicHistory, $rootScope) {
	$scope.event = ApiFactory.get();

	var currentRoomId = $rootScope.currentRoom
	var currEventId;

	$scope.data = {
		name: $scope.event.name,
		description: null,
		day: new Date,
		time: null,
		date: $scope.event.date || null,
		location: null,
		locationName: $scope.event.location,
		group_id: currentRoomId
	};

	$scope.data.name = $scope.event.name;
	$scope.data.locationName = $scope.event.location;
	$scope.data.date = $scope.event.date;

	$scope.saveEventPopup = function () {
		$ionicPopup.show({
			title: 'Would you like to create a new poll for this event or save it for future use?',
			scope: $scope,
			buttons: [
				{
				text: 'Poll',
				type: 'button-positive',
				onTap: $scope.submitAndPoll
				},
				{
				text: 'Save',
				type: 'button-calm',
				onTap: $scope.submitEvent
				},
				{text: 'Exit',
				type: 'button-assertive'}
			]
		})
	}


	$scope.submitAndPoll = function () {
		EventFactory.addEvent($scope.data).then(function(eventId) {
			console.log(eventId)
			currEventId = eventId;
		})
		.then(function () {
		$state.go('app.tab.chat-polls', {eventid: currEventId, id: $scope.data.group_id})
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

	$scope.goBack = function () {
		$ionicHistory.goBack();
	}
})