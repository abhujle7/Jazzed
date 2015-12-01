app.controller('EventsCtrl', function($scope, $state, EventFactory) {

	$scope.events = [{
		name: "foodie",
		time: 123445,
		location: "My house"
	},{
		name: "games",
		time: 345543,
		location: "your house"
	},{
		name: "dance off",
		time: 23234,
		location: "white house"
	}];

	$scope.data = {};

	$scope.createEvent = function() {
		$state.go('tab.createNewEvent');
	}

	$scope.submitEvent = function() {
		EventFactory.addEvent($scope.data.name, $scope.data.time, $scope.data.location, $scope.data.locationName);
		EventFactory.all();
	}
 })

//needs to talk to the back