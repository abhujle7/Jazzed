app.controller('ChatCtrl', function($scope, ChatFactory, $stateParams, RoomsFactory, AuthFactory, $firebaseObject, EventFactory, $state, PollsFactory, $ionicScrollDelegate, currentRoomId) {

  $ionicScrollDelegate.scrollBottom();

  var currUser = AuthFactory.getCurrentUser().uid
  var userRef = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + currUser)
  var userObj = $firebaseObject(userRef)
  
  $scope.IM = {
    textMessage: ""
  };


  $scope.polls = PollsFactory.all()
  $scope.events = EventFactory.all()
  $scope.listVisibility = false;
  $scope.pollVisibility = false;
  $scope.revealPolls = function () {
    $scope.pollVisibility = true;
  }
  $scope.revealList = function () {
    $scope.listVisibility = true;
  }

  $scope.hideList = function () {
    $scope.listVisibility = false;
  }

  ChatFactory.selectRoom($stateParams.id);

  var roomName = ChatFactory.getSelectedRoomName();
  
  if (roomName) {
      $scope.roomName = roomName;
      $scope.chats = ChatFactory.all();
  }

  $scope.sendMessage = function (msg) {
      ChatFactory.send(msg);
      $scope.IM.textMessage = "";
  }

  $scope.remove = function (chat) {
      ChatFactory.remove(chat);
  }

  $scope.createEvent = function() {
      $state.go('tab.createNewEvent');
  }

  $scope.goToSeatgeek = function() {
    $state.go('tab.search')
  }

  $scope.goToShowtimes = function() {
    $state.go('tab.movies')
  }

  $scope.goToYelp = function() {
    $state.go('tab.yelp')
  }

  $scope.goToPollDetail = function (pollObj) {
    $state.go('tab.pollDetail', {id: pollObj.$id, eventid: pollObj.event.id})
  }

  $scope.goToPoll = function (event) {
    $state.go('tab.polls', {eventid: event.$id})
  }

  $scope.goToAddContacts = function() {
    $state.go('contacts', {roomid: currentRoomId})
  }
})

