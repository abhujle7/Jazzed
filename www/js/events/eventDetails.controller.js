app.controller('EventDetailCtrl', function($scope, $state, eventDetails, EventFactory, RoomsFactory, $ionicHistory) {	
	
	$scope.currentEvent = eventDetails;
	$scope.rooms = RoomsFactory.all();

	$scope.data = {
		name: null,
		description: null,
		date: null,
		time: null,
		location: {
			name: null,
			coordinates: null
		},
		group_id: null
	};

	$scope.saveEvent = function() {
		for (var key in $scope.data) {
			if ($scope.data[key] && key != "location") {
				eventDetails[key] = $scope.data[key];
			} else if ($scope.data[key]) {
				console.log("swapped location and the key is", key, "and the data is", $scope.data[key]);
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

