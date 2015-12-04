app.controller('PollsCtrl', function($scope, $state, EventFactory, RoomsFactory, $ionicHistory, PollsFactory, eventDetails, $interval, $firebase) {

	$scope.rooms = RoomsFactory.all();
	$scope.polls = PollsFactory.all();
	$scope.event = eventDetails;
	var pollsRef = new Firebase('https://boiling-fire-3161.firebaseio.com/polls/');
	// var polls = $firebaseArray(ref.child('polls'));

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
	
	$scope.eventLocation = function () {
		if ($scope.event.location) {
			return true;
		}
		return false;
	}



	$interval(function(){
	      
		pollsRef.on("value", function (snapshot) {
			snapshot.forEach(function(groupSnapshot) {
				var group = groupSnapshot.val()
				var groupid = groupSnapshot.key()
				for (var poll in group) {
					// console.log('this is date', group[poll].expiration.date)
					// console.log('this is date', group[poll].expiration.time)
					// console.log('this is moment', moment().unix());
					
					var combinedDate = group[poll].expiration.date + group[poll].expiration.time
					// console.log('this is combined', combinedDate)
					if (moment().unix() >= combinedDate) {
						pollsRef.child(groupid).child(poll).live = false;
						// pollsRefgroup[poll].live = false;
					}
				}
			})
		})

	}, 1000);

 })
