app.config(function($stateProvider) {
  $stateProvider
  .state('app.tab.createNewRoom', {
    cache: false,
    url: '/createNewRoom',
    views: {
      'roomsView': {
        templateUrl: 'js/rooms/createNewRoom.html',
        controller: 'RoomsCtrl'
      }
    }
  })
});