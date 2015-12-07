app.controller('PollsCtrl', function($scope, $state, EventFactory, RoomsFactory, $ionicHistory, PollsFactory, eventDetails, $interval, $firebase, $stateParams, pollDetails) {

	$scope.rooms = RoomsFactory.all();
	$scope.polls = PollsFactory.all();
	$scope.event = eventDetails;
	$scope.currentPoll = pollDetails;
	console.log('in pollsctrl this is current poll', $scope.currentPoll)
	var roomId = $scope.event.groups
	var pollId = $stateParams.id
	var pollsRef = new Firebase('https://boiling-fire-3161.firebaseio.com/polls/');

	$scope.data = {
		location: null,  //if event has location, display and void this field in poll
		expiration: {
			date: null,   //defaults to today
			time: null    //defaults to now, maybe have buttons for x days from event
		},
		responses: {
			attending: 0,
			notAttending: 0
		},
		event: {
			id: null,
			name: null
		}
	}

	$scope.createNewPoll = function () {
		//send to all saved events
	}

	$scope.goBack = function () {
		$ionicHistory.goBack();
	}

	$scope.submitPoll = function () {
		// console.log('do you need to invoke', $scope.event.$id)
		// console.log('this is data', $scope.data)
		// console.log('this is event groups', roomId)
		PollsFactory.addPoll($scope.data, roomId, $scope.event)
		$ionicHistory.goBack();
	}
	
	$scope.updatePoll = function () {
		pollId = $stateParams.id
		PollsFactory.updatePoll(pollId, $scope.data);
	}
	$scope.eventLocation = function () {
		if (!$scope.event.location) {
			return false;
		}
		if ($scope.event.location.name) {
			return true;
		}
		return false;
	}

	

	// $interval(function(){
	      
	// 	pollsRef.on("value", function (snapshot) {
	// 		snapshot.forEach(function(poll) {
	// 				var pollId = poll.key()
	// 				console.log('poll id', poll.key())
	// 				console.log('poll val', poll.val())
	// 				console.log('poll exp', pollsRef.child(pollId).child('expiration'))
	// 				console.log('poll exp time', pollsRef.child(pollId).child('expiration').child('time'))
	// 				var combinedDate = pollsRef.child(pollId).child('expiration').time + pollsRef.child(pollId).child('expiration').date
	// 				// console.log('this is combined', combinedDate)
	// 				console.log('this is live or not', pollsRef.child(pollId).child('live'))
	// 				if (moment().unix() >= combinedDate) {
	// 					console.log('this is live before', pollsRef.child(pollId).child('live').val())
	// 					pollsRef.child(pollId).update({live: false})
	// 					// pollsRefgroup[poll].live = false;
	// 				}
				
	// 		})
	// 	})

	// }, 1000);

 })
