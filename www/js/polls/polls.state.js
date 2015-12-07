app.config(function($stateProvider) {
  $stateProvider
  .state('app.tab.polls', {
    url: '/polls/:eventid',
    views: {
      'pollsView': {
        templateUrl: 'js/polls/createNewPoll.html',
        controller: 'PollsCtrl'
      }
    },
    resolve: {
      eventDetails: function ($stateParams, EventFactory) {
        return EventFactory.get($stateParams.eventid)
      },
      pollDetails: function () {
        return null;
      }
    }
  })
});