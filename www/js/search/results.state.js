app.config(function($stateProvider) {
  $stateProvider
  .state('app.tab.results', {
    cache: false,
    url: '/results',
    views: {
      'roomsView': {
        templateUrl: 'js/search/results.html',
        controller: 'ResultsCtrl'
       }
    }
   })
});