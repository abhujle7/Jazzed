app.controller('EventsCtrl', function($scope, $state, EventFactory, RoomsFactory, $ionicHistory, $ionicPopup, $rootScope) {

	$scope.rooms = RoomsFactory.all();
	$scope.events = EventFactory.all();
	var currentRoomId = $rootScope.currentRoom;
	console.log('in events ctrl room id', currentRoomId)

	var currEventId;
	$scope.data = {
		name: null,
		description: null,
		time: null,
		date: null,
		location: null,
		locationName: null,
		group_id: currentRoomId
	};

	// $scope.createEvent = function() {
	// 	$state.go('tab.createNewEvent');
	// }

	$scope.editEvent = function(event) {
		$state.go('app.tab.eventDetails',{eventId: event.$id});
	}
	
	$scope.createEvent = function() {
		$state.go('app.tab.chat-createNewEvent');
	}

	$scope.getGroupName = function (eventObj) {
		console.log('infunc', eventObj)
		var roomId = eventObj.groups;
		console.log('in func2', roomId)
		var group = RoomsFactory.get(roomId)
		return group.name;
		console.log('this is group', group)
		// .then(function (group) {
		// 	console.log('this is group', group)
		// 	return group.name;
		// })
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
			group_id: currentRoomId
		}
		$ionicHistory.goBack();
		// $state.go('app.tab.events')
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
			title: 'Would you like to create a new poll for this event?',
			scope: $scope,
			buttons: [
				{
				text: 'Yes, I want to create a live poll',
				onTap: $scope.submitAndPoll
				},
				{
				text: 'No, just save this event for future use',
				onTap: $scope.submitEvent
				},
				{text: 'Cancel'}
			]
		})
	}

	$scope.goBack = function () {
		$ionicHistory.goBack();
	}
 })
