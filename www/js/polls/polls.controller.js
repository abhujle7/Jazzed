app.controller('PollsCtrl', function($scope, $state, EventFactory, RoomsFactory, $ionicHistory, PollsFactory, eventDetails, $interval, $firebase, $stateParams, pollDetails) {
	$scope.rooms = RoomsFactory.all();
	$scope.polls = PollsFactory.all();
	$scope.event = eventDetails;
	$scope.currentPoll = pollDetails
	$scope.currentPollFormattedDate = moment.unix($scope.currentPoll.expiration.date).format("MM/DD/YYYY")
	$scope.currentPollFormattedTime = moment.unix($scope.currentPoll.expiration.time).format("hh:mm A")
	var roomId = $scope.event.groups
	var pollId = $stateParams.pollid
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


	$scope.goBack = function () {
		$ionicHistory.goBack();
	}

	$scope.submitPoll = function () {
		console.log($scope.event, roomId, $scope.data)
		PollsFactory.addPoll($scope.data, roomId, $scope.event)
		// $state.go('app.tab.chat', {id: roomId})
		$ionicHistory.goBack(-2);
	}
	
	$scope.updatePoll = function () {
		pollId = $stateParams.pollid
		PollsFactory.updatePoll(pollId, $scope.data);
		$state.go('app.tab.chat', {id: roomId})
		// $ionicHistory.goBack();
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

	// $scope.currentPollAttending = function (pollObj) {
 //    if (!pollObj.responses.attending) {
 //      return 0;
 //    }
 //    return pollObj.responses.attending;
 //  }

 //   $scope.currentPollNotAttending = function (pollObj) {
 //    if (!pollObj.responses.notAttending) {
 //      return 0;
 //    }
 //    return pollObj.responses.notAttending;
 //  }

	// $interval(function(){
	      
	// 	pollsRef.on("value", function (snapshot) {
	// 		snapshot.forEach(function(poll) {
	// 				var pollId = poll.key()
	// 				var pollData = poll.val();
	// 				console.log('poll id', poll.key())
	// 				console.log('poll val', poll.val())
	// 				// console.log('poll exp', pollsRef.child(pollId).child('expiration'))
	// 				// console.log('poll exp time', pollsRef.child(pollId).child('expiration').child('time'))
	// 				var combinedDate = pollData.expiration.time + pollData.expiration.date
	// 				console.log('moment versus time', moment().unix(), combinedDate)
	// 				if (moment().unix() >= combinedDate && pollData.live) {
	// 					console.log('this is live before', pollData.live)
	// 					PollsFactory.expirePoll(pollId)
	// 				}
				
	// 		})
	// 	})

	// }, 1000);

 })
