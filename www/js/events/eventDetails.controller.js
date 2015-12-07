app.controller('EventDetailCtrl', function($scope, $state, eventDetails, EventFactory, RoomsFactory, $ionicHistory) {	
	
	$scope.currentEvent = eventDetails;
	$scope.rooms = RoomsFactory.all();

	$scope.data = {
		name: null,
		description: null,
		day: null,
		time: null,
		date: null,
		time: null,
		location: {
			name: null,
			coordinates: null
		},
		group_id: null
	};

	$scope.saveEvent = function() {
		$scope.hours = $scope.data.time.getHours();
		$scope.minutes = $scope.data.time.getMinutes();
		console.log($scope.hours, $scope.minutes);
		$scope.data.date = moment(new Date($scope.data.day).setHours($scope.hours, $scope.minutes, 0, 0)).format('lll')
		console.log("time is", $scope.data.date);
		for (var key in $scope.data) {
			if ($scope.data[key] && key != "location") {
				eventDetails[key] = $scope.data[key];
			} else if ($scope.data[key]) {
				console.log("swapped location and the key is", key, "and the data is", $scope.data[key]);
				eventDetails.location = $scope.data.location;
			}
		}
		console.log("event is", eventDetails);
		EventFactory.save(eventDetails);
	}

	$scope.submitEvent = function() {
		EventFactory.addEvent($scope.data);
	}


	$scope.goBack = function () {
		$ionicHistory.goBack();
	}
 })

