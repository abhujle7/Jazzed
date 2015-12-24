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
      roomIds: function(RoomsFactory) {
        return RoomsFactory.getUserSpecificRoomIds();
      },
      userSpecificEvents: function(EventFactory) {
        return EventFactory.getUserSpecificEvents();
      }
    }
  })
});