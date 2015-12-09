app.controller('EventsCtrl', function($scope, $state, EventFactory, RoomsFactory, $ionicHistory, $ionicPopup) {

	$scope.rooms = RoomsFactory.all();
	$scope.events = EventFactory.all();
	

	var currEventId;
	$scope.data = {
		name: null,
		description: null,
		day: null,
		time: null,
		date: null,
		location: null,
		locationName: null,
		group_id: null
	};

	// $scope.createEvent = function() {
	// 	$state.go('tab.createNewEvent');
	// }

	$scope.editEvent = function(event) {
		$state.go('app.tab.eventDetails',{eventId: event.$id});
	}
	
	$scope.createEvent = function() {
		$state.go('app.tab.createNewEvent');
	}

	$scope.submitEvent = function() {
		$scope.hours = $scope.data.time.getHours();
		$scope.minutes = $scope.data.time.getMinutes();
		$scope.data.date = moment(new Date($scope.data.day).setHours($scope.hours, $scope.minutes, 0, 0)).format('lll')

		EventFactory.addEvent($scope.data)
		$scope.data = {
			name: null,
			description: null,
			day: null,
			time: null,
			date: null,
			location: null,
			locationName: null,
			group_id: null
		}
		$state.go('app.tab.events')
	}


	$scope.submitAndPoll = function () {
		console.log('hello?', $scope.events)
		EventFactory.addEvent($scope.data).then(function(eventId) {
			currEventId = eventId;
			console.log('first')
		})
		.then(function () {
		$state.go('app.tab.chat-polls', {eventid: currEventId, id: $scope.data.group_id})
		console.log('second')
		})
	}
	$scope.saveEventPopup = function () {
		$ionicPopup.show({
			title: 'Would you like to create a new poll for this event or save it for future use?',
			scope: $scope,
			buttons: [
				{
				text: 'Poll',
				type: 'button-positive',
				onTap: $scope.submitAndPoll
				},
				{
				text: 'Save',
				type: 'button-calm',
				onTap: $scope.submitEvent
				},
				{text: 'Exit',
				type: 'button-assertive',
				}
			]
		})
	}

	$scope.goBack = function () {
		$ionicHistory.goBack();
	}
 })
