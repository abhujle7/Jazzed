app.config(function($stateProvider) {
  $stateProvider
  .state('app.tab.chat-polls', {
    url: '/chat/:id/polls/:eventid',
    views: {
      'roomsView': {
        templateUrl: 'js/polls/createNewPoll.html',
        controller: 'PollsCtrl'
      }
    },
    resolve: {
      eventDetails: function ($stateParams, EventFactory) {
        return EventFactory.get($stateParams.eventid)
      },
      pollDetails: function() {
        return null
      }
    }
  })
});