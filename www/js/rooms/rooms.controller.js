app.controller('RoomsCtrl', function($scope, RoomsFactory, ChatFactory, $state) {

    $scope.getLastMsg = function (roomObj) {
        console.log('in func, roomobj', roomObj)
        var msgRef = new Firebase('https://boiling-fire-3161.firebaseio.com/messages/' + roomObj.$id)
        console.log('this is last msg', msgRef)
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
