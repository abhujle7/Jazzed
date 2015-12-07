app.config(function($stateProvider) {
  $stateProvider
  .state('app.tab.results', {
    url: '/results',
    views: {
      'roomsView': {
        templateUrl: 'js/search/results.html',
        controller: 'ResultsCtrl'
       }
    }
   })
});