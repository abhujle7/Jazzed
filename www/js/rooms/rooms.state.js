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
      userRoomsR: function(RoomsFactory) {
          return RoomsFactory.findUserRooms();
      }
    }
    // resolve: {
    //     "currentAuth": ["Auth",
    //         function (Auth) {
    //             return Auth.$waitForAuth();
    // }]}
  })
});