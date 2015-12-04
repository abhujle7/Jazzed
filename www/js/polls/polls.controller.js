app.controller('PollsCtrl', function($scope, $state, EventFactory, RoomsFactory, $ionicHistory, PollsFactory, eventDetails) {

	$scope.rooms = RoomsFactory.all();
	$scope.polls = PollsFactory.all();
	$scope.event = eventDetails;
	
	$scope.data = {
		location: null,  //if event has location, display and void this field in poll
		expiration: {
			date: null,   //defaults to today
			time: null    //defaults to now, maybe have buttons for x days from event
		},
		responses: {
			attending: 0,
			notAttending: 0
		}
	}

	$scope.createNewPoll = function () {
		//send to all saved events
	}

	$scope.goBack = function () {
		$ionicHistory.goBack();
	}

	$scope.submitPoll = function () {
		console.log('this is data', $scope.data)
		PollsFactory.addPoll($scope.data)
	}
	
 })
