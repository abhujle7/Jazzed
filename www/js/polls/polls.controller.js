app.controller('PollsCtrl', function($scope, $state, EventFactory, RoomsFactory, $ionicHistory) {

	$scope.rooms = RoomsFactory.all();
	$scope.polls = PollsFactory.all();
	
	$scope.createNewPoll = function () {
		//send to all saved events
	}
	
 })
