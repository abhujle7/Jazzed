app.controller('RoomsCtrl', function($scope, RoomsFactory, ChatFactory, $state) {

    // $ionicModal.fromTemplateUrl('js/login/login.html', {
    //     scope: $scope,
    //     animation: 'slide-in-up'
    // })
    // .then(function (modal) {
    // $scope.modal = modal;
    // });
    var userRooms = RoomsFactory.findUserRooms()

    var allRooms = RoomsFactory.all();

    $scope.rooms = userRooms

    $scope.createRoom = function () {
        $state.go('tab.createNewRoom');
    }

    $scope.openRoom = function (id) {
      $state.go('tab.chat', {
        id: id
      });
    }

    $scope.addContact = function () {
        //add to firebase array in roomsfactory
    }

    $scope.saveNewRoom = function (roomObj) {
        return RoomsFactory.add(roomObj).then(function(id) {
            $scope.openRoom(id);
        })

        
        //add to firebase array in roomsfactory
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
