app.controller('ChatCtrl', function($scope, ChatFactory, $stateParams, RoomsFactory, AuthFactory) {

  var user = AuthFactory.getCurrentUser()
  $scope.IM = {
    textMessage: "",
    from: user.password.email
  };

  // $scope.roomName = currentRoom.child('name')
// console.log('this is state params id', $stateParams.id)
  ChatFactory.selectRoom($stateParams.id);

  var roomName = ChatFactory.getSelectedRoomName();
  
  if (roomName) {
      $scope.roomName = " - " + roomName;
      $scope.chats = ChatFactory.all();
  }

  $scope.sendMessage = function (msg) {
      console.log('this is user', user)
      console.log(msg);
      ChatFactory.send(msg);
      $scope.IM.textMessage = "";
  }

  $scope.remove = function (chat) {
      ChatFactory.remove(chat);
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

