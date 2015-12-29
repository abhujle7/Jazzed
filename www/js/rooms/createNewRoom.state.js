app.config(function($stateProvider) {
  $stateProvider
  .state('app.tab.createNewRoom', {
    url: '/createNewRoom',
    views: {
      'roomsView': {
        templateUrl: 'js/rooms/createNewRoom.html',
        controller: 'RoomsCtrl'
      }
    },
    resolve: {
      roomIds: function() {
        return null;
      }
    }
  })
});