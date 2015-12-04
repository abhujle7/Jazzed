app.controller('ChatCtrl', function($scope, ChatFactory, $stateParams, RoomsFactory, AuthFactory, $firebaseObject, EventFactory, $state) {

  var currUser = AuthFactory.getCurrentUser().uid
  var userRef = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + currUser)
  var userObj = $firebaseObject(userRef)
  
  $scope.IM = {
    textMessage: ""
  };

  $scope.events = EventFactory.all()
  $scope.listVisibility = false;

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

  $scope.goToPoll = function (event) {
    console.log('go to poll function', event)
    $state.go('tab.polls', {event: event})
  }
 })

