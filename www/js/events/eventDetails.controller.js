app.controller('EventDetailCtrl', function($scope, $state, eventDetails, EventFactory, RoomsFactory, $ionicHistory) {	
	
	$scope.currentEvent = eventDetails;
	$scope.rooms = RoomsFactory.all();
	console.log($scope.currentEvent);

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
		if ($scope.data.time != null || $scope.data.day != null) {
			$scope.hours = $scope.data.time.getHours();
			$scope.minutes = $scope.data.time.getMinutes();
			$scope.data.date = moment(new Date($scope.data.day).setHours($scope.hours, $scope.minutes, 0, 0)).format('lll')
		}
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

	// console.log("current event is", $scope.currentEvent);
	// for (var i = 0; i < $scope.rooms.length; i++) {
	// 	console.log($scope.rooms[i].$id);
	// 	console.log($scope.currentEvent.group);
	// 	// console.log("the room is", $scope.rooms[i].$id);
	// 	// console.log("the object group value is", $scope.currentEvent.group);
	// 	var a = String($scope.rooms[i].$id)
	// 	// var b = String($scope.currentEvent.groups)
	// 	var b = new RegExp($scope.currentEvent.groups);
	// 	// console.log($scope.rooms[i].$id == $scope.currentEvent.groups);
	// 	console.log(b.test(a));
	// 	if (String($scope.rooms[i].$id) == String($scope.currentEvent.groups)) {
	// 		// $scope.numRooms = i;

	// 		$scope.numRooms = $scope.rooms[i].name;
	// 		console.log("i found the roo yayayayaym", $scope.numRooms);
	// 		break;
	// 	}
	// }
