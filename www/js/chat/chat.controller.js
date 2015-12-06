app.controller('ChatCtrl', function($scope, ChatFactory, $stateParams, RoomsFactory, AuthFactory, $firebaseObject, EventFactory, $state, PollsFactory) {

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
    console.log('reveal!')
    console.log('these are polls', $scope.polls)
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
      $scope.roomName = " - " + roomName;
      $scope.chats = ChatFactory.all();
      // console.log("chats in the controller is", $scope.chats);
  }

  $scope.sendMessage = function (msg) {
      // console.log('this is userobj', userObj)
      // console.log(msg);
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
    console.log('in gotopolldetail with pollid', pollObj)
    $state.go('tab.pollDetail', {id: pollObj.$id, eventid: pollObj.event.id})
  }

  $scope.goToPoll = function (event) {
    console.log('go to poll function', event.$id)
    $state.go('tab.polls', {eventid: event.$id})
  }


 })

