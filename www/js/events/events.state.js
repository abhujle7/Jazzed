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
        return RoomsFactory.all();
      },
      events: function(EventFactory) {
        return EventFactory.all();
      },
      currentUserRoomsSync: function(RoomsFactory) {
        return RoomsFactory.findUserRoomsSync();
      }
    }
  })
});