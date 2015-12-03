app.config(function($stateProvider) {
  $stateProvider
  .state('tab.polls', {
    cache: false,
    url: '/polls',
    views: {
      'pollsView': {
        templateUrl: 'js/polls/createNewPoll.html',
        controller: 'PollsCtrl'
      }
    },
    params: {
      event : event
    }
  })
});