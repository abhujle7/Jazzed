app.controller('RoomsCtrl', function($scope, RoomsFactory, ChatFactory, $state, roomIds, $firebaseArray) {

    var ref = new Firebase('https://boiling-fire-3161.firebaseio.com/')

    $scope.getLastMsg = function(roomId) {
        return RoomsFactory.getLastMessage(roomId)
    }
    var userRooms = RoomsFactory.findUserRooms()

    var allRooms = RoomsFactory.all();

    $scope.rooms = userRooms

    $scope.createRoom = function () {
        $state.go('app.tab.createNewRoom');
    }

    $scope.openRoom = function (id) {
      $state.go('app.tab.chat', {
        id: id
      });
    }

    $scope.saveNewRoom = function (roomObj) {
        return RoomsFactory.add(roomObj).then(function(id) {
            $scope.openRoom(id);
        })
    }
 })
