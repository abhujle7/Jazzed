app.config(function($stateProvider) {
  $stateProvider
  .state('app.tab.events', {
    cache: false,
    url: '/events',
    views: {
      'eventsView': {
        templateUrl: 'js/events/events.html',
        controller: 'EventsCtrl'
      }
    },
    resolve: {
      rooms: function(RoomsFactory) {
        return RoomsFactory.allResolved();
      },
      events: function(EventFactory) {
        return EventFactory.allResolved();
      },
      userRooms: function(RoomsFactory) {
        return RoomsFactory.findUserRooms();
      }
    }
  })
});