app.controller('EventsCtrl', function($scope, $state, $rootScope, EventFactory, RoomsFactory, $ionicHistory, $ionicPopup, rooms, events, userRooms) {


	$scope.rooms = rooms;
	$scope.events = events;
	var currentRoomId = $rootScope.currentRoom;

	// console.log("rooms are", rooms);
	// console.log("events are", events);
	
	var currEventId;
	$scope.arrEvents = [];

	$scope.data = {
		name: null,
		description: null,
		time: null,
		date: null,
		location: null,
		locationName: null,
		group_id: currentRoomId
	};

	// rooms.forEach(function(room) {
	// 	$scope.arrRooms.push(EventFactory.getByRoom(room.$id));
	// })

	// console.log("the array of rooms by group Id is", $scope.arrRooms);

	console.log("the first room id is", userRooms);
	// console.log(EventFactory.getByRoom(rooms[0].$id));





	//this should be userRooms
	rooms.forEach(function(room) {
		EventFactory.getByRoom(room.$id)
		.then(function(eventInGroup) {
			// console.log("event in group", eventInGroup);
			$scope.arrEvents.push(eventInGroup)
			console.log("the array is filled with", $scope.arrEvents);
		})
	})	


	// userRooms.forEach(function(room) {
	// 	EventFactory.getByRoom("-K4ypa4dvfRTCK9QEx-X")
	// 	// EventFactory.getByRoom(userRooms[0].$id)
	// 	.then(function(eventInGroup) {
	// 		// console.log("event in group", eventInGroup);
	// 		$scope.arrEvents.push(eventInGroup)
	// 		console.log("the array is filled with", $scope.arrEvents);
	// 	})
	// })	



	//GOAL: GET AN ARRAY OF ARRAYS THAT HOLD ROOMS BY GROUP ID
	//first grab an array of room id's
	//then I query $scope.events and get an array back where events have that group id
		//I do this for every room id
	//then I make an ng-repeat of ion-slides

	$scope.editEvent = function(event) {
		$state.go('app.tab.eventDetails',{eventId: event.$id});
	}
	
	$scope.createEvent = function() {
		$state.go('app.tab.chat-createNewEvent');
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
