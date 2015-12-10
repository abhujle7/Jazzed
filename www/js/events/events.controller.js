app.controller('EventsCtrl', function($scope, $state, $rootScope, EventFactory, RoomsFactory, $ionicHistory, $ionicPopup, events, rooms) {


	$scope.rooms = rooms;
	$scope.events = events;
	var currentRoomId = $rootScope.currentRoom;

	
	
	var currEventId;
	// $scope.arrRooms = [];

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

	// console.log("the first room id is", rooms[0].$id);
	// console.log(EventFactory.getByRoom(rooms[0].$id));

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

	$scope.getGroupName = function (eventObj) {
		var roomId = eventObj.groups;
		var group = RoomsFactory.get(roomId)
		return group.name;
		
	}
	$scope.submitEvent = function() {
		if ($scope.data.time) {
			$scope.hours = $scope.data.time.getHours();
			$scope.minutes = $scope.data.time.getMinutes();
			$scope.data.date = moment(new Date($scope.data.day).setHours($scope.hours, $scope.minutes, 0, 0)).format('lll')
		}

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
		if ($scope.data.time) {
			$scope.hours = $scope.data.time.getHours();
			$scope.minutes = $scope.data.time.getMinutes();
			$scope.data.date = moment(new Date($scope.data.day).setHours($scope.hours, $scope.minutes, 0, 0)).format('lll')
		}
		EventFactory.addEvent($scope.data).then(function(eventId) {
			currEventId = eventId;
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
		$state.go('app.tab.chat-polls', {eventid: currEventId, id: $scope.data.group_id})
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
