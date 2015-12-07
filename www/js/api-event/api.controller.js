app.controller('ApiCtrl', function($scope, ApiFactory, EventFactory, $ionicPopup, $state) {
	$scope.event = ApiFactory.get()

	$scope.data = {
		name: null,
		description: null,
		day: null,
		time: null,
		date: null,
		location: null,
		locationName: null,
		group_id: null
	};

	$scope.data.name = $scope.event.name;
	$scope.data.location = $scope.event.location;
	$scope.data.date = $scope.event.date;


	// function formatTime() {
	// 	var day = $scope.data.date;
	// 		day = day.split("/");
	// 		day.forEach(function(unitTime) {
	// 			return Number(unitTime);
	// 		})

	// 		var time = $scope.data.time;
	// 		time = time.slice(0, -3);
	// 		time = time.split(":");
	// 		time.forEach(function(unitTime) {
	// 			return Number(unitTime);
	// 		})
	// 	var d = new Date(unitTime[2],unitTime[0], unitTime[1], time[0], time[1]);
	// 	$scope.data.date = d;
	// }

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