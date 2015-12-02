app.config(function($stateProvider) {
  $stateProvider
  .state('tab.events', {
    cache: false,
    url: '/events',
    views: {
      'eventsView': {
        templateUrl: 'js/events/events.html',
        controller: 'EventsCtrl'
      }
    }
  })
});