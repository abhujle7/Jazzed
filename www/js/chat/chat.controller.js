app.controller('ChatCtrl', function($scope, ChatFactory, $stateParams, RoomsFactory, AuthFactory, $firebaseObject, EventFactory, $state) {

  var currUser = AuthFactory.getCurrentUser().uid
  var userRef = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + currUser)
  var userObj = $firebaseObject(userRef)
  
  $scope.IM = {
    textMessage: ""
  };

  $scope.events = EventFactory.all()
  // $scope.events = [
  //   'ball',
  //   'yelp',
  //   'movies'
  // ]
    // $scope.events = EventFactory.all();


  $scope.listVisibility = false;

  $scope.revealList = function () {
    $scope.listVisibility = true;
  }

  $scope.hideList = function () {
    $scope.listVisibility = false;
  }

  // $scope.roomName = currentRoom.child('name')
// console.log('this is state params id', $stateParams.id)
  ChatFactory.selectRoom($stateParams.id);

  var roomName = ChatFactory.getSelectedRoomName();
  
  if (roomName) {
      $scope.roomName = " - " + roomName;
      $scope.chats = ChatFactory.all();
  }

  $scope.sendMessage = function (msg) {
      console.log('this is userobj', userObj)
      console.log(msg);
      ChatFactory.send(msg);
      $scope.IM.textMessage = "";
  }

  $scope.remove = function (chat) {
      ChatFactory.remove(chat);
  }


  $scope.createEvent = function() {
      $state.go('tab.createNewEvent');
  }
  // $scope.createCustomEvent = function() {
  //   //take this chat_id and send it to eventFactory
  //   EventFactory.addCustomEvent();

  // }

  $scope.goToPoll = function (event) {
    console.log('go to poll function', event)
    $state.go('tab.polls', {event: event})
  }

    // $scope.sendChat = function (chat){
    //   if ($rootScope.user) {
    //     // console.log('this is user', $rootScope.user)
    //     $scope.chats.$add({
    //       user: $rootScope.user,
    //       message: chat.message
    //     });
    //   chat.message = "";
    //   }
    // }

 })

