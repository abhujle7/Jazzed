app.controller('EventsCtrl', function($scope, $state, $rootScope, EventFactory, RoomsFactory, $ionicHistory, $ionicPopup, events, rooms) {


	$scope.rooms = rooms;
	$scope.events = events;
	var currentRoomId = $rootScope.currentRoom;

	
	
	var currEventId;

	$scope.data = {
		name: null,
		description: null,
		image: null,
		time: null,
		date: null,
		location: null,
		locationName: null,
		group_id: currentRoomId
	};

	$scope.data.day = new Date()

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
		console.log("I submitted the  event here", $scope.data);
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
