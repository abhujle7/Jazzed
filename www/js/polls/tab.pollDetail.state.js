app.config(function($stateProvider) {
  $stateProvider
  .state('tab.pollDetail', {
    cache: false,
    url: '/polls/:id/:eventid',
    views: {
      'pollsView': {
        templateUrl: 'js/polls/poll.detail.html',
        controller: 'PollsCtrl'
      }
    },
    resolve: {
      eventDetails: function ($stateParams, EventFactory) {
        return EventFactory.get($stateParams.eventid)
      }
    }
  })
});