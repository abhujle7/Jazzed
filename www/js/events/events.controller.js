app.controller('EventsCtrl', function($scope, $state, EventFactory, RoomsFactory) {

	$scope.rooms = RoomsFactory.all();
	$scope.events = EventFactory.all();

	$scope.data = {
		name: null,
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
	}
 })
