app.controller('EventsCtrl', function($scope, $state, EventFactory, RoomsFactory, $ionicHistory, $ionicPopup, rooms, events) {


	$scope.rooms = rooms;
	$scope.events = events;
	console.log("rooms are", rooms);
	console.log("events are", events);
	
	var currEventId;
	// $scope.arrRooms = [];

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

	// rooms.forEach(function(room) {
	// 	$scope.arrRooms.push(EventFactory.getByRoom(room.$id));
	// })

	// console.log("the array of rooms by group Id is", $scope.arrRooms);

	// console.log("the first room id is", rooms[0].$id);
	console.log(EventFactory.getByRoom(rooms[0].$id));

	//GOAL: GET AN ARRAY OF ARRAYS THAT HOLD ROOMS BY GROUP ID
	//first grab an array of room id's
	//then I query $scope.events and get an array back where events have that group id
		//I do this for every room id
	//then I make an ng-repeat of ion-slides

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
