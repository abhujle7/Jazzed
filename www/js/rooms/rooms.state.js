app.config(function($stateProvider) {
  $stateProvider
  .state('app.tab.rooms', {
    url: '/rooms',
    cache: false,
    views: {
      'roomsView': {
        templateUrl: 'js/rooms/rooms.html',
        controller: 'RoomsCtrl'
      }
    },
    resolve: {
      roomIds: function(RoomsFactory) {
        return RoomsFactory.getUserSpecificRoomIds();
      }
    }
  })
});