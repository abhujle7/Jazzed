// angular.module('starter.controllers', [])

app.controller('ChatsCtrl', function($scope, ChatsFactory, $state) {

  $scope.IM = {
    textMessage: ""
  };

  ChatsFactory.selectRoom($state.params.roomId);

  var roomName = ChatsFactory.getSelectedRoomName();

  // Fetching Chat Records only if a Room is Selected
  if (roomName) {
      $scope.roomName = " - " + roomName;
      $scope.chats = Chats.all();
  }

  $scope.sendMessage = function (msg) {
      console.log(msg);
      Chats.send($scope.displayName, msg);
      $scope.IM.textMessage = "";
  }

  $scope.remove = function (chat) {
      ChatsFactory.remove(chat);
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

