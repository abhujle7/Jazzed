app.controller('EventDetailCtrl', function($scope, $state, eventDetails, EventFactory, RoomsFactory, $ionicHistory) {	
	
	$scope.currentEvent = eventDetails;
	$scope.rooms = RoomsFactory.all();
	console.log($scope.currentEvent);

	$scope.defaultDate = new Date($scope.currentEvent.date);
	$scope.data = {
		name: null,
		description: null,
		image: null,
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
		if ($scope.data.time != null || $scope.data.day != null) {
			$scope.hours = $scope.data.time.getHours();
			$scope.minutes = $scope.data.time.getMinutes();
			$scope.data.date = moment(new Date($scope.data.day).setHours($scope.hours, $scope.minutes, 0, 0)).format('lll')
		}
		for (var key in $scope.data) {
			if ($scope.data[key] && key != "location") {
				eventDetails[key] = $scope.data[key];
			} else if ($scope.data[key]) {
				eventDetails.location = $scope.data.location;
			}
		}
		EventFactory.save(eventDetails);
	}

	$scope.submitEvent = function() {
		EventFactory.addEvent($scope.data);
	}


	$scope.goBack = function () {
		$ionicHistory.goBack();
	}
 })
