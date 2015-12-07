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
    }
  })
});